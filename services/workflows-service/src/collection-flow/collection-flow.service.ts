import { BusinessService } from '@/business/business.service';
import { UpdateFlowDto } from '@/collection-flow/dto/update-flow-input.dto';
import { FlowConfigurationModel } from '@/collection-flow/models/flow-configuration.model';
import { UiDefDefinition, UiSchemaStep } from '@/collection-flow/models/flow-step.model';
import { AppLoggerService } from '@/common/app-logger/app-logger.service';
import { type ITokenScope } from '@/common/decorators/token-scope.decorator';
import { CustomerService } from '@/customer/customer.service';
import { TCustomerWithFeatures } from '@/customer/types';
import { EndUserService } from '@/end-user/end-user.service';
import { NotFoundException } from '@/errors';
import { FileService } from '@/providers/file/file.service';
import {
  ITranslationServiceResource,
  TranslationService,
} from '@/providers/translation/translation.service';
import type { TProjectId, TProjectIds } from '@/types';
import { UiDefinitionService } from '@/ui-definition/ui-definition.service';
import { WorkflowRuntimeDataRepository } from '@/workflow/workflow-runtime-data.repository';
import { WorkflowService } from '@/workflow/workflow.service';
import { AnyRecord, DefaultContextSchema, TCollectionFlowConfig } from '@ballerine/common';
import { BUILT_IN_EVENT } from '@ballerine/workflow-core';
import { Injectable } from '@nestjs/common';
import { EndUser, Prisma, UiDefinition, WorkflowRuntimeData } from '@prisma/client';
import { randomUUID } from 'crypto';
import get from 'lodash/get';

@Injectable()
export class CollectionFlowService {
  constructor(
    protected readonly logger: AppLoggerService,
    protected readonly endUserService: EndUserService,
    protected readonly workflowRuntimeDataRepository: WorkflowRuntimeDataRepository,
    protected readonly workflowService: WorkflowService,
    protected readonly businessService: BusinessService,
    protected readonly uiDefinitionService: UiDefinitionService,
    protected readonly customerService: CustomerService,
    protected readonly fileService: FileService,
  ) {}

  async getCustomerDetails(projectId: TProjectId): Promise<TCustomerWithFeatures> {
    return this.customerService.getByProjectId(projectId);
  }

  async getUser(endUserId: string, projectId: TProjectId): Promise<EndUser> {
    return await this.endUserService.getById(endUserId, {}, [projectId]);
  }

  traverseUiSchema(
    uiSchema: Record<string, unknown>,
    context: WorkflowRuntimeData['context'],
    language: string,
    _translationService: TranslationService,
  ) {
    for (const key in uiSchema) {
      if (typeof uiSchema[key] === 'object' && uiSchema[key] !== null) {
        // If the property is an object (including arrays), recursively traverse it
        // @ts-expect-error - error from Prisma types fix
        this.traverseUiSchema(uiSchema[key], context, language, _translationService);
      } else if (typeof uiSchema[key] === 'string') {
        const options: AnyRecord = {};

        if (uiSchema.labelVariables) {
          Object.entries(uiSchema.labelVariables).forEach(([key, value]) => {
            options[key] = get(context, value);
          });
        }

        uiSchema[key] = _translationService.translate(uiSchema[key] as string, language, options);
      }
    }

    return uiSchema;
  }

  async getFlowConfiguration(
    workflowDefinitionId: string,
    context: WorkflowRuntimeData['context'],
    language: string,
    projectIds: TProjectIds,
    args?: Prisma.UiDefinitionFindFirstOrThrowArgs,
  ): Promise<FlowConfigurationModel> {
    const workflowDefinition = await this.workflowService.getWorkflowDefinitionById(
      workflowDefinitionId,
      {},
      projectIds,
    );

    const uiDefinition = await this.uiDefinitionService.getByWorkflowDefinitionId(
      workflowDefinition.id,
      'collection_flow' as const,
      projectIds,
      args,
    );

    const translationService = new TranslationService(
      this.getTranslationServiceResources(uiDefinition),
    );

    await translationService.init();

    return {
      id: workflowDefinition.id,
      config: workflowDefinition.config,
      uiOptions: uiDefinition.uiOptions,
      uiSchema: {
        // @ts-expect-error - error from Prisma types fix
        elements: this.traverseUiSchema(
          // @ts-expect-error - error from Prisma types fix
          uiDefinition.uiSchema.elements,
          context,
          language,
          translationService,
        ) as UiSchemaStep[],
        theme: uiDefinition.theme,
      },
      definition: uiDefinition.definition
        ? (uiDefinition.definition as unknown as UiDefDefinition)
        : undefined,
    };
  }

  private getTranslationServiceResources(
    uiDefinition: UiDefinition & { locales?: unknown },
  ): ITranslationServiceResource[] | undefined {
    if (!uiDefinition.locales) return undefined;

    return Object.entries(uiDefinition.locales).map(([language, resource]) => ({
      language,
      resource,
    }));
  }

  // async updateFlowConfiguration(
  //   configurationId: string,
  //   steps: UiSchemaStep[],
  //   projectIds: TProjectIds,
  //   projectId: TProjectId,
  // ): Promise<FlowConfigurationModel> {
  //   const definition = await this.workflowDefinitionRepository.findById(
  //     configurationId,
  //     {},
  //     projectIds,
  //   );

  //   const providedStepsMap = keyBy(steps, 'key');

  //   const persistedSteps =
  //     // @ts-expect-error - error from Prisma types fix
  //     definition.definition?.states?.data_collection?.metadata?.uiSettings?.multiForm?.steps || [];

  //   const mergedSteps = persistedSteps.map((step: any) => {
  //     const stepToMergeIn = providedStepsMap[step.key];

  //     if (stepToMergeIn) {
  //       return recursiveMerge(step, stepToMergeIn);
  //     }

  //     return step;
  //   });

  //   const updatedDefinition = await this.workflowDefinitionRepository.updateById(
  //     configurationId,
  //     {
  //       data: {
  //         definition: {
  //           // @ts-expect-error - revisit after JSONB validation task - error from Prisma types fix
  //           ...definition?.definition,
  //           states: {
  //             // @ts-expect-error - revisit after JSONB validation task - error from Prisma types fix
  //             ...definition.definition?.states,
  //             data_collection: {
  //               // @ts-expect-error - revisit after JSONB validation task - error from Prisma types fix
  //               ...definition.definition?.states?.data_collection,
  //               metadata: {
  //                 uiSettings: {
  //                   multiForm: {
  //                     steps: mergedSteps,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //     projectIds,
  //   );

  //   return plainToClass(FlowConfigurationModel, {
  //     id: updatedDefinition.id,
  //     steps:
  //       // @ts-expect-error - revisit after JSONB validation task - error from Prisma types fix
  //       updatedDefinition.definition?.states?.data_collection?.metadata?.uiSettings?.multiForm
  //         ?.steps || [],
  //   });
  // }

  async getActiveFlow(workflowRuntimeId: string, projectIds: TProjectIds) {
    this.logger.log(`Getting active workflow ${workflowRuntimeId}`);

    const workflowData = await this.workflowRuntimeDataRepository.findById(
      workflowRuntimeId,
      {},
      projectIds,
    );

    this.logger.log('Active workflow', { workflowId: workflowData ? workflowData.id : null });

    return workflowData ? workflowData : null;
  }

  async updateWorkflowRuntimeLanguage(language: string, tokenScope: ITokenScope) {
    const workflowRuntime = await this.workflowService.getWorkflowRuntimeDataById(
      tokenScope.workflowRuntimeDataId,
      {},
      [tokenScope.projectId] as TProjectIds,
    );

    return await this.workflowService.updateWorkflowRuntimeLanguage(
      workflowRuntime.id,
      language,
      tokenScope.projectId,
    );
  }

  async syncWorkflow(payload: UpdateFlowDto, tokenScope: ITokenScope) {
    if (payload.data.endUser && tokenScope.endUserId) {
      const { ballerineEntityId: _, ...endUserData } = payload.data.endUser;
      await this.endUserService.updateById(tokenScope.endUserId, { data: endUserData });
    }

    if (payload.data.ballerineEntityId && payload.data.business) {
      await this.businessService.updateById(payload.data.ballerineEntityId, {
        data: payload.data.business,
      });
    }

    return await this.workflowService.event(
      {
        id: tokenScope.workflowRuntimeDataId,
        name: BUILT_IN_EVENT.UPDATE_CONTEXT,
        payload: {
          context: payload.data.context,
        },
      },
      [tokenScope.projectId],
      tokenScope.projectId,
    );
  }

  async uploadNewFile(projectId: string, workflowRuntimeDataId: string, file: Express.Multer.File) {
    // upload file into a customer folder
    const customer = await this.customerService.getByProjectId(projectId);

    const runtimeDataId = await this.workflowService.getWorkflowRuntimeDataById(
      workflowRuntimeDataId,
      {},
      [projectId],
    );

    const entityId = runtimeDataId.businessId || runtimeDataId.endUserId;

    if (!entityId) {
      throw new NotFoundException("Workflow doesn't exists");
    }

    // Remove file extension (get everything before the last dot)
    const nameWithoutExtension = (file.originalname || randomUUID()).replace(/\.[^.]+$/, '');
    // Remove non characters
    const alphabeticOnlyName = nameWithoutExtension.replace(/\W/g, '');

    return await this.fileService.copyToDestinationAndCreate(
      {
        id: alphabeticOnlyName,
        uri: file.path,
        provider: 'file-system',
        fileName: file.originalname,
      },
      entityId,
      projectId,
      customer.name,
      { shouldDownloadFromSource: false },
    );
  }

  async getCollectionFlowContext(
    tokenScope: ITokenScope,
  ): Promise<{ context: DefaultContextSchema; config: TCollectionFlowConfig }> {
    const workflowRuntimeData = await this.workflowService.getWorkflowRuntimeDataById(
      tokenScope.workflowRuntimeDataId,
      { select: { context: true, state: true, config: true } },
      [tokenScope.projectId],
    );

    return {
      context: workflowRuntimeData.context,
      config: workflowRuntimeData.config,
    };
  }
}
