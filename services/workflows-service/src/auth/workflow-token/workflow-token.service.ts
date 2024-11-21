import { Injectable } from '@nestjs/common';
import { WorkflowTokenRepository } from '@/auth/workflow-token/workflow-token.repository';
import type { PrismaTransaction, TProjectId } from '@/types';

@Injectable()
export class WorkflowTokenService {
  constructor(private readonly workflowTokenRepository: WorkflowTokenRepository) {}

  async create(
    projectId: TProjectId,
    data: Parameters<typeof this.workflowTokenRepository.create>[1],
    transaction?: PrismaTransaction,
  ) {
    return await this.workflowTokenRepository.create(projectId, data, transaction);
  }

  async findByToken(token: string) {
    return await this.workflowTokenRepository.findByTokenUnscoped(token);
  }

  async findFirstByWorkflowruntimeDataIdUnscoped(token: string) {
    return await this.workflowTokenRepository.findFirstByWorkflowruntimeDataIdUnscoped(token);
  }

  async findByTokenWithExpiredUnscoped(token: string) {
    return await this.workflowTokenRepository.findByTokenWithExpiredUnscoped(token);
  }

  async deleteByToken(token: string) {
    return await this.workflowTokenRepository.deleteByTokenUnscoped(token);
  }

  async updateByToken(
    token: string,
    data: Parameters<typeof this.workflowTokenRepository.updateByToken>[1],
    transaction?: PrismaTransaction,
  ) {
    return await this.workflowTokenRepository.updateByToken(token, data, transaction);
  }
}
