import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendChatRequest } from './dto/request/send-chat.request';
import { OpenAI } from 'openai';
import { Chat, Conversation, Sender } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async sendChat(
    userId: number,
    request: SendChatRequest,
  ): Promise<{ chat: Chat; aiResponse: Conversation }> {
    const { content, chatId, healthData } = request;

    const chat = await (async () => {
      if (chatId) {
        const existingChat = await this.prisma.chat.findFirst({
          where: { id: chatId, userId },
        });

        if (!existingChat) {
          throw new NotFoundException('존재하지 않는 채팅방입니다.');
        }
        return existingChat;
      }

      const title = await this._generateChatTitle(content);

      return this.prisma.chat.create({
        data: {
          userId,
          title,
        },
      });
    })();

    await this.prisma.conversation.create({
      data: {
        chatId: chat.id,
        sender: Sender.USER,
        content: content || `[Health Data] ${JSON.stringify(healthData)}`,
      },
    });

    const previousConversations = await this.prisma.conversation.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
    });

    const existingHealthData = this._extractHealthDataFromHistory(
      previousConversations,
    );

    const currentHealthData = healthData || existingHealthData;

    const standardRefs = currentHealthData
      ? await this.prisma.standardRef.findMany({
          take: 5,
        })
      : [];

    const llmResponse = await this._callOpenAI(
      content,
      currentHealthData,
      standardRefs,
      previousConversations,
    );

    const aiResponse = await this.prisma.conversation.create({
      data: {
        chatId: chat.id,
        sender: Sender.AI,
        content: llmResponse,
      },
    });

    return { chat, aiResponse };
  }

  async getChatDetail(chatId: number): Promise<Conversation[]> {
    const conversationList = await this.prisma.conversation.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    return conversationList;
  }

  async getChatList(userId: number): Promise<Chat[]> {
    const chatList = await this.prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return chatList;
  }

  async deleteChat(userId: number, chatId: number): Promise<void> {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new NotFoundException('존재하지 않는 채팅방입니다.');
    }

    await this.prisma.conversation.deleteMany({ where: { chatId } });
    await this.prisma.chat.delete({ where: { id: chatId } });
  }

  private _extractHealthDataFromHistory(conversations: Conversation[]): any {
    for (const conv of conversations) {
      if (
        conv.sender === Sender.USER &&
        conv.content.includes('Health Data:')
      ) {
        const match = conv.content.match(/Health Data: (\{.*?\})/);
        if (match) {
          try {
            return JSON.parse(match[1]);
          } catch {
            return null;
          }
        }
      }
    }
    return null;
  }

  private async _generateChatTitle(firstMessage?: string): Promise<string> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '사용자의 첫 메시지를 바탕으로 간결한 채팅방 제목을 생성하세요. 20자 이내로 핵심만 담아주세요.',
        },
        {
          role: 'user',
          content: firstMessage || '건강검진 결과 분석',
        },
      ],
      max_tokens: 50,
    });

    return completion.choices[0].message.content?.trim() || 'New Chat';
  }

  private async _callOpenAI(
    message?: string,
    healthData?: any,
    standardRefs?: any[],
    previousConversations?: Conversation[],
  ): Promise<string> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemContent = `
    - 당신은 사용자의 건강검진 결과를 전문적으로 분석해주는 의료 정보 분석 AI입니다.
    - 사용자는 2가지 행동을 요청할 수 있습니다: (1) 건강 상태 분석 (HealthData가 주어진 경우) (2) 일반 질문
    - 건강 상태 분석 요청 시, 다음 지침을 반드시 따릅니다:
      1. 사용자가 제공하는 건강검진 수치(Health Data)를 기반으로 전반적인 건강 상태를 해석하고, 정상 범위 여부를 명확히 알려줍니다(Standard Reference 참조).
      2. 용어 정의(Definition), 수치 해석(Numeric Meaning), 정상 범위(Normal Range), 원인(Cause), 행동 가이드(Action Guide) 등 5가지 카테고리로 나누어 설명합니다.
      3. Standard Reference를 참고한 내용은 옆에 참고문헌을 반드시 [{"name": "", "link": ""}, {"name": "", "link": ""}] 형태로 명시합니다.
    - 사용자가 이해하기 쉽도록 전문 용어를 풀어서 설명합니다.
    - 질병 진단이나 치료 지시는 하지 않으며, 어디까지나 참고용 조언만 제공합니다.
    - 이미 제공된 정보는 대화 기록에서 확인합니다.`;

    const healthContext =
      healthData && standardRefs?.length
        ? `\n\n[Health Data]\n${JSON.stringify(
            healthData,
            null,
            2,
          )}\n\n[Standard References]\n${JSON.stringify(
            standardRefs.map((ref) => ref.content),
            null,
            2,
          )}`
        : '';

    const messages: any[] = [
      {
        role: 'system',
        content: systemContent,
      },
    ];

    if (previousConversations && previousConversations.length > 1) {
      for (let i = 0; i < previousConversations.length - 1; i++) {
        const conv = previousConversations[i];
        messages.push({
          role: conv.sender === Sender.USER ? 'user' : 'assistant',
          content: conv.content,
        });
      }
    }

    messages.push({
      role: 'user',
      content: healthContext ? `분석 해줘: ${healthContext}\n` : message,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
    });

    return completion.choices[0].message.content || '';
  }
}
