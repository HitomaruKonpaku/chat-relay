import { Controller, Get } from '@nestjs/common'
import { BackEndService } from './back-end.service'

@Controller()
export class BackEndController {
  constructor(private readonly backEndService: BackEndService) { }

  @Get()
  getHello(): string {
    return this.backEndService.getHello()
  }
}
