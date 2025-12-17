import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class GetUserResponse {
  @ApiProperty({ description: '유저 ID', example: 1 })
  userId: number;

  @ApiProperty({ description: '유저 이름', example: 'John Doe' })
  name: string;

  constructor(user: User) {
    this.userId = user.id;
    this.name = user.name;
  }
}
