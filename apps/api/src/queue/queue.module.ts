import { YoutubeModule } from '@/app/youtube'
import { Global, Module } from '@nestjs/common'
import { QueueVideoController } from './controller/queue-video.controller'
import { QueueVideoService } from './service/queue-video.service'

@Global()
@Module({
  imports: [
    YoutubeModule,
  ],
  controllers: [
    QueueVideoController,
  ],
  providers: [
    QueueVideoService,
  ],
})
export class QueueModule { }
