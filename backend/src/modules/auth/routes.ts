import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export async function registerAuthRoutes(app: FastifyInstance) {
  const registerSchema = z.object({
    nome: z.string().min(1),
    email: z.string().email(),
    senha: z.string().min(6),
    contaNome: z.string().min(1).optional(),
  });

  app.post('/register', async (req, reply) => {
    const body = registerSchema.parse(req.body);
    const exists = await app.prisma.usuario.findUnique({ where: { email: body.email } });
    if (exists) return reply.code(409).send({ error: { code: 'CONFLICT', message: 'Email já cadastrado' } });

    const conta = await app.prisma.conta.create({ data: { nome: body.contaNome || `${body.nome} - Conta` } });
    const senhaHash = await bcrypt.hash(body.senha, 10);
    const user = await app.prisma.usuario.create({
      data: { nome: body.nome, email: body.email, senhaHash, cargo: 'ADMIN', contaId: conta.id },
      select: { id: true, nome: true, email: true, cargo: true, contaId: true },
    });
    return reply.code(201).send({ user });
  });

  const loginSchema = z.object({ email: z.string().email(), senha: z.string().min(6) });
  app.post('/login', async (req, reply) => {
    const body = loginSchema.parse(req.body);
    const user = await app.prisma.usuario.findUnique({ where: { email: body.email } });
    if (!user) return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Credenciais inválidas' } });
    const ok = await bcrypt.compare(body.senha, user.senhaHash);
    if (!ok) return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Credenciais inválidas' } });
    const accessToken = app.jwt.sign({ sub: user.id, contaId: user.contaId, cargo: user.cargo }, { expiresIn: '15m' });
    const refreshToken = app.jwt.sign({ sub: user.id }, { expiresIn: '7d' });
    reply.setCookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', path: '/' });
    return { accessToken, user: { id: user.id, nome: user.nome, email: user.email, cargo: user.cargo, contaId: user.contaId } };
  });

  app.get('/me', { preHandler: [authGuard] }, async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const user = await app.prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, email: true, cargo: true, contaId: true },
    });
    return { user };
  });

  function authGuard(req: any, reply: any, done: any) {
    const auth = req.headers['authorization'];
    if (!auth) return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Token ausente' } });
    const token = auth.replace('Bearer ', '');
    try {
      req.user = (app.jwt.verify(token) as any);
      done();
    } catch {
      reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Token inválido' } });
    }
  }
}


