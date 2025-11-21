import type { FastifyRequest, FastifyReply } from 'fastify';
import type { FazendaService } from '../services/fazenda.service';
import { createFazendaSchema, type CreateFazendaDto } from '../dtos/create-fazenda.dto';
import type { UpdateFazendaDto } from '../dtos/update-fazenda.dto';
import type { ListFazendasQuery } from '../dtos/list-fazendas-query.dto';

export class FazendaController {
  constructor(private fazendaService: FazendaService) {}

  async listFazendas(req: FastifyRequest, reply: FastifyReply) {
    const contaId = req.user!.contaId;
    const query = req.query as ListFazendasQuery;

    if (query.page) {
      query.page = Number(query.page);
    }
    if (query.limit) {
      query.limit = Number(query.limit);
    }
    if (query.order) {
      query.order = query.order === 'desc' ? 'desc' : 'asc';
    }

    const result = await this.fazendaService.listFazendas(contaId, query);
    return result;
  }

  async getFazenda(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const fazenda = await this.fazendaService.getFazenda(id);
    return fazenda;
  }

  async createFazenda(req: FastifyRequest, reply: FastifyReply) {
    const contaId = req.user!.contaId;
    const dto = createFazendaSchema.parse(req.body) as CreateFazendaDto;
    const fazenda = await this.fazendaService.createFazenda(contaId, dto);
    return reply.code(201).send(fazenda);
  }

  async updateFazenda(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const dto = req.body as UpdateFazendaDto;
    const fazenda = await this.fazendaService.updateFazenda(id, dto);
    return fazenda;
  }

  async deleteFazenda(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    await this.fazendaService.deleteFazenda(id);
    return reply.code(204).send();
  }
}
