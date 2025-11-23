import type { PrismaClient, Prisma } from '@prisma/client';
import type { ListPesagensQuery } from '../dtos/list-pesagens-query.dto';

export class PesagemRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(query: ListPesagensQuery) {
    const where: Prisma.PesagemWhereInput = { 
      animalId: query.animalId 
    };

    if (query.dateFrom || query.dateTo) {
      where.data = {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { lte: new Date(query.dateTo) }),
      };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.pesagem.findMany({
        where,
        orderBy: { data: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.pesagem.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async createWithStatusUpdate(data: {
    animalId: string;
    peso: number;
    flag: string;
    observacao?: string;
<<<<<<< HEAD
    data?: Date;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const pesagem = await tx.pesagem.create({
        data: {
          animalId: data.animalId,
          peso: data.peso,
          flag: data.flag,
          observacao: data.observacao,
          data: data.data,
        } as any,
=======
  }) {
    return this.prisma.$transaction(async (tx) => {
      const pesagem = await tx.pesagem.create({
        data: data as any,
>>>>>>> ec2b2b825e6d61ed4df55de994311e26cf3e11b3
      });

      await tx.animal.update({
        where: { id: data.animalId },
        data: { status: data.flag as any },
      });

      return pesagem;
    });
  }
}
