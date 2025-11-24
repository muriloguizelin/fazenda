import { ReceitaRepository } from '../repositories/receita.repository';
import { CreateReceitaDto } from '../dtos/create-receita.dto';

export class ReceitaService {
  constructor(private repository: ReceitaRepository) {}

  async create(data: CreateReceitaDto) {
    return this.repository.create(data);
  }

  async findAll(fazendaId: string, filters?: { startDate?: string; endDate?: string; categoria?: string }) {
    return this.repository.findAll(fazendaId, filters);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }

  async getMetrics(fazendaId: string, period: '30d' | '90d' | '1y') {
    const now = new Date();
    let startDate = new Date();

    if (period === '30d') startDate.setDate(now.getDate() - 30);
    if (period === '90d') startDate.setDate(now.getDate() - 90);
    if (period === '1y') startDate.setFullYear(now.getFullYear() - 1);

    const receitas = await this.repository.findAll(fazendaId, {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    });

    const total = receitas.reduce((acc, r) => acc + r.valor, 0);

    const byCategory = receitas.reduce((acc: any, r) => {
      acc[r.categoria] = (acc[r.categoria] || 0) + r.valor;
      return acc;
    }, {});

    const monthlyChart = receitas.reduce((acc: any, r) => {
      const month = new Date(r.data).toLocaleString('default', { month: 'short' });
      const existing = acc.find((i: any) => i.date === month);
      if (existing) {
        existing.value += r.valor;
      } else {
        acc.push({ date: month, value: r.valor });
      }
      return acc;
    }, []);

    return {
      total,
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
      monthlyChart
    };
  }
}
