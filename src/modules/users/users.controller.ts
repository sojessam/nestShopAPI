import { Body, Controller, Post } from '@nestjs/common';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
