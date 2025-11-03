import type { FastifyInstance } from 'fastify';

export async function registerMetricsRoutes(app: FastifyInstance) {
  function authGuard(req: any, reply: any, done: any) {
    const auth = req.headers['authorization'];
    if (!auth) return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Token ausente' } });
    const token = auth.replace('Bearer ', '');
    try { req.user = (app.jwt.verify(token) as any); done(); } catch { reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Token inválido' } }); }
  }

  app.get('/metrics/peso', { preHandler: [authGuard] }, async (req: any) => {
    const fazendaId = (req.query?.fazendaId as string) || '';
    const days = Number(req.query?.days || 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const pesagens = await app.prisma.pesagem.findMany({
      where: { data: { gte: since }, animal: { fazendaId } },
      include: { animal: { select: { id: true } } },
      orderBy: { data: 'asc' }
    });
    const byDay = new Map<string, { sum: number; count: number }>();
    for (const p of pesagens) {
      const day = new Date(p.data); day.setHours(0,0,0,0);
      const key = day.toISOString().slice(0,10);
      const acc = byDay.get(key) || { sum: 0, count: 0 };
      acc.sum += p.peso; acc.count += 1;
      byDay.set(key, acc);
    }
    const points = Array.from(byDay.entries()).sort((a,b) => a[0].localeCompare(b[0])).map(([date, v]) => ({ date, avg: +(v.sum / v.count).toFixed(2) }));
    return { points };
  });
}


