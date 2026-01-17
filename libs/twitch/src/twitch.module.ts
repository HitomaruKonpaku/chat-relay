import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TwitchService } from './twitch.service'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
    ]),
  ],
  providers: [
    TwitchService,
  ],
  exports: [
    TwitchService,
  ],
})
export class TwitchModule { }
