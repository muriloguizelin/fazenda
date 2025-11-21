import type { FastifyRequest, FastifyReply } from 'fastify';
import type { LoteService } from '../services/lote.service';
import { createLoteSchema, type CreateLoteDto } from '../dtos/create-lote.dto';
import { transferAnimalsSchema, type TransferAnimalsDto } from '../dtos/transfer-animals.dto';
import type { ListLotesQuery } from '../dtos/list-lotes-query.dto';

export class LoteController {
  constructor(private loteService: LoteService) {}

  async listLotes(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as ListLotesQuery;

    if (query.page) {
      query.page = Number(query.page);
    }
    if (query.limit) {
      query.limit = Number(query.limit);
    }

    const result = await this.loteService.listLotes(query);
    return result;
  }

  async getLote(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const lote = await this.loteService.getLote(id);
    return lote;
  }

  async createLote(req: FastifyRequest, reply: FastifyReply) {
    const dto = createLoteSchema.parse(req.body) as CreateLoteDto;
    const lote = await this.loteService.createLote(dto);
    return reply.code(201).send(lote);
  }

  async updateLote(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const dto = req.body as Partial<CreateLoteDto>;
    const lote = await this.loteService.updateLote(id, dto);
    return lote;
  }

  async deleteLote(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    await this.loteService.deleteLote(id);
    return reply.code(204).send();
  }

  async transferAnimals(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const dto = transferAnimalsSchema.parse(req.body) as TransferAnimalsDto;
    const result = await this.loteService.transferAnimals(id, dto);
    return result;
  }
}
