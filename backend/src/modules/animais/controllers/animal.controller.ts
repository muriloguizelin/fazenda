import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AnimalService } from '../services/animal.service';
import { createAnimalSchema, type CreateAnimalDto } from '../dtos/create-animal.dto';
import { updateAnimalSchema, type UpdateAnimalDto } from '../dtos/update-animal.dto';
import type { ListAnimalsQuery } from '../dtos/list-animals-query.dto';

export class AnimalController {
  constructor(private animalService: AnimalService) {}

  async listAnimals(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as ListAnimalsQuery;
    
    if (query.numero) {
      query.numero = Number(query.numero);
    }
    if (query.page) {
      query.page = Number(query.page);
    }
    if (query.limit) {
      query.limit = Number(query.limit);
    }
    if (query.order) {
      query.order = query.order.toLowerCase() === 'desc' ? 'desc' : 'asc';
    }

    const result = await this.animalService.listAnimals(query);
    return result;
  }

  async getDistinctPrefixes(req: FastifyRequest, reply: FastifyReply) {
    const { fazendaId } = req.query as { fazendaId: string };
    const result = await this.animalService.getDistinctPrefixes(fazendaId);
    return result;
  }

  async getAnimalById(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const animal = await this.animalService.getAnimalById(id);
      return animal;
    } catch (error: any) {
      if (error.statusCode) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      throw error;
    }
  }

  async createAnimal(req: FastifyRequest, reply: FastifyReply) {
    try {
      const dto = createAnimalSchema.parse(req.body) as CreateAnimalDto;
      const animal = await this.animalService.createAnimal(dto);
      return reply.code(201).send(animal);
    } catch (error: any) {
      if (error.statusCode) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      throw error;
    }
  }

  async updateAnimal(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const dto = updateAnimalSchema.parse(req.body) as UpdateAnimalDto;
      const animal = await this.animalService.updateAnimal(id, dto);
      return animal;
    } catch (error: any) {
      if (error.statusCode) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      throw error;
    }
  }
}
