import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

// Mock argon2
jest.mock('argon2');

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
      const user = {
        id: '1',
        email: 'test@test.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
      };
      const { password, ...result } = user;

      // biome-ignore lint/suspicious/noExplicitAny: Mocking user requires explicit any type casting
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user as any);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      expect(await service.validateUser('test@test.com', 'password')).toEqual(result);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      expect(await service.validateUser('test@test.com', 'password')).toBeNull();
    });

    it('should return null if password mismatch', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        password: 'hashedpassword',
      };
      // biome-ignore lint/suspicious/noExplicitAny: Mocking user requires explicit any type casting
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user as any);
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
