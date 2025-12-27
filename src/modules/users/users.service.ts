import { ConflictException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import type { PrismaService } from 'src/common/prisma/prisma.service';
import type { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    const hashedPassword = await argon2.hash(password);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });

      const { password: _, ...result } = user;

      return result;
    } catch (error) {
      // @ts-expect-error: Prisma error code
      if (error.code === 'P2002') {
        throw new ConflictException('Email already in use.');
      }
      throw error;
    }
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
