import type { LoteRepository } from '../repositories/lote.repository';
import type { CreateLoteDto } from '../dtos/create-lote.dto';
import type { TransferAnimalsDto } from '../dtos/transfer-animals.dto';
import type { ListLotesQuery } from '../dtos/list-lotes-query.dto';

export class LoteService {
  constructor(private loteRepository: LoteRepository) {}

  async listLotes(query: ListLotesQuery) {
    const result = await this.loteRepository.findMany(query);
    
    return {
      items: result.items,
      page: result.page,
      limit: result.limit,
      total: result.total,
    };
  }

  async getLote(id: string) {
    const lote = await this.loteRepository.findById(id);
    if (!lote) {
      throw { statusCode: 404, message: 'Lote não encontrado' };
    }
    return lote;
  }

  async createLote(dto: CreateLoteDto) {
    const lote = await this.loteRepository.create({
      fazendaId: dto.fazendaId,
      nome: dto.nome,
      prefixo: dto.prefixo,
      capacidade: dto.capacidade,
    });

    if (dto.animalIds && dto.animalIds.length > 0) {
      await this.loteRepository.assignAnimalsToLote(lote.id, dto.animalIds);
    }

    return lote;
  }

  async updateLote(id: string, dto: Partial<CreateLoteDto>) {
    const lote = await this.loteRepository.update(id, {
      nome: dto.nome,
      prefixo: dto.prefixo,
      capacidade: dto.capacidade,
    });
    return lote;
  }

  async deleteLote(id: string) {
    await this.loteRepository.delete(id);
  }

  async transferAnimals(
    origemLoteId: string,
    dto: TransferAnimalsDto
  ) {
    const transferredCount = await this.loteRepository.transferAnimals(
      origemLoteId,
      dto.destinoLoteId,
      dto.animalIds
    );

    return { transferidos: transferredCount };
  }
}
