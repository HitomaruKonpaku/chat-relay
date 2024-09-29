import { UserSourceType } from '@/app/user'

export interface TrackRemove {
  discordChannelId: string,
  sourceType: UserSourceType
  sourceId: string
  filterId: string
}
