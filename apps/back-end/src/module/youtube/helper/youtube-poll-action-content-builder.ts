import { PollAction, YoutubeChatActionJobData, YoutubeChatUtil, YoutubeVideoUtil } from '@/app/youtube'
import { codeBlock, hideLinkEmbed, hyperlink, inlineCode } from 'discord.js'
import { stringify } from 'masterchat'

export class YoutubePollActionContentBuilder {
  private readonly lines: string[] = []

  constructor(
    private readonly data: YoutubeChatActionJobData<PollAction>,
  ) {
    const { action } = data

    this.addTitle()

    if (YoutubeChatUtil.isShowPollPanelActionAction(action)) {
      this.addQuestion(action.question)
      action.choices.forEach((choice) => this.addChoice(stringify(choice.text), choice.votePercentage?.simpleText))
    } else if (YoutubeChatUtil.isUpdatePollActionAction(action)) {
      this.addQuestion(action.question)
      this.addTotal(action.voteCount)
      action.choices.forEach((choice) => this.addChoice(stringify(choice.text), choice.votePercentage?.simpleText))
    } else if (YoutubeChatUtil.isAddPollResultActionAction(action)) {
      this.addQuestion(stringify(action.question))
      this.addTotal(action.total)
      action.choices.forEach((choice) => this.addChoice(stringify(choice.text), choice.votePercentage))
    }
  }

  public getContent(): string {
    return this.lines.join('\n')
  }

  private addTitle() {
    const link = hyperlink(
      this.data.video.id,
      hideLinkEmbed(YoutubeVideoUtil.getUrl(this.data.video.id)),
      [
        this.data.channel.name || this.data.channel.id,
        this.data.video.title || this.data.video.id,
      ].join('\n'),
    )

    this.lines.push(`「${link}」 POLL: ${inlineCode(this.data.action.type)}`)
  }

  private addQuestion(question: string) {
    if (!question) {
      return
    }

    this.lines.push(codeBlock(`Question: ${question}`))
  }

  private addTotal(total: number | string) {
    this.lines.push(codeBlock(`Total: ${total.toString()}`))
  }

  private addChoice(text: string, votePercentage?: string) {
    this.lines.push(
      [
        '- ',
        this.inlineCodeBlock(text),
        votePercentage
          ? this.inlineCodeBlock(votePercentage)
          : null,
      ].filter((v) => v).join(''),
    )
  }

  private inlineCodeBlock(s: string) {
    return `\`\`\`${s}\`\`\``
  }
}
