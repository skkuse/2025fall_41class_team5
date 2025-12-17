import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserRequest {
  @ApiProperty({ description: '유저 이름', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
