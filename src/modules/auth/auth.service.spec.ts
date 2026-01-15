import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

// Mock argon2
jest.mock('argon2');

type MockUser = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user result if password matches', async () => {
      const user: MockUser = {
        id: '1',
        email: 'test@test.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const { password, ...result } = user;

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      expect(await service.validateUser('test@test.com', 'password')).toEqual(result);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      expect(await service.validateUser('test@test.com', 'password')).toBeNull();
    });

    it('should return null if password mismatch', async () => {
      const user: MockUser = {
        id: '1',
        email: 'test@test.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      expect(await service.validateUser('test@test.com', 'wrong')).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token', async () => {
      const result = { id: '1', email: 'test@test.com' };
      const token = 'jwt_token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      expect(await service.login(result)).toEqual({ access_token: token });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: '1', email: 'test@test.com' });
    });
  });
});
