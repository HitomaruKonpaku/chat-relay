import { DatabaseModule } from '@/app/database'
import { QueueModule } from '@/app/queue'
import configuration from '@/config/configuration'
import { ErrorInterceptor } from '@/shared/interceptor/error.interceptor'
import { LoggingInterceptor } from '@/shared/interceptor/logging.interceptor'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
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
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    ApiService,
  ],
})
export class ApiModule { }
