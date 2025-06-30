import { DatabaseModule } from '@/app/database'
import { QueueModule } from '@/app/queue'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from '../../../config/configuration'
import { ApiController } from './api.controller'
import { ApiService } from './api.service'
import { QueueModule as ApiQueue } from './queue/queue.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    QueueModule,

    DatabaseModule,

    ApiQueue,
  ],
  controllers: [
    ApiController,
  ],
  providers: [
    ApiService,
  ],
})
export class ApiModule { }
