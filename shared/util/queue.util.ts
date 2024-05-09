import { RegisterQueueOptions } from '@nestjs/bullmq'

export class QueueUtil {
  public static generateRegisterQueueOptions(names: string[]) {
    const items = names.map((name) => {
      const tmp: RegisterQueueOptions = {
        name,
      }
      return tmp
    })
    return items
  }
}
