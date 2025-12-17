import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendChatRequest } from './dto/request/send-chat.request';
import { ChatListResponse } from './dto/response/chat-list.response';
import { SuccessStatusResponse } from 'common/response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';
import { SendChatResponse } from './dto/response/send-chat.response';
import { ConversationListResponse } from './dto/response/conversation-list.response';

@ApiTags('Chat')
@ApiBearerAuth('Authorization')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/')
  @ApiOperation({ summary: '채팅 발송' })
  async sendChat(
    @User() user: { userId: number },
    @Body() request: SendChatRequest,
  ): Promise<SendChatResponse> {
    const { chat, aiResponse } = await this.chatService.sendChat(
      user.userId,
      request,
    );

    return new SendChatResponse(chat, aiResponse);
  }

  @Get('/')
  @ApiOperation({ summary: '채팅방 목록 조회' })
  async getChatList(
    @User() user: { userId: number },
  ): Promise<ChatListResponse> {
    const chatList = await this.chatService.getChatList(user.userId);

    return new ChatListResponse(chatList);
  }

  @Get('/:chatId')
  @ApiOperation({ summary: '채팅방 상세 조회 (conversation)' })
  async getChatDetail(
    @Param('chatId') chatId: number,
  ): Promise<ConversationListResponse> {
    const conversationList = await this.chatService.getChatDetail(chatId);

    return new ConversationListResponse(conversationList);
  }

  @Delete('/:chatId')
  @ApiOperation({ summary: '채팅방 삭제' })
  async deleteChat(
    @User() user: { userId: number },
    @Param('chatId') chatId: number,
  ): Promise<SuccessStatusResponse> {
    await this.chatService.deleteChat(user.userId, chatId);

    return new SuccessStatusResponse('Chat deleted successfully');
  }
}
