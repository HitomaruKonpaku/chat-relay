import { DatabaseModule } from '@/app/database'
import { DatabaseQueueModule } from '@/app/database-queue'
import { Global, Module } from '@nestjs/common'
import { DatabaseInsertProcessor } from './processor/database-insert.processor'

@Global()
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
