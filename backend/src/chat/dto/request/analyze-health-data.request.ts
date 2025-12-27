import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeHealthDataRequest {
  @ApiPropertyOptional({ description: '채팅 ID', example: 1 })
  @IsOptional()
  @IsNumber()
  chatId?: number;

  @ApiProperty({
    description: '건강검진 데이터',
    example: {
      generalInfo: {
        age: 26,
        gender: 'male',
        height_cm: 172.3,
        weight_kg: 69.8,
        waist_cm: 82.5,
        bmi: 23.5,
      },
      bloodPressure: {
        systolic: 118,
        diastolic: 76,
      },
      bloodTest: {
        cholesterol_total: 186,
        cholesterol_ldl: 112,
        cholesterol_hdl: 53,
        triglyceride: 145,
        glucose_fasting: 92,
        hemoglobin: 15.1,
      },
      liverFunction: {
        ast: 23,
        alt: 29,
        gamma_gtp: 38,
      },
      kidneyFunction: {
        creatinine: 0.94,
        bun: 14.2,
        gfr: 92,
      },
      urineTest: {
        protein: 'negative',
        glucose: 'negative',
        ketone: 'negative',
        occult_blood: 'negative',
      },
      lifestyle: {
        drinking: 'none',
        smoking: 'never',
        exercise_per_week: 3,
      },
    },
  })
  @IsObject()
  healthData: any;
}
