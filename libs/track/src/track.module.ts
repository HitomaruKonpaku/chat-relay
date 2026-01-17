import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Track } from './model/track.entity'
import { TrackRepository } from './repository/track.repository'
import { TrackService } from './track.service'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Track,
    ]),
  ],
  providers: [
    TrackService,
    TrackRepository,
  ],
  exports: [
    TrackService,
    TrackRepository,
  ],
})
export class TrackModule { }
