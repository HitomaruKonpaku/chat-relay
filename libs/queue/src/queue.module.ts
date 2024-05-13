import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT || 6379),
        },
      }),
    }),
  ],
})
export class QueueModule { }
