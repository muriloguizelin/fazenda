import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AuthService } from '../services/auth.service';
import { registerSchema, type RegisterDto } from '../dtos/register.dto';
import { loginSchema, type LoginDto } from '../dtos/login.dto';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: FastifyRequest, reply: FastifyReply) {
    try {
      const dto = registerSchema.parse(req.body) as RegisterDto;
      const result = await this.authService.register(dto);
      return reply.code(201).send(result);
    } catch (error: any) {
      if (error.statusCode) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      throw error;
    }
  }

  async login(req: FastifyRequest, reply: FastifyReply) {
    try {
      const dto = loginSchema.parse(req.body) as LoginDto;
      const result = await this.authService.login(dto);

      const accessToken = req.server.jwt.sign(
        { 
          sub: result.userId, 
          contaId: result.contaId, 
          cargo: result.cargo 
        },
        { expiresIn: '365d' }
      );

      const refreshToken = req.server.jwt.sign(
        { sub: result.userId },
        { expiresIn: '365d' }
      );

      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });

      return { accessToken, user: result.user };
    } catch (error: any) {
      if (error.statusCode) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      throw error;
    }
  }

  async refresh(req: FastifyRequest, reply: FastifyReply) {
    try {
      const refreshToken = (req.cookies as any)?.refreshToken;

      if (!refreshToken) {
        return reply.code(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Refresh token ausente',
          },
        });
      }

      const decoded = req.server.jwt.verify(refreshToken) as any;
      const result = await this.authService.getUserProfile(decoded.sub);

      const accessToken = req.server.jwt.sign(
        {
          sub: result.user.id,
          contaId: result.user.contaId,
          cargo: result.user.cargo,
        },
        { expiresIn: '365d' }
      );

      return { accessToken };
    } catch {
      return reply.code(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token inválido',
        },
      });
    }
  }

  async getProfile(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = req.user!.sub;
      const result = await this.authService.getUserProfile(userId);
      return result;
    } catch (error: any) {
      if (error.statusCode) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      throw error;
    }
  }
}
