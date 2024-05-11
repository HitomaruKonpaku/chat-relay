import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import { DATABASE_INSERT_QUEUE_NAME } from '../database-queue.constant'
import { DatabaseInsertData } from '../interface/database-insert-data.interface'

@Injectable()
export class DatabaseInsertQueueService {
  constructor(
    @InjectQueue(DATABASE_INSERT_QUEUE_NAME)
    private readonly queue: Queue,
  ) { }

  public async add(data: DatabaseInsertData, options?: JobsOptions) {
    const job = await this.queue.add(
      data.table,
      data,
      {
        attempts: 5,
        removeOnComplete: {
          age: 5 * 60,
        },
        ...options,
      },
    )
    return job
  }
}
