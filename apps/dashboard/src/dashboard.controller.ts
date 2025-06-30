import { Controller, Get, Redirect } from '@nestjs/common'

@Controller()
export class DashboardController {
  @Get()
  @Redirect('/queues', 302)
  getQueues() {
    // ignore
  }
}
