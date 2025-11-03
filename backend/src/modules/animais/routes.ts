import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function registerAnimalRoutes(app: FastifyInstance) {
  function authGuard(req: any, reply: any, done: any) {
    const auth = req.headers['authorization'];
    if (!auth) return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Token ausente' } });
    const token = auth.replace('Bearer ', '');
    try { req.user = (app.jwt.verify(token) as any); done(); } catch { reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Token inválido' } }); }
  }

  app.get('/animais', { preHandler: [authGuard] }, async (req: any) => {
    const q = req.query as any;
    const where: any = { fazendaId: q.fazendaId };
    if (q.prefixo) where.prefixo = q.prefixo;
    if (q.numero) where.numero = Number(q.numero);
    if (q.loteId) where.loteId = q.loteId;
    if (q.status) where.status = q.status;
    const page = Number(q.page ?? 1), limit = Number(q.limit ?? 20);
    const sort = String(q.sort ?? 'brinco');
    const order = String(q.order ?? 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
    const [items, total] = await app.prisma.$transaction([
      app.prisma.animal.findMany({ where, orderBy: { [sort]: order as any }, skip: (page - 1) * limit, take: limit }),
      app.prisma.animal.count({ where })
    ]);
    return { items, page, limit, total };
  });

  app.get('/animais/:id', { preHandler: [authGuard] }, async (req: any) => {
    const id = req.params.id as string;
    const animal = await app.prisma.animal.findUnique({ where: { id }, include: { pesagens: { orderBy: { data: 'desc' }, take: 1 } } });
    return animal;
  });

  app.post('/animais', { preHandler: [authGuard] }, async (req: any, reply) => {
    const schema = z.object({
      fazendaId: z.string(),
      prefixo: z.string().min(3).max(4).regex(/^[A-Z]+$/),
      numero: z.number().int().min(1).max(10000),
      sexo: z.enum(['MACHO','FEMEA','DESCONHECIDO']).optional(),
      raca: z.string().optional(),
      nascimento: z.string().datetime().optional(),
      origem: z.string().optional(),
      fotoUrl: z.string().url().nullable().optional(),
      loteId: z.string().optional()
    });
    const data = schema.parse(req.body);
    const brinco = `${data.prefixo}-${data.numero}`;
    const dup = await app.prisma.animal.findFirst({ where: { fazendaId: data.fazendaId, brinco } });
    if (dup) return reply.code(409).send({ error: { code: 'CONFLICT', message: `Brinco '${brinco}' já existe nesta fazenda` } });
    const created = await app.prisma.animal.create({ data: { ...data, brinco } });
    return reply.code(201).send(created);
  });

  app.put('/animais/:id', { preHandler: [authGuard] }, async (req: any) => {
    const id = req.params.id as string;
    const updated = await app.prisma.animal.update({ where: { id }, data: req.body as any });
    return updated;
  });
}


