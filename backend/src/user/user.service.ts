import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserRequest } from './dto/request/login-user.request';
import { CreateUserRequest } from './dto/request/create-user.request';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(request: CreateUserRequest) {
    const { name } = request;

    await this.prisma.user.create({
      data: {
        name,
      },
    });
  }

  async login(request: LoginUserRequest): Promise<string> {
    const { userId } = request;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    return this.jwtService.sign({ userId: user.id });
  }

  async getUser(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
