import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { LoteController } from './controllers/lote.controller';
import { LoteService } from './services/lote.service';
import { LoteRepository } from './repositories/lote.repository';

export async function loteRoutes(app: FastifyInstance) {
  const loteRepository = new LoteRepository(app.prisma);
  const loteService = new LoteService(loteRepository);
  const loteController = new LoteController(loteService);

  app.get('/lotes', { preHandler: [authMiddleware] }, (req, reply) =>
    loteController.listLotes(req, reply)
  );

  app.get('/lotes/:id', { preHandler: [authMiddleware] }, (req, reply) =>
    loteController.getLote(req, reply)
  );

  app.post('/lotes', { preHandler: [authMiddleware] }, (req, reply) =>
    loteController.createLote(req, reply)
  );

  app.put('/lotes/:id', { preHandler: [authMiddleware] }, (req, reply) =>
    loteController.updateLote(req, reply)
  );

  app.delete('/lotes/:id', { preHandler: [authMiddleware] }, (req, reply) =>
    loteController.deleteLote(req, reply)
  );

  app.post('/lotes/:id/transferir', { preHandler: [authMiddleware] }, (req, reply) =>
    loteController.transferAnimals(req, reply)
  );
}
