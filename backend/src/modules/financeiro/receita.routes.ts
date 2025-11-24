import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ReceitaRepository } from './repositories/receita.repository.js';
import { ReceitaService } from './services/receita.service.js';
import { createReceitaSchema } from './dtos/create-receita.dto.js';

export async function receitaRoutes(app: FastifyInstance) {
  const repository = new ReceitaRepository(app.prisma);
  const service = new ReceitaService(repository);

  app.post('/', async (req, reply) => {
    const body = createReceitaSchema.parse(req.body);
    const receita = await service.create(body);
    return reply.status(201).send(receita);
  });

  app.get('/', async (req) => {
    const querySchema = z.object({
      fazendaId: z.string().cuid(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      categoria: z.string().optional(),
    });
    const { fazendaId, ...filters } = querySchema.parse(req.query);
    return service.findAll(fazendaId, filters);
  });

  app.delete('/:id', async (req, reply) => {
    const paramsSchema = z.object({ id: z.string().cuid() });
    const { id } = paramsSchema.parse(req.params);
    await service.delete(id);
    return reply.status(204).send();
  });

  app.get('/metrics', async (req) => {
    const querySchema = z.object({
      fazendaId: z.string().cuid(),
      period: z.enum(['30d', '90d', '1y']).optional().default('30d'),
    });
    const { fazendaId, period } = querySchema.parse(req.query);
    return service.getMetrics(fazendaId, period as any);
  });
}
