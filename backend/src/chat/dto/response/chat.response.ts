import { ApiProperty } from '@nestjs/swagger';
import { Chat } from '@prisma/client';

export class ChatResponse {
  @ApiProperty({ description: '채팅방 ID', example: 1 })
  id: number;

  @ApiProperty({
    description: '채팅방 제목',
    example: 'Blood pressure discussion',
  })
  title: string;

  constructor(chat: Chat) {
    this.id = chat.id;
    this.title = chat.title;
  }
}
