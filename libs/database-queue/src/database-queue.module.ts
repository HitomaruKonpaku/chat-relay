import { DATABASE_INSERT_QUEUE_NAME } from '@constant/database.constant'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { QueueUtil } from '@shared/util/queue.util'
import { DatabaseInsertQueueService } from './service/database-insert-queue.service'

const queues = [
  { name: DATABASE_INSERT_QUEUE_NAME },
]

@Module({
  imports: [
    BullModule.registerQueue(
      ...QueueUtil.generateRegisterQueueOptions(queues.map((v) => v.name)),
    ),
  ],
  providers: [
    DatabaseInsertQueueService,
  ],
  exports: [
    DatabaseInsertQueueService,
  ],
})
export class DatabaseQueueModule { }
