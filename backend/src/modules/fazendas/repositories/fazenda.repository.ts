import type { PrismaClient } from '@prisma/client';
import type { ListFazendasQuery } from '../dtos/list-fazendas-query.dto';

export class FazendaRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(contaId: string, query: ListFazendasQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = query.sort ?? 'nome';
    const order = query.order ?? 'asc';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.fazenda.findMany({
        where: { contaId },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.fazenda.count({ where: { contaId } }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.fazenda.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            animais: true,
            lotes: true,
            pais: true,
          }
        }
      }
    });
  }

  async create(data: {
    nome: string;
    contaId: string;
    localizacao?: any;
    hectares?: number;
  }) {
    return this.prisma.fazenda.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.fazenda.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.fazenda.delete({ where: { id } });
  }
}
