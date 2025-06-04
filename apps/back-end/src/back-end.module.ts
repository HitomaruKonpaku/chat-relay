import { DatabaseModule } from '@/app/database'
import { DatabaseProcessorModule } from '@/app/database-processor'
import { DatabaseQueueModule } from '@/app/database-queue'
import { DiscordModule } from '@/app/discord'
import { QueueModule } from '@/app/queue'
import { TrackModule } from '@/app/track'
import { TwitchModule } from '@/app/twitch'
import { UserModule } from '@/app/user'
import { YoutubeModule } from '@/app/youtube'
import configuration from '@/config/configuration'
import { createKeyv } from '@keyv/redis'
import { CacheModule, CacheOptions } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import ms, { StringValue } from 'ms'
import { BackEndController } from './back-end.controller'
import { BackEndService } from './back-end.service'
import { YoutubeModule as InternalYoutubeModule } from './module/youtube/youtube.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const url = new URL('redis://')
        url.host = configService.get('REDIS_HOST')
        url.port = configService.get('REDIS_PORT')
        const opts: CacheOptions = {
          stores: [
            createKeyv(url.href),
          ],
          ttl: ms(configService.get<StringValue>('CACHE_TTL')),
        }
        return opts
      },
      inject: [ConfigService],
      isGlobal: true,
    }),

    QueueModule,

    DatabaseModule,
    DatabaseQueueModule,
    DatabaseProcessorModule,

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
