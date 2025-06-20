import { NotificationAction } from '@/app/youtube'
import { NotImplementedException } from '@nestjs/common'
import { BaseActionHandler } from './base-action.handler'

export abstract class BaseNotificationActionHandler<T extends NotificationAction> extends BaseActionHandler<T> {
  public async handle() {
    if (!this.canHandle()) {
      return
    }

    // TODO
    throw new NotImplementedException()
  }

  protected canHandle(): boolean {
    return false
  }
}
