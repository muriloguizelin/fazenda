import type { PrismaClient, Prisma } from '@prisma/client';
import type { ListAnimalsQuery } from '../dtos/list-animals-query.dto';

export class AnimalRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(query: ListAnimalsQuery) {
    const where: Prisma.AnimalWhereInput = { 
      fazendaId: query.fazendaId 
    };

    if (query.prefixo) where.prefixo = query.prefixo;
    if (query.numero) where.numero = query.numero;
    if (query.loteId) where.loteId = query.loteId;
    if (query.status) where.status = query.status as any;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = query.sort ?? 'brinco';
    const order = query.order ?? 'asc';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.animal.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          pesagens: { orderBy: { data: 'desc' }, take: 1 },
          lote: true,
          pai: { select: { id: true, nome: true } },
        },
      }),
      this.prisma.animal.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findDistinctPrefixes(fazendaId: string) {
    const prefixes = await this.prisma.animal.findMany({
      where: { fazendaId },
      select: { prefixo: true },
      distinct: ['prefixo'],
      orderBy: { prefixo: 'asc' },
    });

    return prefixes.map(p => p.prefixo);
  }

  async findById(id: string) {
    return this.prisma.animal.findUnique({
      where: { id },
      include: {
        pesagens: { orderBy: { data: 'desc' }, take: 1 },
        lote: true,
        pai: { select: { id: true, nome: true } },
      },
    });
  }

  async findByBrinco(fazendaId: string, brinco: string, excludeId?: string) {
    return this.prisma.animal.findFirst({
      where: {
        fazendaId,
        brinco,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  async create(data: {
    fazendaId: string;
    prefixo: string;
    numero: number;
    brinco: string;
    sexo?: string;
    raca?: string;
    nascimento?: Date;
    origem?: string;
    fotoUrl?: string | null;
    loteId?: string;
  }) {
    return this.prisma.animal.create({ data: data as any });
  }

  async updateWithPesagem(
    id: string,
    animalData: any,
    peso?: number,
    observacao?: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.animal.update({
        where: { id },
        data: animalData,
        include: {
          lote: true,
          pesagens: { orderBy: { data: 'desc' }, take: 1 },
        },
      });

      if (peso) {
        await tx.pesagem.create({
          data: {
            animalId: id,
            peso,
            flag: updated.status,
            observacao: observacao || 'Peso/status atualizado via edição',
          },
        });
      }

      return updated;
    });
  }
}
