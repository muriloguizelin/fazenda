import { PrismaClient } from '@prisma/client';
import { CreateDespesaDto } from '../dtos/create-despesa.dto.js';

export class DespesaRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateDespesaDto) {
    return this.prisma.despesa.create({
      data: {
        fazendaId: data.fazendaId,
        descricao: data.descricao,
        valor: data.valor,
        categoria: data.categoria,
        observacao: data.observacao,
        data: data.data ? new Date(data.data) : undefined,
      },
    });
  }

  async findAll(fazendaId: string, filters?: { startDate?: Date; endDate?: Date; categoria?: string }) {
    return this.prisma.despesa.findMany({
      where: {
        fazendaId,
        data: {
          gte: filters?.startDate,
          lte: filters?.endDate,
        },
        categoria: filters?.categoria as any,
      },
      orderBy: {
        data: 'desc',
      },
    });
  }

  async delete(id: string) {
    return this.prisma.despesa.delete({
      where: { id },
    });
  }

  async getMetrics(fazendaId: string, startDate: Date, endDate: Date) {
    const byCategory = await this.prisma.despesa.groupBy({
      by: ['categoria'],
      where: {
        fazendaId,
        data: { gte: startDate, lte: endDate },
      },
      _sum: {
        valor: true,
      },
    });

    const total = await this.prisma.despesa.aggregate({
      where: {
        fazendaId,
        data: { gte: startDate, lte: endDate },
      },
      _sum: {
        valor: true,
      },
    });

    // Agrupar por mês para gráfico de linha/barra
    // Prisma não tem groupBy por data formatada nativamente fácil, então vamos pegar os dados brutos e processar no service ou aqui
    // Para simplificar, vamos retornar os dados brutos das despesas desse período para o frontend ou service agrupar, 
    // ou fazer uma query raw se precisar de performance.
    // Vamos retornar as despesas para processamento.
    const rawExpenses = await this.prisma.despesa.findMany({
        where: {
            fazendaId,
            data: { gte: startDate, lte: endDate }
        },
        select: {
            data: true,
            valor: true
        }
    });

    return {
      byCategory,
      total: total._sum.valor || 0,
      rawExpenses
    };
  }
}
