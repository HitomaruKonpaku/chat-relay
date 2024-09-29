import { Track } from '@/app/track'
import { UserFilter, UserFilterType } from '@/app/user'

export class TrackHandlerUtil {
  public static canRelay(
    track: Pick<Track, 'sourceId' | 'filterId' | 'filterKeywords'>,
    authorId: string,
    hostId: string,
    message: string,
    userFilter?: Pick<UserFilter, 'type'>,
  ) {
    // eslint-disable-next-line no-param-reassign
    message = message || ''

    if (authorId === hostId) {
      if (authorId === track.filterId) {
        return false
      }

      if (authorId === track.sourceId && track.filterId) {
        return false
      }
    }

    if (userFilter) {
      return userFilter.type === UserFilterType.ALLOW
    }

    if (authorId !== track.sourceId && authorId !== track.filterId) {
      return false
    }

    if (authorId === track.filterId) {
      if (hostId !== track.sourceId && track.sourceId) {
        return false
      }

      if (
        track.filterKeywords?.length
        && !track.filterKeywords.some((keyword) => message.toLowerCase().includes(keyword.toLowerCase()))
      ) {
        return false
      }
    }

    return true
  }
}
