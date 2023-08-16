import { useViewState } from '@app/common/providers/ViewStateProvider';
import { AppShell } from '@app/components/layouts/AppShell';
import { ViewHeader } from '@app/pages/CollectionFlow/components/organisms/KYBView/components/ViewHeader';
import { DocumentsContext, WorkflowFlowData } from '@app/domains/workflows/flow-data.type';
import { DynamicForm } from '@ballerine/ui';
import { useCallback, useMemo } from 'react';
import { useViewSchemas } from '@app/pages/CollectionFlow/components/organisms/KYBView/hooks/useViewSchemas';

export const CompanyDocumentsView = () => {
  const { context, state, warnings, isLoading, save, finish } = useViewState<WorkflowFlowData>();
  const { formSchema, uiSchema: _uiSchema } = useViewSchemas();

  const handleSubmit = useCallback(
    (values: DocumentsContext) => {
      void save(values).then(finalContext => {
        finish(finalContext);
      });
    },
    [save, finish],
  );

  const uiSchema = useMemo(() => {
    if (isLoading) {
      return {
        ..._uiSchema,
        'ui:options': {
          ..._uiSchema['ui:options'],
          submitButtonOptions: {
            ..._uiSchema['ui:options'].submitButtonOptions,
            isLoading,
          },
        },
      };
    }

    return _uiSchema;
  }, [isLoading]);

  return (
    <AppShell.FormContainer header={<ViewHeader />}>
      <DynamicForm<DocumentsContext>
        className="max-w-[384px]"
        schema={formSchema}
        formData={context.flowData[state] as DocumentsContext}
        uiSchema={uiSchema}
        onSubmit={values => {
          void handleSubmit(values);
        }}
        warnings={warnings}
        disabled={isLoading}
      />
    </AppShell.FormContainer>
  );
};
