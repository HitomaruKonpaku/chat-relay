import { QueueModule } from '@/app/queue'
import { QueueBoardModule } from '@/app/queue-board'
import { Module } from '@nestjs/common'
import { DashboardController } from './dashboard.controller'

@Module({
  imports: [
    QueueModule,
    QueueBoardModule,
  ],
  controllers: [
    DashboardController,
  ],
})
export class DashboardModule { }
