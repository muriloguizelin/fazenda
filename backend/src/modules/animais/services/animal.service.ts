import type { AnimalRepository } from '../repositories/animal.repository';
import type { CreateAnimalDto } from '../dtos/create-animal.dto';
import type { UpdateAnimalDto } from '../dtos/update-animal.dto';
import type { ListAnimalsQuery } from '../dtos/list-animals-query.dto';

export class AnimalService {
  constructor(private animalRepository: AnimalRepository) {}

  async listAnimals(query: ListAnimalsQuery) {
    const result = await this.animalRepository.findMany(query);
    
    return {
      items: result.items,
      page: result.page,
      limit: result.limit,
      total: result.total,
    };
  }

  async getDistinctPrefixes(fazendaId: string) {
    const prefixes = await this.animalRepository.findDistinctPrefixes(fazendaId);
    return { prefixos: prefixes };
  }

  async getAnimalById(id: string) {
    const animal = await this.animalRepository.findById(id);

    if (!animal) {
      throw {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Animal não encontrado',
      };
    }

    return animal;
  }

  async createAnimal(dto: CreateAnimalDto) {
    const brinco = `${dto.prefixo}-${dto.numero}`;

    const existingAnimal = await this.animalRepository.findByBrinco(
      dto.fazendaId,
      brinco
    );

    if (existingAnimal) {
      throw {
        statusCode: 409,
        code: 'CONFLICT',
        message: `Brinco '${brinco}' já existe nesta fazenda`,
      };
    }

    const animal = await this.animalRepository.create({
      ...dto,
      brinco,
      nascimento: dto.nascimento ? new Date(dto.nascimento) : undefined,
    });

    return animal;
  }

  async updateAnimal(id: string, dto: UpdateAnimalDto) {
    const currentAnimal = await this.animalRepository.findById(id);

    if (!currentAnimal) {
      throw {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Animal não encontrado',
      };
    }

    const { peso, observacao, ...animalData } = dto;
    let updateData: any = { ...animalData };

    if (dto.prefixo || dto.numero) {
      const newPrefixo = dto.prefixo || currentAnimal.prefixo;
      const newNumero = dto.numero || currentAnimal.numero;
      const newBrinco = `${newPrefixo}-${newNumero}`;

      const duplicateAnimal = await this.animalRepository.findByBrinco(
        currentAnimal.fazendaId,
        newBrinco,
        id
      );

      if (duplicateAnimal) {
        throw {
          statusCode: 409,
          code: 'CONFLICT',
          message: `Brinco '${newBrinco}' já existe nesta fazenda`,
        };
      }

      updateData.brinco = newBrinco;
    }

    if (dto.nascimento) {
      updateData.nascimento = new Date(dto.nascimento);
    }

    const updatedAnimal = await this.animalRepository.updateWithPesagem(
      id,
      updateData,
      peso,
      observacao
    );

    return updatedAnimal;
  }
}
