import { DatabaseModule } from '@app/database'
import { DiscordModule } from '@app/discord'
import { QueueModule } from '@app/queue'
import { QueueBoardModule } from '@app/queue-board'
import { TrackModule } from '@app/track'
import { TwitchModule } from '@app/twitch'
import { UserModule } from '@app/user'
import { YoutubeModule } from '@app/youtube'
import { Module } from '@nestjs/common'
import { BackEndController } from './back-end.controller'
import { BackEndService } from './back-end.service'
import { YoutubeModule as InternalYoutubeModule } from './module/youtube/youtube.module'

@Module({
  imports: [
    DatabaseModule,
    QueueModule,
    QueueBoardModule,

    UserModule,
    TrackModule,
    DiscordModule,
    YoutubeModule,
    TwitchModule,

    InternalYoutubeModule,
  ],
  controllers: [
    BackEndController,
  ],
  providers: [
    BackEndService,
  ],
})
export class BackEndModule { }
