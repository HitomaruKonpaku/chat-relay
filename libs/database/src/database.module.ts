import { MasterchatEntity } from '@/app/masterchat'
import { Track } from '@/app/track'
import { UserFilter, UserPool } from '@/app/user'
import { YoutubeChannel, YoutubeChatAction, YoutubeChatActionChat, YoutubeVideo } from '@/app/youtube'
import configuration from '@/config/configuration'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BooleanUtil } from '../../../shared/util/boolean.util'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        synchronize: BooleanUtil.fromString(configService.get('DB_SYNCHRONIZE')),
        logging: false,
        entities: [
          UserPool,
          UserFilter,

          Track,

          YoutubeChannel,
          YoutubeVideo,
          YoutubeChatAction,
          YoutubeChatActionChat,

          MasterchatEntity,
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule { }
