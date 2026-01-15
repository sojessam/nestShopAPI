import { Test, type TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token', async () => {
      const result = { access_token: 'jwt_token' };
      const req = { user: { id: '1', email: 'test@test.com' } };
      jest.spyOn(authService, 'login').mockResolvedValue(result);
      expect(await controller.login(req)).toBe(result);
      expect(authService.login).toHaveBeenCalledWith(req.user);
    });
  });
});
