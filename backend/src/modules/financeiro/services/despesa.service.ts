import { DespesaRepository } from '../repositories/despesa.repository.js';
import { CreateDespesaDto } from '../dtos/create-despesa.dto.js';

export class DespesaService {
  constructor(private despesaRepository: DespesaRepository) {}

  async create(data: CreateDespesaDto) {
    return this.despesaRepository.create(data);
  }

  async findAll(fazendaId: string, query: { startDate?: string; endDate?: string; categoria?: string }) {
    return this.despesaRepository.findAll(fazendaId, {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      categoria: query.categoria,
    });
  }

  async delete(id: string) {
    return this.despesaRepository.delete(id);
  }

  async getMetrics(fazendaId: string, period: '30d' | '90d' | '1y' = '30d') {
    const endDate = new Date();
    const startDate = new Date();

    if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);

    const metrics = await this.despesaRepository.getMetrics(fazendaId, startDate, endDate);

    // Processar dados para gráfico mensal
    const monthlyData: Record<string, number> = {};
    metrics.rawExpenses.forEach(d => {
        const key = d.data.toISOString().slice(0, 7); // YYYY-MM
        monthlyData[key] = (monthlyData[key] || 0) + d.valor;
    });

    const monthlyChart = Object.entries(monthlyData)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total: metrics.total,
      byCategory: metrics.byCategory.map(c => ({
        name: c.categoria,
        value: c._sum.valor || 0
      })),
      monthlyChart
    };
  }
}
