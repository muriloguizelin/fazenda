import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { MetricsController } from './controllers/metrics.controller';
import { MetricsService } from './services/metrics.service';
import { MetricsRepository } from './repositories/metrics.repository';

export async function metricsRoutes(app: FastifyInstance) {
  const metricsRepository = new MetricsRepository(app.prisma);
  const metricsService = new MetricsService(metricsRepository);
  const metricsController = new MetricsController(metricsService);

  app.get('/metrics/peso', { preHandler: [authMiddleware] }, (req, reply) =>
    metricsController.getPesoMetrics(req, reply)
  );
}
