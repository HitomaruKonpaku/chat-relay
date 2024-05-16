import { NestFactory } from '@nestjs/core'
import dotenv from 'dotenv'
import { Logger } from '../logger/logger'

export class Main {
  constructor(
    private readonly id: string,
    private readonly module: any,
  ) { }

  async bootstrap() {
    dotenv.config({ path: `env/${this.id}.env` })
    dotenv.config()

    const logger = new Logger('MAIN', { timestamp: true })

    const app = await NestFactory.create(this.module, {
      logger: new Logger(null, { timestamp: true }),
    })

    const port = process.env.PORT || 8080

    await app.listen(port, () => {
      const url = `http://localhost:${port}`
      logger.log(`🚀 Server listening on ${url}`)
    })
  }
}
