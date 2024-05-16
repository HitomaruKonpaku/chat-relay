import { DiscordMessageRelayQueueService } from '@app/discord'
import { Track, TrackService } from '@app/track'
import { UserSourceType } from '@app/user'
import {
  YoutubeChatActionJobData,
  YoutubeChatUtil,
  YoutubeVideoUtil,
} from '@app/youtube'
import { QUEUE_MAX_STALLED_COUNT } from '@constant/common.constant'
import { YOUTUBE_CHAT_POLL_QUEUE_NAME } from '@constant/youtube.constant'
import { Processor } from '@nestjs/bullmq'
import { BaseProcessor } from '@shared/base/base.processor'
import { Logger } from '@shared/logger/logger'
import { NumberUtil } from '@shared/util/number.util'
import { Job } from 'bullmq'
import { codeBlock, hideLinkEmbed, hyperlink } from 'discord.js'
import {
  AddPollResultAction,
  ShowPollPanelAction,
  UpdatePollAction,
  stringify,
} from 'masterchat'

type ProcessAction = ShowPollPanelAction | UpdatePollAction | AddPollResultAction

@Processor(YOUTUBE_CHAT_POLL_QUEUE_NAME, {
  // autorun: false,
  maxStalledCount: QUEUE_MAX_STALLED_COUNT,
  concurrency: NumberUtil.parse(process.env.YOUTUBE_CHAT_POLL_QUEUE_CONCURRENCY, 1),
})
export class YoutubeChatPollProcessor extends BaseProcessor {
  protected readonly logger = new Logger(YoutubeChatPollProcessor.name)

  constructor(
    private readonly trackService: TrackService,
    private readonly discordMessageRelayQueueService: DiscordMessageRelayQueueService,
  ) {
    super()
  }

  async process(job: Job<YoutubeChatActionJobData<ProcessAction>>): Promise<any> {
    const res = await this.handle(job)
    await job.updateProgress(100)
    return res.map((v) => v.id)
  }

  protected async handle(job: Job<YoutubeChatActionJobData<ProcessAction>>) {
    const isPollAction = false
      || YoutubeChatUtil.isShowPollPanelActionAction(job.data.action)
      || YoutubeChatUtil.isUpdatePollActionAction(job.data.action)
      || YoutubeChatUtil.isAddPollResultActionAction(job.data.action)
    if (!isPollAction) {
      throw new Error(`unhandleAction: ${job.data.action.type}`)
    }

    const tracks = await this.fetchTracks(job.data.channel.id)
    if (!tracks.length) {
      return []
    }

    await Promise.allSettled(tracks.map((track) => this.handleTrack(track, job.data)))
    return tracks
  }

  protected async handleTrack(track: Track, data: YoutubeChatActionJobData<ProcessAction>) {
    if (!data.video.isLive && !track.allowReplay) {
      return
    }
    if (data.video.isMembersOnly && !track.allowMemberChat) {
      return
    }
    if (!data.video.isMembersOnly && !track.allowPublicChat) {
      return
    }

    const { action } = data
    const lines: string[] = []

    const addQuestion = (question: string, total?: string) => lines.push(
      codeBlock(
        'text',
        [
          question,
          total ? `(total: ${total})` : null,
        ].filter((v) => v).join('\n'),
      ),
    )

    const addChoice = (text: string, votePercentage?: string) => lines.push(
      [
        codeBlock(text),
        votePercentage ? codeBlock(votePercentage) : null,
      ].filter((v) => v).join(''),
    )

    if (YoutubeChatUtil.isShowPollPanelActionAction(action)) {
      if (action.question) {
        addQuestion(action.question)
      }
      action.choices.forEach((choice) => addChoice(stringify(choice.text), choice.votePercentage?.simpleText))
    } else if (YoutubeChatUtil.isUpdatePollActionAction(action)) {
      if (action.question) {
        addQuestion(action.question, String(action.voteCount))
      }
      action.choices.forEach((choice) => addChoice(stringify(choice.text), choice.votePercentage?.simpleText))
    } else if (YoutubeChatUtil.isAddPollResultActionAction(action)) {
      if (action.question) {
        addQuestion(stringify(action.question), action.total)
      }
      action.choices.forEach((choice) => addChoice(stringify(choice.text), choice.votePercentage))
    }

    const link = hyperlink(
      data.video.id,
      hideLinkEmbed(YoutubeVideoUtil.getUrl(data.video.id)),
      [
        data.channel.name || data.channel.id,
        data.video.title || data.video.id,
      ].join('\n'),
    )

    lines.unshift(`「${link}」 POLL: ${data.action.type}`)

    const content = lines.join('\n')
    await this.queueMsgRelay(track, data, content)
  }

  protected async fetchTracks(hostId: string): Promise<Track[]> {
    const tracks = await this.trackService.findByHostId(
      UserSourceType.YOUTUBE,
      hostId,
    )
    return tracks
  }

  protected async queueMsgRelay(
    track: Track,
    data: YoutubeChatActionJobData<ProcessAction>,
    content: string,
  ) {
    await this.discordMessageRelayQueueService.add(
      {
        channelId: track.discordChannelId,
        content,
        metadata: {
          source: UserSourceType.YOUTUBE,
          channel: data.channel,
          video: data.video,
          action: {
            type: data.action.type,
            id: data.action.id,
          },
        },
      },
    )
  }
}
