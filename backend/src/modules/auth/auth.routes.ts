import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repositories/auth.repository';

export async function authRoutes(app: FastifyInstance) {
  const authRepository = new AuthRepository(app.prisma);
  const authService = new AuthService(authRepository);
  const authController = new AuthController(authService);

  app.post('/register', (req, reply) => authController.register(req, reply));
  app.post('/login', (req, reply) => authController.login(req, reply));
  app.post('/refresh', (req, reply) => authController.refresh(req, reply));
  app.get('/me', { preHandler: [authMiddleware] }, (req, reply) =>
    authController.getProfile(req, reply)
  );
}
