import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MetricsService } from '../services/metrics.service';
import type { GetPesoMetricsQuery } from '../dtos/peso-metrics-query.dto';

export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  async getPesoMetrics(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as GetPesoMetricsQuery;

    if (query.days) {
      query.days = Number(query.days);
    }

    const result = await this.metricsService.getPesoMetrics(query);
    return result;
  }
}
