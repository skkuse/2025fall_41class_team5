import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendChatRequest } from './dto/request/send-chat.request';
import { AnalyzeHealthDataRequest } from './dto/request/analyze-health-data.request';
import { OpenAI } from 'openai';
import { Chat, Conversation, Sender } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async sendChat(
    userId: number,
    request: SendChatRequest,
  ): Promise<{ chat: Chat; aiResponse: Conversation }> {
    const { content, chatId } = request;

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
        content,
      },
    });

    const previousConversations = await this.prisma.conversation.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
    });

    const llmResponse = await this._callOpenAI(
      content,
      undefined,
      [],
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

  async analyzeHealthData(
    userId: number,
    request: AnalyzeHealthDataRequest,
  ): Promise<{ chat: Chat; aiResponse: Conversation }> {
    const { healthData, chatId } = request;

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

      const title = await this._generateChatTitle();

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
        content: `[Health Data] ${JSON.stringify(healthData)}`,
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

    const standardRefs = await this.prisma.standardRef.findMany({
      where: {
        category: {
          in: ['numeric_meaning', 'normal_range'],
        },
      },
    });

    const llmResponse = await this._callOpenAI(
      undefined,
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

  async additionalAnalyze(term: string, category: string): Promise<string> {
    const standardRefs = await this.prisma.standardRef.findMany({
      where: { category },
    });

    return this._callOpenAIForAdditionalAnalyze(term, category, standardRefs);
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

  private _removeDuplicateReferences(content: string): string {
    const refPattern = /\{"([^"]+)":\s*"([^"]+)"\}/g;
    const matches = [...content.matchAll(refPattern)];
    
    if (matches.length === 0) return content;

    const seenRefs = new Map<string, string>();
    let result = content;

    matches.forEach((match) => {
      const fullMatch = match[0];
      const refKey = match[1];
      const refValue = match[2];

      if (seenRefs.has(refKey)) {
        result = result.replace(fullMatch, '');
      } else {
        seenRefs.set(refKey, refValue);
      }
    });

    return result;
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

    const systemContent = `당신은 사용자의 건강검진 결과를 전문적으로 분석해주는 의료 정보 분석 AI입니다.
      건강 상태 분석 시 다음 지침을 따르세요:
      1. 건강검진 수치를 기반으로 정상 수치와 해석을 구분하여 설명합니다.
      2. Standard Reference를 참고한 내용 옆에 참고문헌을 다음 형식으로 명시합니다: {"자료명": "링크"}
        예시: {"보건복지부. (2025). 건강검진 실시기준: 별표 4 건강검진결과 판정기준. 보건복지부고시 제2025-5호.": "https://www.nhis.or.kr/lm/lmxsrv/law/lawFullView.do?SEQ=80&SEQ_HISTORY=46542"}
      3. 동일한 참고문헌을 중복해서 표시하지 마세요. 각 참고문헌은 한 번만 명시합니다.
      4. 질병 진단이나 치료 지시는 하지 않으며, 참고용 조언만 제공합니다.
      5. 이전 대화 내용을 참고하여 일관성 있는 답변을 제공합니다.
      6. 이모티콘을 적당히 사용하여 사용자 친화적인 답변을 제공합니다.
      `;

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

    const response = completion.choices[0].message.content || '';
    return this._removeDuplicateReferences(response);
  }

  private async _callOpenAIForAdditionalAnalyze(
    term: string,
    category: string,
    standardRefs: any[],
  ): Promise<string> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompts: Record<string, string> = {
      action_guide: `당신은 의료 용어에 대한 행동 가이드를 제공하는 AI입니다. "${term}"에 대한 구체적인 행동 지침과 권장사항을 설명하세요.`,
      cause: `당신은 의료 용어의 원인을 설명하는 AI입니다. "${term}"의 발생 원인과 위험 요인을 설명하세요.`,
      definition: `당신은 의료 용어를 정의하는 AI입니다. "${term}"의 의학적 정의와 의미를 설명하세요.`,
    };

    const refContext = standardRefs.length
      ? `\n\n[Standard References]\n${JSON.stringify(
          standardRefs.map((ref) => ref.content),
          null,
          2,
        )}`
      : '';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `${prompts[category]}
            Standard Reference를 참고한 내용 옆에 참고문헌을 다음 형식으로 명시합니다: {"자료명": "링크"}
            예시: {"보건복지부. (2025). 건강검진 실시기준: 별표 4 건강검진결과 판정기준. 보건복지부고시 제2025-5호.": "https://www.nhis.or.kr/lm/lmxsrv/law/lawFullView.do?SEQ=80&SEQ_HISTORY=46542"}
            동일한 참고문헌을 중복해서 표시하지 마세요. 각 참고문헌은 한 번만 명시합니다.
            질병 진단이나 치료 지시는 하지 않으며, 참고용 조언만 제공합니다.
            이전 대화 내용을 참고하여 일관성 있는 답변을 제공합니다.
            이모티콘을 적당히 사용하여 사용자 친화적인 답변을 제공합니다.
          `,
        },
        {
          role: 'user',
          content: `"${term}"에 대해 설명해줘${refContext}`,
        },
      ],
    });

    const response = completion.choices[0].message.content || '';
    return this._removeDuplicateReferences(response);
  }
}
