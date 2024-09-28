import { Track } from '@app/track'
import { YoutubeChatMetadata } from '@app/youtube'
import { ProcessAction } from '../../apps/back-end/src/module/youtube/base/base-action-handler'
import { YoutubeChatHandlerUtil } from '../../apps/back-end/src/module/youtube/util/youtube-chat-handler.util'

describe('YoutubeChatHandlerUtil', () => {
  const data: YoutubeChatMetadata = {
    channel: {
      id: 'UC7fk0CB07ly8oSl0aqKkqFg',
    },
    video: {
      id: 'q8Kbl-HjkQ8',
      isLive: true,
      isMembersOnly: false,
    },
  } as YoutubeChatMetadata

  const action: ProcessAction = {
    type: 'addChatItemAction',
    authorChannelId: 'UC7fk0CB07ly8oSl0aqKkqFg',
    timestamp: new Date().toISOString() as any as Date,
    message: [{ text: 'test' }],
  } as ProcessAction

  const track: Track = {
    sourceId: 'UC7fk0CB07ly8oSl0aqKkqFg',
    filterId: '',
    allowPublicChat: true,
  } as Track

  describe('canRelay', () => {
    it('ayame send message (live)', () => {
      const result = YoutubeChatHandlerUtil.canRelay(
        { ...data },
        { ...action },
        { ...track },
      )
      expect(result).toBe(true)
    })

    it('ayame send message (vod:allow)', () => {
      const result = YoutubeChatHandlerUtil.canRelay(
        {
          ...data,
          video: { id: 'q8Kbl-HjkQ8', isLive: false },
        },
        { ...action },
        { ...track, allowReplay: true },
      )
      expect(result).toBe(true)
    })

    it('ayame send message (vod:block)', () => {
      const result = YoutubeChatHandlerUtil.canRelay(
        {
          ...data,
          video: { id: 'q8Kbl-HjkQ8', isLive: false },
        },
        { ...action },
        { ...track },
      )
      expect(result).toBe(false)
    })

    it('ayame send message (membership:allow)', () => {
      const result = YoutubeChatHandlerUtil.canRelay(
        {
          ...data,
          video: { id: 'q8Kbl-HjkQ8', isLive: true, isMembersOnly: true },
        },
        { ...action },
        { ...track, allowMemberChat: true },
      )
      expect(result).toBe(true)
    })

    it('ayame send message (membership:block)', () => {
      const result = YoutubeChatHandlerUtil.canRelay(
        {
          ...data,
          video: { id: 'q8Kbl-HjkQ8', isLive: true, isMembersOnly: true },
        },
        { ...action },
        { ...track },
      )
      expect(result).toBe(false)
    })

    it('ayame send message (past) (timestamp:date)', () => {
      const result = YoutubeChatHandlerUtil.canRelay(
        { ...data },
        { ...action, timestamp: new Date(0) },
        { ...track },
      )
      expect(result).toBe(false)
    })

    it('ayame send message (past) (timestamp:string)', () => {
      const result = YoutubeChatHandlerUtil.canRelay(
        { ...data },
        { ...action, timestamp: new Date(0).toISOString() as any as Date },
        { ...track },
      )
      expect(result).toBe(false)
    })

    it('leche send message in ayame (non-TL) (no track)', () => {
      const result = YoutubeChatHandlerUtil.canRelay(
        { ...data },
        { ...action, authorChannelId: 'UC-ORlsiOfeFrWJyxqnQrxhA' },
        { ...track },
      )
      expect(result).toBe(false)
    })

    it('leche send message in ayame (non-TL) (with track)', () => {
      const result = YoutubeChatHandlerUtil.canRelay(
        { ...data },
        { ...action, authorChannelId: 'UC-ORlsiOfeFrWJyxqnQrxhA' },
        { ...track, filterId: 'UC-ORlsiOfeFrWJyxqnQrxhA', filterKeywords: ['[en]'] },
      )
      expect(result).toBe(false)
    })

    it('leche send message in ayame (TL)', () => {
      const result = YoutubeChatHandlerUtil.canRelay(
        { ...data },
        { ...action, authorChannelId: 'UC-ORlsiOfeFrWJyxqnQrxhA', message: [{ text: '[en] test' }] },
        { ...track, filterId: 'UC-ORlsiOfeFrWJyxqnQrxhA', filterKeywords: ['[en]'] },
      )
      expect(result).toBe(true)
    })
  })
})
