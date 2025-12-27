import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendChatRequest {
  @ApiPropertyOptional({ description: '채팅 ID', example: 1 })
  @IsOptional()
  @IsNumber()
  chatId?: number;

  @ApiProperty({
    description: '메시지 내용',
    example: 'Hello, how are you?',
  })
  @IsString()
  content: string;
}
