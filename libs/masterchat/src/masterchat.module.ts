import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MasterchatEntity } from './model/masterchat.entity'
import { MasterchatRepository } from './repository/masterchat.repository'
import { MasterchatService } from './service/masterchat.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MasterchatEntity,
    ]),
  ],
  providers: [
    MasterchatRepository,
    MasterchatService,
  ],
  exports: [
    MasterchatRepository,
    MasterchatService,
  ],
})
export class MasterchatModule { }
