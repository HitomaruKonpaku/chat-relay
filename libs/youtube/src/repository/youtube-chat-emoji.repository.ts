import { BaseRepository } from '@/shared/base/base.repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { YoutubeChatEmoji } from '../model/youtube-chat-emoji.entity'

@Injectable()
export class YoutubeChatEmojiRepository extends BaseRepository<YoutubeChatEmoji> {
  constructor(
    @InjectRepository(YoutubeChatEmoji)
    public readonly repository: Repository<YoutubeChatEmoji>,
  ) {
    super(repository)
  }
}
