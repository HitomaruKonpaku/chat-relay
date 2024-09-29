import { Track } from '@/app/track'
import { UserFilter, UserPool } from '@/app/user'
import { YoutubeChannel, YoutubeChatAction, YoutubeVideo } from '@/app/youtube'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'admin',
        database: process.env.DB_DATABASE || 'postgres',
        synchronize: true,
        entities: [
          UserPool,
          UserFilter,

          Track,

          YoutubeChannel,
          YoutubeVideo,
          YoutubeChatAction,
        ],
      }),
    }),
  ],
})
export class DatabaseModule { }
