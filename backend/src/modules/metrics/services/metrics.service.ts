import type { MetricsRepository } from '../repositories/metrics.repository';
import type { GetPesoMetricsQuery, PesoMetricPoint } from '../dtos/peso-metrics-query.dto';

export class MetricsService {
  constructor(private metricsRepository: MetricsRepository) {}

  async getPesoMetrics(query: GetPesoMetricsQuery) {
    const days = query.days ?? 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const pesagens = await this.metricsRepository.getPesagensInPeriod(
      query.fazendaId,
      since,
      query.loteId
    );

    const aggregateByDay = new Map<string, { sum: number; count: number }>();

    for (const pesagem of pesagens) {
      const day = new Date(pesagem.data);
      day.setHours(0, 0, 0, 0);
      const dateKey = day.toISOString().slice(0, 10);

      const existing = aggregateByDay.get(dateKey) || { sum: 0, count: 0 };
      existing.sum += pesagem.peso;
      existing.count += 1;
      aggregateByDay.set(dateKey, existing);
    }

    const points: PesoMetricPoint[] = Array.from(aggregateByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({
        date,
        avg: parseFloat((value.sum / value.count).toFixed(2)),
      }));

    return { points };
  }
}
