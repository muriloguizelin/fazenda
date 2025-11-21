import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { PesagemController } from './controllers/pesagem.controller';
import { PesagemService } from './services/pesagem.service';
import { PesagemRepository } from './repositories/pesagem.repository';

export async function pesagemRoutes(app: FastifyInstance) {
  const pesagemRepository = new PesagemRepository(app.prisma);
  const pesagemService = new PesagemService(pesagemRepository);
  const pesagemController = new PesagemController(pesagemService);

  app.get('/pesagens/:animalId', { preHandler: [authMiddleware] }, (req, reply) =>
    pesagemController.listPesagens(req, reply)
  );

  app.post('/pesagens', { preHandler: [authMiddleware] }, (req, reply) =>
    pesagemController.createPesagem(req, reply)
  );
}
