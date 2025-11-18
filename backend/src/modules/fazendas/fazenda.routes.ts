import type { FastifyInstance } from 'fastify';
import { authMiddleware, requireRole } from '../../shared/middleware/auth.middleware';
import { FazendaController } from './controllers/fazenda.controller';
import { FazendaService } from './services/fazenda.service';
import { FazendaRepository } from './repositories/fazenda.repository';

export async function fazendaRoutes(app: FastifyInstance) {
  const fazendaRepository = new FazendaRepository(app.prisma);
  const fazendaService = new FazendaService(fazendaRepository);
  const fazendaController = new FazendaController(fazendaService);

  app.get('/fazendas', { preHandler: [authMiddleware] }, (req, reply) =>
    fazendaController.listFazendas(req, reply)
  );

  app.post(
    '/fazendas',
    { preHandler: [authMiddleware, requireRole('ADMIN', 'GERENTE')] },
    (req, reply) => fazendaController.createFazenda(req, reply)
  );

  app.put(
    '/fazendas/:id',
    { preHandler: [authMiddleware, requireRole('ADMIN', 'GERENTE')] },
    (req, reply) => fazendaController.updateFazenda(req, reply)
  );

  app.delete(
    '/fazendas/:id',
    { preHandler: [authMiddleware, requireRole('ADMIN')] },
    (req, reply) => fazendaController.deleteFazenda(req, reply)
  );
}
