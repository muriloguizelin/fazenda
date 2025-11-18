import type { FastifyRequest, FastifyReply } from 'fastify';
import type { PesagemService } from '../services/pesagem.service';
import { createPesagemSchema, type CreatePesagemDto } from '../dtos/create-pesagem.dto';
import type { ListPesagensQuery } from '../dtos/list-pesagens-query.dto';

export class PesagemController {
  constructor(private pesagemService: PesagemService) {}

  async listPesagens(req: FastifyRequest, reply: FastifyReply) {
    const { animalId } = req.params as { animalId: string };
    const query = req.query as Omit<ListPesagensQuery, 'animalId'>;

    const fullQuery: ListPesagensQuery = {
      animalId,
      ...query,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    };

    const result = await this.pesagemService.listPesagens(fullQuery);
    return result;
  }

  async createPesagem(req: FastifyRequest, reply: FastifyReply) {
    const dto = createPesagemSchema.parse(req.body) as CreatePesagemDto;
    const pesagem = await this.pesagemService.createPesagem(dto);
    return reply.code(201).send(pesagem);
  }
}
