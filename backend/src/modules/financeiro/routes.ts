import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { DespesaRepository } from './repositories/despesa.repository.js';
import { DespesaService } from './services/despesa.service.js';
import { createDespesaSchema } from './dtos/create-despesa.dto.js';

export async function despesaRoutes(app: FastifyInstance) {
  const repository = new DespesaRepository(app.prisma);
  const service = new DespesaService(repository);

  app.post('/', async (req, reply) => {
    const body = createDespesaSchema.parse(req.body);
    const despesa = await service.create(body);
    return reply.status(201).send(despesa);
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
