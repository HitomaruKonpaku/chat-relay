import { Body, Controller, Post } from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger'
import { IdDto } from '../dto/id.dto'
import { QueueVideoService } from '../service/queue-video.service'

@Controller('queue/video')
export class QueueVideoController {
  constructor(private readonly service: QueueVideoService) { }

  @Post()
  @ApiOkResponse({ type: IdDto })
  @ApiNotFoundResponse()
  queue(
    @Body() body: IdDto,
  ) {
    return this.service.queue(body)
  }
}
