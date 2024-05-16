import { QueueModule } from '@app/queue'
import { QueueBoardModule } from '@app/queue-board'
import { Module } from '@nestjs/common'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
  imports: [
    QueueModule,
    QueueBoardModule,
  ],
  controllers: [
    DashboardController,
  ],
  providers: [
    DashboardService,
  ],
})
export class DashboardModule { }
