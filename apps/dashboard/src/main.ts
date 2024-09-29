import { Main } from '@/shared/base/base.main'
import { DashboardModule } from './dashboard.module'

new Main(
  'dashboard',
  DashboardModule,
).bootstrap()
