import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Main } from '../../../shared/base/base.main'
import { ApiModule } from './api.module'

new Main(
  'api',
  ApiModule,
  {
    onBeforeListen: async (app) => {
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
        }),
      )

      const title = 'chat-relay API'
      const config = new DocumentBuilder()
        .setTitle(title)
        .build()
      const document = SwaggerModule.createDocument(app, config)
      SwaggerModule.setup('docs', app, document, {
        customSiteTitle: title,
      })
    },
  },
).bootstrap()
