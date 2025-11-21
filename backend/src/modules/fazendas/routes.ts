import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function registerFazendaRoutes(app: FastifyInstance) {
  app.get('/fazendas', { preHandler: [authGuard] }, async (req: any) => {
    const contaId = req.user.contaId as string;
    const { page = 1, limit = 20, sort = 'nome', order = 'asc' } = req.query as any;
    const [items, total] = await app.prisma.$transaction([
      app.prisma.fazenda.findMany({
        where: { contaId },
        orderBy: { [sort]: order === 'desc' ? 'desc' : 'asc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      app.prisma.fazenda.count({ where: { contaId } })
    ]);
    return { items, page: Number(page), limit: Number(limit), total };
  });

  app.get('/fazendas/:id', { preHandler: [authGuard] }, async (req: any) => {
    const id = req.params.id as string;
    const fazenda = await app.prisma.fazenda.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: {
            animais: true,
            lotes: true,
            pais: true
          }
        }
      }
    });
    if (!fazenda) {
      throw { statusCode: 404, response: { error: { code: 'NOT_FOUND', message: 'Fazenda não encontrada' } } };
    }
    return fazenda;
  });

  app.post('/fazendas', { preHandler: [authGuard] }, async (req: any, reply) => {
    mustRole(req, ['ADMIN', 'GERENTE']);
    const schema = z.object({ nome: z.string().min(1), localizacao: z.any().optional(), hectares: z.number().optional() });
    const data = schema.parse(req.body);
    const fazenda = await app.prisma.fazenda.create({ data: { ...data, contaId: req.user.contaId } });
    return reply.code(201).send(fazenda);
  });

  app.put('/fazendas/:id', { preHandler: [authGuard] }, async (req: any) => {
    mustRole(req, ['ADMIN', 'GERENTE']);
    const id = req.params.id as string;
    const data = (req.body || {}) as any;
    const fazenda = await app.prisma.fazenda.update({ where: { id }, data });
    return fazenda;
  });

  app.delete('/fazendas/:id', { preHandler: [authGuard] }, async (req: any, reply) => {
    mustRole(req, ['ADMIN']);
    const id = req.params.id as string;
    await app.prisma.fazenda.delete({ where: { id } });
    return reply.code(204).send();
  });

  function authGuard(req: any, reply: any, done: any) {
    const auth = req.headers['authorization'];
    if (!auth) return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Token ausente' } });
    const token = auth.replace('Bearer ', '');
    try { req.user = (app.jwt.verify(token) as any); done(); } catch { reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Token inválido' } }); }
  }
  function mustRole(req: any, roles: string[]) {
    if (!roles.includes(req.user.cargo)) {
      throw { statusCode: 403, response: { error: { code: 'FORBIDDEN', message: 'Sem permissão' } } } as any;
    }
  }
}


