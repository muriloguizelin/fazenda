import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { PaisController } from './controllers/pais.controller';
import { PaisService } from './services/pais.service';
import { PaisRepository } from './repositories/pais.repository';

export async function paisRoutes(app: FastifyInstance) {
  const paisRepository = new PaisRepository(app.prisma);
  const paisService = new PaisService(paisRepository);
  const paisController = new PaisController(paisService);

  app.post('/pais', { preHandler: [authMiddleware] }, (req, reply) =>
    paisController.create(req, reply)
  );

  app.get('/pais', { preHandler: [authMiddleware] }, (req, reply) =>
    paisController.listByFazenda(req, reply)
  );

  app.get('/pais/:id', { preHandler: [authMiddleware] }, (req, reply) =>
    paisController.getById(req, reply)
  );

  app.put('/pais/:id', { preHandler: [authMiddleware] }, (req, reply) =>
    paisController.update(req, reply)
  );

  app.delete('/pais/:id', { preHandler: [authMiddleware] }, (req, reply) =>
    paisController.delete(req, reply)
  );
}
