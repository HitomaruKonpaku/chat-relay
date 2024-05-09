/* eslint-disable @typescript-eslint/no-unused-vars */

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
}
