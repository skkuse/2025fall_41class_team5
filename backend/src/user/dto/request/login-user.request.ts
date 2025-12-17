import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class LoginUserRequest {
  @ApiProperty({
    description: '유저 ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
