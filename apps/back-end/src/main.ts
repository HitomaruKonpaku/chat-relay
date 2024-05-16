import { Main } from '@shared/base/base.main'
import { BackEndModule } from './back-end.module'

new Main(
  'back-end',
  BackEndModule,
).bootstrap()
