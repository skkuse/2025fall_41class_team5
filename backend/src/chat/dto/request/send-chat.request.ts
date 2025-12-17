import {
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SendChatRequest {
  @ApiPropertyOptional({ description: '채팅 ID', example: 1 })
  @IsOptional()
  @IsNumber()
  chatId?: number;

  @ApiPropertyOptional({
    description: '메시지 내용',
    example: 'Hello, how are you?',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: '건강검진 데이터',
    example: { heartRate: 80, bloodPressure: { systolic: 120, diastolic: 80 } },
  })
  @IsOptional()
  @IsObject()
  healthData?: string;
}
