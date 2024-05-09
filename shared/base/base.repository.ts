import { Repository } from 'typeorm'

export abstract class BaseRepository<T> {
  constructor(
    public readonly repository: Repository<T>,
  ) { }

  public async getById(id: string): Promise<T> {
    const res = await this.repository
      .createQueryBuilder()
      .andWhere('id = :id', { id })
      .getOne()
    return res
  }

  public async getByIds(ids: string[]): Promise<T[]> {
    const res = await this.repository
      .createQueryBuilder()
      .andWhere('id IN (:...ids)', { ids })
      .getMany()
    return res
  }

  public async updateById(id: string, data: Partial<T>) {
    const res = await this.repository.update({ id } as any, data as any)
    return res
  }

  public async save(data: T) {
    const res = await this.repository.save(data)
    return res
  }
}
