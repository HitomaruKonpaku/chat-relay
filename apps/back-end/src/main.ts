import { NestFactory } from '@nestjs/core'
import { Logger } from '@shared/logger/logger'
import 'dotenv/config'
import { BackEndModule } from './back-end.module'

async function bootstrap() {
  const logger = new Logger('MAIN', { timestamp: true })

  const app = await NestFactory.create(BackEndModule, {
    logger: new Logger(null, { timestamp: true }),
  })

  const port = process.env.PORT || 3000

  await app.listen(port, () => {
    const url = `http://localhost:${port}`
    logger.log(`🚀 Server listening on ${url}`)
  })
}

bootstrap()
