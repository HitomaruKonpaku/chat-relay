import { UserSourceType } from '../enum/user-source-type.enum'

export interface UserRemove {
  sourceType: UserSourceType
  sourceId: string
}
