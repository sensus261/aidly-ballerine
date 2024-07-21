import { PrismaService } from '@/prisma/prisma.service';
import { ProjectScopeService } from '@/project/project-scope.service';
import type { TProjectIds } from '@/types';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FilterModel } from './filter.model';

@Injectable()
export class FilterRepository {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly scopeService: ProjectScopeService,
  ) {}

  async create<T extends Prisma.FilterCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.FilterCreateArgs>,
  ) {
    return await this.prisma.filter.create(args);
  }

  async findMany<T extends Prisma.FilterFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.FilterFindManyArgs>,
    projectIds: TProjectIds,
  ) {
    return await this.prisma.filter.findMany(this.scopeService.scopeFindMany(args, projectIds));
  }

  async count<T extends Prisma.FilterCountArgs>(
    args: Prisma.SelectSubset<T, Prisma.FilterCountArgs>,
    projectIds: TProjectIds,
  ) {
    return await this.prisma.filter.count(this.scopeService.scopeFindMany(args, projectIds) as any);
  }

  async findById(id: string, args: Prisma.FilterFindFirstArgs, projectIds: TProjectIds) {
    return await this.prisma.filter.findFirst(
      this.scopeService.scopeFindFirst(
        {
          ...args,
          where: { ...args?.where, id: id },
        },
        projectIds,
      ),
    );
  }

  async updateById(id: string, args: Prisma.FilterUpdateArgs): Promise<FilterModel> {
    return await this.prisma.filter.update({
      ...args,
      where: { ...args.where, id: id },
    });
  }
}
