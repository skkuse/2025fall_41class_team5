import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserRequest } from './dto/request/create-user.request';
import { LoginUserRequest } from './dto/request/login-user.request';
import { SuccessStatusResponse } from 'common/response';
import { GetUserResponse } from './dto/response/get-user.response';
import { LoginUserResponse } from './dto/response/login-user.response';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  @ApiOperation({ summary: '유저 생성' })
  async createUser(
    @Body() request: CreateUserRequest,
  ): Promise<SuccessStatusResponse> {
    await this.userService.createUser(request);

    return new SuccessStatusResponse('User created successfully');
  }

  @Post('/login')
  @ApiOperation({ summary: '유저 로그인' })
  async login(@Body() request: LoginUserRequest): Promise<LoginUserResponse> {
    const token = await this.userService.login(request);

    return new LoginUserResponse(token);
  }

  @Get('/:userId')
  @ApiOperation({ summary: '유저 조회' })
  async getUser(@Param('userId') userId: number): Promise<GetUserResponse> {
    const user = await this.userService.getUser(userId);

    return new GetUserResponse(user);
  }
}
