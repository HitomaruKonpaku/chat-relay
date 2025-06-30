import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class IdDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string
}
