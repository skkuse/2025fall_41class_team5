import { ApiProperty } from '@nestjs/swagger';
import { Conversation } from '@prisma/client';
import { ChatDetailResponse } from './chat-detail.response';

export class ConversationListResponse {
  @ApiProperty({ description: '대화 목록' })
  conversationList: ChatDetailResponse[];

  constructor(conversationList: Conversation[]) {
    this.conversationList = conversationList.map(
      (conversation) => new ChatDetailResponse(conversation),
    );
  }
}
