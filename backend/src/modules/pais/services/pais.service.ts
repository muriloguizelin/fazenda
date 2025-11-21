import type { PaisRepository } from '../repositories/pais.repository';
import type { CreatePaiDto } from '../dtos/create-pai.dto';
import type { UpdatePaiDto } from '../dtos/update-pai.dto';

export class PaisService {
  constructor(private paisRepository: PaisRepository) {}

  async createPai(data: CreatePaiDto) {
    return this.paisRepository.create(data);
  }

  async getPaiById(id: string) {
    const pai = await this.paisRepository.findById(id);
    if (!pai) {
      throw new Error('Pai não encontrado');
    }
    return pai;
  }

  async listPaisByFazenda(fazendaId: string) {
    return this.paisRepository.findByFazenda(fazendaId);
  }

  async updatePai(id: string, data: UpdatePaiDto) {
    const pai = await this.paisRepository.findById(id);
    if (!pai) {
      throw new Error('Pai não encontrado');
    }
    return this.paisRepository.update(id, data);
  }

  async deletePai(id: string) {
    const pai = await this.paisRepository.findById(id);
    if (!pai) {
      throw new Error('Pai não encontrado');
    }
    await this.paisRepository.delete(id);
  }
}
