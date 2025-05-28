import { NestFactory } from '@nestjs/core'
import dotenv from 'dotenv'
import { Logger } from '../logger/logger'

export interface MainHandlers {
  onBeforeListen?: () => Promise<any>
}

export class Main {
  protected readonly logger = new Logger(Main.name)

  constructor(
    protected readonly id: string,
    protected readonly module: any,
    protected readonly handlers?: MainHandlers,
  ) { }

  async bootstrap() {
    dotenv.config({ path: `env/${this.id}.env` })
    dotenv.config()

    const app = await NestFactory.create(this.module, {
      logger: new Logger(null),
    })

    app.enableShutdownHooks()

    const port = process.env.PORT || 8080

    await this.handlers?.onBeforeListen?.()

    await app.listen(port, () => {
      const url = `http://localhost:${port}`
      this.logger.log(`🚀 Server listening on ${url}`)
    })
  }
}
