import type { PrismaClient, Pai } from '@prisma/client';
import type { CreatePaiDto } from '../dtos/create-pai.dto';
import type { UpdatePaiDto } from '../dtos/update-pai.dto';

export class PaisRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreatePaiDto): Promise<Pai> {
    return this.prisma.pai.create({
      data,
    });
  }

  async findById(id: string): Promise<Pai | null> {
    return this.prisma.pai.findUnique({
      where: { id },
    });
  }

  async findByFazenda(fazendaId: string): Promise<Pai[]> {
    return this.prisma.pai.findMany({
      where: { fazendaId },
      orderBy: { nome: 'asc' },
    });
  }

  async update(id: string, data: UpdatePaiDto): Promise<Pai> {
    return this.prisma.pai.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pai.delete({
      where: { id },
    });
  }
}
