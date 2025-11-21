import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { AnimalController } from './controllers/animal.controller';
import { AnimalService } from './services/animal.service';
import { AnimalRepository } from './repositories/animal.repository';

export async function animalRoutes(app: FastifyInstance) {
  const animalRepository = new AnimalRepository(app.prisma);
  const animalService = new AnimalService(animalRepository);
  const animalController = new AnimalController(animalService);

  app.get('/animais', { preHandler: [authMiddleware] }, (req, reply) =>
    animalController.listAnimals(req, reply)
  );

  app.get('/animais/prefixos', { preHandler: [authMiddleware] }, (req, reply) =>
    animalController.getDistinctPrefixes(req, reply)
  );

  app.get('/animais/:id', { preHandler: [authMiddleware] }, (req, reply) =>
    animalController.getAnimalById(req, reply)
  );

  app.post('/animais', { preHandler: [authMiddleware] }, (req, reply) =>
    animalController.createAnimal(req, reply)
  );

  app.put('/animais/:id', { preHandler: [authMiddleware] }, (req, reply) =>
    animalController.updateAnimal(req, reply)
  );
}
