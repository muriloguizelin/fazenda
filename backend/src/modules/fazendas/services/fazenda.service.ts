import type { FazendaRepository } from '../repositories/fazenda.repository';
import type { CreateFazendaDto } from '../dtos/create-fazenda.dto';
import type { UpdateFazendaDto } from '../dtos/update-fazenda.dto';
import type { ListFazendasQuery } from '../dtos/list-fazendas-query.dto';

export class FazendaService {
  constructor(private fazendaRepository: FazendaRepository) {}

  async listFazendas(contaId: string, query: ListFazendasQuery) {
    const result = await this.fazendaRepository.findMany(contaId, query);
    
    return {
      items: result.items,
      page: result.page,
      limit: result.limit,
      total: result.total,
    };
  }

  async getFazenda(id: string) {
    const fazenda = await this.fazendaRepository.findById(id);
    if (!fazenda) {
      throw { statusCode: 404, message: 'Fazenda não encontrada' };
    }
    return fazenda;
  }

  async createFazenda(contaId: string, dto: CreateFazendaDto) {
    const fazenda = await this.fazendaRepository.create({
      nome: dto.nome,
      contaId,
      localizacao: dto.localizacao,
      hectares: dto.hectares,
    });

    return fazenda;
  }

  async updateFazenda(id: string, dto: UpdateFazendaDto) {
    const fazenda = await this.fazendaRepository.update(id, dto);
    return fazenda;
  }

  async deleteFazenda(id: string) {
    await this.fazendaRepository.delete(id);
  }
}
