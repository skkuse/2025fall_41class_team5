import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AnalysisCategory {
  ACTION_GUIDE = 'action_guide',
  CAUSE = 'cause',
  DEFINITION = 'definition',
}

export class AdditionalAnalyzeRequest {
  @ApiProperty({ description: '분석할 용어', example: 'cholesterol' })
  @IsNotEmpty()
  @IsString()
  term: string;

  @ApiProperty({
    description: '분석 카테고리',
    enum: AnalysisCategory,
    example: AnalysisCategory.DEFINITION,
  })
  @IsNotEmpty()
  @IsEnum(AnalysisCategory)
  category: AnalysisCategory;
}
