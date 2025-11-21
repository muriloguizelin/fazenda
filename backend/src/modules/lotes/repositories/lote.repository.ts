import type { PrismaClient, Prisma } from '@prisma/client';
import type { ListLotesQuery } from '../dtos/list-lotes-query.dto';

export class LoteRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(query: ListLotesQuery) {
    const where: Prisma.LoteWhereInput = { 
      fazendaId: query.fazendaId 
    };

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.lote.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { animais: true }
          }
        }
      }),
      this.prisma.lote.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.lote.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { animais: true }
        }
      }
    });
  }

  async create(data: {
    fazendaId: string;
    nome: string;
    prefixo?: string;
    capacidade?: number;
  }) {
    return this.prisma.lote.create({ data });
  }

  async update(id: string, data: {
    nome?: string;
    prefixo?: string;
    capacidade?: number;
  }) {
    return this.prisma.lote.update({ 
      where: { id }, 
      data 
    });
  }

  async delete(id: string) {
    return this.prisma.lote.delete({ where: { id } });
  }

  async assignAnimalsToLote(loteId: string, animalIds: string[]) {
    return this.prisma.animal.updateMany({
      where: { id: { in: animalIds } },
      data: { loteId },
    });
  }

  async transferAnimals(
    origemLoteId: string,
    destinoLoteId: string,
    animalIds: string[]
  ) {
    const result = await this.prisma.animal.updateMany({
      where: {
        id: { in: animalIds },
        loteId: origemLoteId,
      },
      data: {
        loteId: destinoLoteId,
      },
    });

    return result.count;
  }
}
