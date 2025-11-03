import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function registerPesagemRoutes(app: FastifyInstance) {
  function authGuard(req: any, reply: any, done: any) {
    const auth = req.headers['authorization'];
    if (!auth) return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Token ausente' } });
    const token = auth.replace('Bearer ', '');
    try { req.user = (app.jwt.verify(token) as any); done(); } catch { reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Token inválido' } }); }
  }

  app.get('/pesagens/:animalId', { preHandler: [authGuard] }, async (req: any) => {
    const { animalId } = req.params as any;
    const { page = 1, limit = 20, dateFrom, dateTo } = req.query as any;
    const where: any = { animalId };
    if (dateFrom || dateTo) where.data = { gte: dateFrom ? new Date(dateFrom) : undefined, lte: dateTo ? new Date(dateTo) : undefined };
    const [items, total] = await app.prisma.$transaction([
      app.prisma.pesagem.findMany({ where, orderBy: { data: 'desc' }, skip: (Number(page)-1)*Number(limit), take: Number(limit) }),
      app.prisma.pesagem.count({ where })
    ]);
    return { items, page: Number(page), limit: Number(limit), total };
  });

  app.post('/pesagens', { preHandler: [authGuard] }, async (req: any, reply) => {
    const schema = z.object({ animalId: z.string(), peso: z.number().positive(), flag: z.enum(['ATIVO','MORTO','VENDIDO','DOENTE']), observacao: z.string().optional() });
    const data = schema.parse(req.body);
    const pesagem = await app.prisma.$transaction(async (tx) => {
      const p = await tx.pesagem.create({ data: { animalId: data.animalId, peso: data.peso, flag: data.flag, observacao: data.observacao } });
      await tx.animal.update({ where: { id: data.animalId }, data: { status: data.flag } });
      return p;
    });
    return reply.code(201).send(pesagem);
  });
}


