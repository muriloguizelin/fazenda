import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function registerLoteRoutes(app: FastifyInstance) {
  function authGuard(req: any, reply: any, done: any) {
    const auth = req.headers['authorization'];
    if (!auth) return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Token ausente' } });
    const token = auth.replace('Bearer ', '');
    try { req.user = (app.jwt.verify(token) as any); done(); } catch { reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Token inválido' } }); }
  }

  app.get('/lotes', { preHandler: [authGuard] }, async (req: any) => {
    const q = req.query as any;
    const where: any = { fazendaId: q.fazendaId };
    const page = Number(q.page ?? 1), limit = Number(q.limit ?? 20);
    const [items, total] = await app.prisma.$transaction([
      app.prisma.lote.findMany({ where, skip: (page-1)*limit, take: limit }),
      app.prisma.lote.count({ where })
    ]);
    return { items, page, limit, total };
  });

  app.post('/lotes', { preHandler: [authGuard] }, async (req: any, reply) => {
    const schema = z.object({ fazendaId: z.string(), nome: z.string().min(1), capacidade: z.number().int().optional(), area: z.number().optional() });
    const data = schema.parse(req.body);
    const created = await app.prisma.lote.create({ data });
    return reply.code(201).send(created);
  });

  app.post('/lotes/:id/transferir', { preHandler: [authGuard] }, async (req: any) => {
    const { id } = req.params as any; // origem
    const schema = z.object({ destinoLoteId: z.string(), animalIds: z.array(z.string()).min(1) });
    const body = schema.parse(req.body);
    const res = await app.prisma.animal.updateMany({ where: { id: { in: body.animalIds }, loteId: id }, data: { loteId: body.destinoLoteId } });
    return { transferidos: res.count };
  });
}


