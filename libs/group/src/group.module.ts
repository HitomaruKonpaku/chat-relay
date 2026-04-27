import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GroupService } from './group.service'
import { GroupChannel } from './model/group-channel.entity'
import { Group } from './model/group.entity'
import { GroupChannelRepository } from './repository/group-channel.repository'
import { GroupRepository } from './repository/group.repository'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      GroupChannel,
    ]),
  ],
  providers: [
    GroupRepository,
    GroupChannelRepository,
    GroupService,
  ],
  exports: [
    GroupRepository,
    GroupChannelRepository,
    GroupService,
  ],
})
export class GroupModule { }
