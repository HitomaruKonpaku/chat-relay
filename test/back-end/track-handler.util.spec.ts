import { Track } from '@app/track'
import { UserFilterType } from '@app/user'
import { TrackHandlerUtil } from '../../apps/back-end/src/util/track-handler.util'

describe('TrackHandlerUtil', () => {
  describe('canRelay', () => {
    it('ayame send message in ayame', () => {
      const authorId = 'UC7fk0CB07ly8oSl0aqKkqFg'
      const hostId = 'UC7fk0CB07ly8oSl0aqKkqFg'
      const message = 'hello'

      const track: Partial<Track> = {
        sourceId: 'UC7fk0CB07ly8oSl0aqKkqFg',
      }

      const result = TrackHandlerUtil.canRelay(track, authorId, hostId, message)
      expect(result).toBe(true)
    })

    it('ayame send message in met', () => {
      const authorId = 'UC7fk0CB07ly8oSl0aqKkqFg'
      const hostId = 'UCzUNASdzI4PV5SlqtYwAkKQ'
      const message = 'hello'

      const track: Partial<Track> = {
        filterId: 'UC7fk0CB07ly8oSl0aqKkqFg',
      }

      const result = TrackHandlerUtil.canRelay(track, authorId, hostId, message)
      expect(result).toBe(true)
    })

    it('met send message in ayame', () => {
      const authorId = 'UCzUNASdzI4PV5SlqtYwAkKQ'
      const hostId = 'UC7fk0CB07ly8oSl0aqKkqFg'
      const message = 'hello'

      const track: Partial<Track> = {
        sourceId: 'UC7fk0CB07ly8oSl0aqKkqFg',
        filterId: 'UCzUNASdzI4PV5SlqtYwAkKQ',
      }

      const result = TrackHandlerUtil.canRelay(track, authorId, hostId, message)
      expect(result).toBe(true)
    })

    it('met send message in ayame (ALLOW)', () => {
      const authorId = 'UCzUNASdzI4PV5SlqtYwAkKQ'
      const hostId = 'UC7fk0CB07ly8oSl0aqKkqFg'
      const message = 'hello'

      const track: Partial<Track> = {
      }

      const result = TrackHandlerUtil.canRelay(track, authorId, hostId, message, { type: UserFilterType.ALLOW })
      expect(result).toBe(true)
    })

    it('met send message in ayame (DENY)', () => {
      const authorId = 'UCzUNASdzI4PV5SlqtYwAkKQ'
      const hostId = 'UC7fk0CB07ly8oSl0aqKkqFg'
      const message = 'hello'

      const track: Partial<Track> = {
      }

      const result = TrackHandlerUtil.canRelay(track, authorId, hostId, message, { type: UserFilterType.DENY })
      expect(result).toBe(false)
    })

    it('leche send message in ayame (TL)', () => {
      const authorId = 'UC-ORlsiOfeFrWJyxqnQrxhA'
      const hostId = 'UC7fk0CB07ly8oSl0aqKkqFg'
      const message = '[en] test'

      const track: Partial<Track> = {
        sourceId: 'UC7fk0CB07ly8oSl0aqKkqFg',
        filterId: 'UC-ORlsiOfeFrWJyxqnQrxhA',
        filterKeywords: ['[en]'],
      }

      const result = TrackHandlerUtil.canRelay(track, authorId, hostId, message)
      expect(result).toBe(true)
    })

    it('leche send message in ayame (non-TL)', () => {
      const authorId = 'UC-ORlsiOfeFrWJyxqnQrxhA'
      const hostId = 'UC7fk0CB07ly8oSl0aqKkqFg'
      const message = 'test'

      const track: Partial<Track> = {
        sourceId: 'UC7fk0CB07ly8oSl0aqKkqFg',
        filterId: 'UC-ORlsiOfeFrWJyxqnQrxhA',
        filterKeywords: ['[en]'],
      }

      const result = TrackHandlerUtil.canRelay(track, authorId, hostId, message)
      expect(result).toBe(false)
    })

    it('SPわんころ send message in korone (TL)', () => {
      const authorId = 'UCC_anWkWdchPMdJZVqGs4mQ'
      const hostId = 'UChAnqc_AY5_I3Px5dig3X1Q'
      const message = '[en] test'

      const track: Partial<Track> = {
        sourceId: 'UC7fk0CB07ly8oSl0aqKkqFg',
        filterId: 'UCC_anWkWdchPMdJZVqGs4mQ',
        filterKeywords: ['[en]'],
      }

      const result = TrackHandlerUtil.canRelay(track, authorId, hostId, message)
      expect(result).toBe(false)
    })

    it('someone send message in ayame (1)', () => {
      const authorId = 'UCOrGTArifSJJID5nATW0nPw'
      const hostId = 'UC7fk0CB07ly8oSl0aqKkqFg'
      const message = 'test'

      const track: Partial<Track> = {
      }

      const result = TrackHandlerUtil.canRelay(track, authorId, hostId, message)
      expect(result).toBe(false)
    })

    it('someone send message in ayame (2)', () => {
      const authorId = 'UCOrGTArifSJJID5nATW0nPw'
      const hostId = 'UC7fk0CB07ly8oSl0aqKkqFg'
      const message = 'test'

      const track: Partial<Track> = {
        sourceId: 'UC7fk0CB07ly8oSl0aqKkqFg',
      }

      const result = TrackHandlerUtil.canRelay(track, authorId, hostId, message)
      expect(result).toBe(false)
    })

    it('someone send message in ayame (3)', () => {
      const authorId = 'UCOrGTArifSJJID5nATW0nPw'
      const hostId = 'UC7fk0CB07ly8oSl0aqKkqFg'
      const message = 'test'

      const track: Partial<Track> = {
        filterId: 'UC7fk0CB07ly8oSl0aqKkqFg',
      }

      const result = TrackHandlerUtil.canRelay(track, authorId, hostId, message)
      expect(result).toBe(false)
    })

    it('someone send message in ayame (4)', () => {
      const authorId = 'UCOrGTArifSJJID5nATW0nPw'
      const hostId = 'UC7fk0CB07ly8oSl0aqKkqFg'
      const message = 'test'

      const track: Partial<Track> = {
        sourceId: 'UC7fk0CB07ly8oSl0aqKkqFg',
        filterId: 'UC-ORlsiOfeFrWJyxqnQrxhA',
      }

      const result = TrackHandlerUtil.canRelay(track, authorId, hostId, message)
      expect(result).toBe(false)
    })
  })
})
