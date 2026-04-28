import { Global, Module } from '@nestjs/common'
import { HolodexService } from './holodex.service'

@Global()
@Module({
  providers: [
    HolodexService,
  ],
  exports: [
    HolodexService,
  ],
})
export class HolodexModule { }
