import { ApiProperty } from '@nestjs/swagger';
import { Sender, Conversation } from '@prisma/client';

export class ChatDetailResponse {
  @ApiProperty({ description: '메시지 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '메시지 타입', example: Sender.AI })
  sender: Sender;

  @ApiProperty({ description: '메시지 내용', example: 'Hello' })
  content: string;

  @ApiProperty({ description: '메시지 생성 시간', example: new Date() })
  createdAt: Date;

  @ApiProperty({ description: '메시지 생성 시간', example: new Date() })
  updatedAt: Date;

  constructor(conversation: Conversation) {
    this.id = conversation.id;

    this.sender = conversation.sender;
    this.content = conversation.content;

    this.createdAt = conversation.createdAt;
    this.updatedAt = conversation.updatedAt;
  }
}
