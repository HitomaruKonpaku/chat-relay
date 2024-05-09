import { Injectable } from '@nestjs/common'

@Injectable()
export class BackEndService {
  getHello(): string {
    return 'Hello World!'
  }
}
