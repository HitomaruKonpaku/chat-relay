import { DatabaseModule } from '@/app/database'
import { DatabaseQueueModule } from '@/app/database-queue'
import { Module } from '@nestjs/common'
import { DatabaseInsertProcessor } from './processor/database-insert.processor'

@Module({
  imports: [
    DatabaseModule,
    DatabaseQueueModule,
  ],
  providers: [
    DatabaseInsertProcessor,
  ],
  exports: [
    DatabaseInsertProcessor,
  ],
})
export class DatabaseProcessorModule { }
