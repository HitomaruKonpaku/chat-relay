import { NestFactory } from '@nestjs/core'
import { Logger } from '@shared/logger/logger'
import dotenv from 'dotenv'
import { YoutubeChannelCrawlerModule } from './youtube-channel-crawler.module'

async function bootstrap() {
  dotenv.config({ path: '.env.youtube-channel-crawler' })
  dotenv.config()

  const logger = new Logger('MAIN', { timestamp: true })

  const app = await NestFactory.create(YoutubeChannelCrawlerModule, {
    logger: new Logger(null, { timestamp: true }),
  })

  const port = process.env.PORT || 8080

  await app.listen(port, () => {
    const url = `http://localhost:${port}`
    logger.log(`🚀 Server listening on ${url}`)
  })
}

bootstrap()
