import { BaseRepository } from '@/shared/base/base.repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { YoutubeChatActionChat } from '../model/youtube-chat-action-chat.entity'

@Injectable()
export class YoutubeChatActionChatRepository extends BaseRepository<YoutubeChatActionChat> {
  constructor(
    @InjectRepository(YoutubeChatActionChat)
    public readonly repository: Repository<YoutubeChatActionChat>,
  ) {
    super(repository)
  }
}
