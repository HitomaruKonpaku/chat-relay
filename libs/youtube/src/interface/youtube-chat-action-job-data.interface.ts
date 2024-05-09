import { Action } from 'masterchat'
import { YoutubeChatMetadata } from './youtube-chat-metadata.interface'

export interface YoutubeChatActionJobData<T extends Action = Action> extends YoutubeChatMetadata {
  action: T
}
