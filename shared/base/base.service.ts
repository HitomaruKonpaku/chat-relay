/* eslint-disable @typescript-eslint/no-unused-vars */

import { FindOptionsWhere, InsertResult, ObjectId, UpdateResult } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { UpsertOptions } from 'typeorm/repository/UpsertOptions'
import { BaseRepository } from './base.repository'

export abstract class BaseService<T> {
  constructor(
    public readonly repository: BaseRepository<T>,
  ) { }

  public async getById(id: string, opts?: any): Promise<T> {
    const res = await this.repository.getById(id)
    return res
  }

  public async getByIds(ids: string[], opts?: any): Promise<T[]> {
    const res = await this.repository.getByIds(ids)
    return res
  }

  public async update(
    criteria: string | string[] | number | number[] | Date | Date[] | ObjectId | ObjectId[] | FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    const res = this.repository.repository.update(criteria, partialEntity)
    return res
  }

  public async upsert(
    entityOrEntities: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
    conflictPathsOrOptions: string[] | UpsertOptions<T>,
  ): Promise<InsertResult> {
    const res = await this.repository.repository.upsert(entityOrEntities, conflictPathsOrOptions)
    return res
  }
}
