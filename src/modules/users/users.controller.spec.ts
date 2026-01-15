import { Test, type TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('register', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Jess',
        lastName: 'Am',
      };

      const result = {
        id: 'user-id',
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'USER' as const,
      };
      const { password, ...safeResult } = result;

      jest.spyOn(service, 'create').mockResolvedValue(safeResult);

      expect(await controller.register(createUserDto)).toBe(safeResult);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
