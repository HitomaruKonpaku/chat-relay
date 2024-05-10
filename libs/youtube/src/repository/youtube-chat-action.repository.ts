import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseRepository } from '@shared/base/base.repository'
import { Repository } from 'typeorm'
import { YoutubeChatAction } from '../model/youtube-chat-action.entity'

@Injectable()
export class YoutubeChatActionRepository extends BaseRepository<YoutubeChatAction> {
  constructor(
    @InjectRepository(YoutubeChatAction)
    public readonly repository: Repository<YoutubeChatAction>,
  ) {
    super(repository)
  }
}
