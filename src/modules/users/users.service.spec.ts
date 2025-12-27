import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user with a hashed password', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@test.com',
      password: 'password123',
      firstName: 'Jess',
      lastName: 'Am',
    };

    mockPrismaService.user.create.mockResolvedValue({
      id: 'uuid-123',
      ...createUserDto,
      password: 'hashed_password',
    });

    await service.create(createUserDto);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: createUserDto.email,
        password: expect.not.stringMatching(createUserDto.password),
      }),
    });
  });
});
