import { ApiProperty } from '@nestjs/swagger';

export class AdditionalAnalyzeResponse {
  @ApiProperty({ description: '분석 내용', example: 'Detailed analysis...' })
  content: string;

  constructor(content: string) {
    this.content = content;
  }
}
