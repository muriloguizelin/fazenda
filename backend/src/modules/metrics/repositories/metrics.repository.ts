import type { PrismaClient } from '@prisma/client';

export class MetricsRepository {
  constructor(private prisma: PrismaClient) {}

  async getPesagensInPeriod(fazendaId: string, since: Date, loteId?: string) {
    return this.prisma.pesagem.findMany({
      where: {
        data: { gte: since },
        animal: { 
          fazendaId,
          ...(loteId && { loteId }),
        },
      },
      include: {
        animal: { select: { id: true } },
      },
      orderBy: { data: 'asc' },
    });
  }
}
