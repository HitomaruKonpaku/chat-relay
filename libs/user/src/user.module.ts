import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserFilter } from './model/user-filter.entity'
import { UserPool } from './model/user-pool.entity'
import { UserFilterRepository } from './repository/user-filter.repository'
import { UserPoolRepository } from './repository/user-pool.repository'
import { UserFilterService } from './service/user-filter.service'
import { UserPoolService } from './service/user-pool.service'
import { UserService } from './user.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPool,
      UserFilter,
    ]),
  ],
  providers: [
    UserService,

    UserPoolRepository,
    UserFilterRepository,

    UserPoolService,
    UserFilterService,
  ],
  exports: [
    UserService,

    UserPoolRepository,
    UserFilterRepository,

    UserPoolService,
    UserFilterService,
  ],
})
export class UserModule { }
