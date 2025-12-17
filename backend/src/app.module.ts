import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [HealthModule, ChatModule, UserModule],
  providers: [PrismaService],
})
export class AppModule {}
