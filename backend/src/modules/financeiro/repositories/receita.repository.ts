import { PrismaClient, Receita, Prisma } from '@prisma/client';
import { CreateReceitaDto } from '../dtos/create-receita.dto';

export class ReceitaRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateReceitaDto): Promise<Receita> {
    const { animaisIds, ...receitaData } = data;

    // If there are animals, we connect them.
    // Also, if it is a sale (VENDA_ANIMAIS), we might want to update their status to VENDIDO?
    // For now, let's just link them. The service can handle status updates.
    
    return this.prisma.$transaction(async (tx) => {
      const receita = await tx.receita.create({
        data: {
          ...receitaData,
          animais: animaisIds ? {
            connect: animaisIds.map(id => ({ id }))
          } : undefined
        },
        include: {
          animais: true
        }
      });

      if (receitaData.categoria === 'VENDA_ANIMAIS' && animaisIds && animaisIds.length > 0) {
        await tx.animal.updateMany({
          where: { id: { in: animaisIds } },
          data: { status: 'VENDIDO' }
        });
      }

      return receita;
    });
  }

  async findAll(fazendaId: string, filters?: { startDate?: string; endDate?: string; categoria?: string }) {
    const where: Prisma.ReceitaWhereInput = {
      fazendaId,
    };

    if (filters?.startDate && filters?.endDate) {
      where.data = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    if (filters?.categoria) {
      where.categoria = filters.categoria as any;
    }

    return this.prisma.receita.findMany({
      where,
      orderBy: { data: 'desc' },
      include: { animais: { select: { brinco: true } } }
    });
  }

  async delete(id: string) {
    return this.prisma.receita.delete({ where: { id } });
  }
}
