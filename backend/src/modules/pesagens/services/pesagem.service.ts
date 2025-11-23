import type { PesagemRepository } from '../repositories/pesagem.repository';
import type { CreatePesagemDto } from '../dtos/create-pesagem.dto';
import type { ListPesagensQuery } from '../dtos/list-pesagens-query.dto';

export class PesagemService {
  constructor(private pesagemRepository: PesagemRepository) {}

  async listPesagens(query: ListPesagensQuery) {
    const result = await this.pesagemRepository.findMany(query);
    
    return {
      items: result.items,
      page: result.page,
      limit: result.limit,
      total: result.total,
    };
  }

  async createPesagem(dto: CreatePesagemDto) {
    const pesagem = await this.pesagemRepository.createWithStatusUpdate({
      animalId: dto.animalId,
      peso: dto.peso,
      flag: dto.flag,
      observacao: dto.observacao,
<<<<<<< HEAD
      data: dto.data ? new Date(dto.data) : undefined,
=======
>>>>>>> ec2b2b825e6d61ed4df55de994311e26cf3e11b3
    });

    return pesagem;
  }
}
