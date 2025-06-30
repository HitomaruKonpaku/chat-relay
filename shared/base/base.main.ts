import { INestApplication } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import dotenv from 'dotenv'
import { Logger } from '../logger/logger'

export interface MainHandlers {
  onBeforeListen?: (app: INestApplication) => Promise<any>
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

    const app = await NestFactory.create<NestExpressApplication>(this.module, {
      logger: new Logger(null),
    })

    app.enableCors()
    app.enableShutdownHooks()

    app.set('trust proxy', true)

    await this.handlers?.onBeforeListen?.(app)

    const port = process.env.PORT || 8080

    await app.listen(port, () => {
      const url = `http://localhost:${port}`
      this.logger.log(`🚀 Server listening on ${url}`)
    })
  }
}
