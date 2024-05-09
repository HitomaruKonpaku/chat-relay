import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { Logger } from '../logger/logger'

export abstract class BaseProcessor extends WorkerHost {
  protected abstract readonly logger: Logger

  @OnWorkerEvent('error')
  onError(error: any) {
    this.logger.error(`[ERROR] ${error.message}`)
  }

  @OnWorkerEvent('paused')
  onPaused() {
    this.logger.warn('[PAUSED]')
  }

  @OnWorkerEvent('resumed')
  onResumed() {
    this.logger.warn('[RESUMED]')
  }

  @OnWorkerEvent('ready')
  onReady() {
    this.logger.log('[READY]')
  }

  @OnWorkerEvent('drained')
  onDrained() {
    this.logger.debug('[DRAINED]')
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`[ACTIVE] ${job.id}`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error) {
    this.logger.error(`[FAILED] ${job.id} - ${error.message}`)
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.debug(`[STALLED] ${jobId}`)
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`[COMPLETED] ${job.id}`)
  }

  protected log(job: Job, msg: string) {
    const tmp = [
      new Date().toISOString(),
      msg,
    ].filter((v) => v).join(' ').trim()
    return job.log(tmp)
  }
}
