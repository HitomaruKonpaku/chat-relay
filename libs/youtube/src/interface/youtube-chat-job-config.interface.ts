import { JobsOptions } from 'bullmq'

export interface YoutubeChatJobConfig {
  skipSave?: boolean
  skipHandle?: boolean
  jobsOptions?: JobsOptions
}
