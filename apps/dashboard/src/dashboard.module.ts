import { DatabaseModule } from '@app/database'
import { DatabaseQueueModule } from '@app/database-queue'
import { DiscordModule } from '@app/discord'
import { QueueModule } from '@app/queue'
import { QueueBoardModule } from '@app/queue-board'
import { YoutubeModule } from '@app/youtube'
import { Module } from '@nestjs/common'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
  imports: [
    QueueModule,
    QueueBoardModule,
    DatabaseModule,
    DatabaseQueueModule,
    DiscordModule,
    YoutubeModule,
  ],
  controllers: [
    DashboardController,
  ],
  providers: [
    DashboardService,
  ],
})
export class DashboardModule { }
