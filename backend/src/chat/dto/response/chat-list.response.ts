import { ApiProperty } from '@nestjs/swagger';
import { Chat } from '@prisma/client';
import { ChatResponse } from './chat.response';

export class ChatListResponse {
  @ApiProperty({ description: '전체 채팅방 수', example: 10 })
  totalCount: number;

  @ApiProperty({ description: '채팅방 ID', example: 1 })
  chatList: ChatResponse[];

  constructor(chatList: Chat[]) {
    this.totalCount = chatList.length;
    this.chatList = chatList.map((chat) => new ChatResponse(chat));
  }
}
