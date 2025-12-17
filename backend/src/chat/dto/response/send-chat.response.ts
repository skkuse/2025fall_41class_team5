import { ApiProperty } from '@nestjs/swagger';
import { Chat, Conversation } from '@prisma/client';

export class SendChatResponse {
  @ApiProperty({ description: '채팅방 ID', example: 1 })
  chatId: number;

  @ApiProperty({ description: 'AI 응답 ID', example: 2 })
  conversationId: number;

  @ApiProperty({
    description: 'AI 응답 내용',
    example: 'Hello! How can I help you?',
  })
  content: string;

  constructor(chat: Chat, aiResponse: Conversation) {
    this.chatId = chat.id;
    this.conversationId = aiResponse.id;
    this.content = aiResponse.content;
  }
}
