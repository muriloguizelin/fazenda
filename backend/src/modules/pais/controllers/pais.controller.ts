import type { FastifyRequest, FastifyReply } from 'fastify';
import type { PaisService } from '../services/pais.service';
import type { CreatePaiDto } from '../dtos/create-pai.dto';
import type { UpdatePaiDto } from '../dtos/update-pai.dto';
import { CreatePaiSchema } from '../dtos/create-pai.dto';
import { UpdatePaiSchema } from '../dtos/update-pai.dto';

export class PaisController {
  constructor(private paisService: PaisService) {}

  async create(req: FastifyRequest, reply: FastifyReply) {
    const body = CreatePaiSchema.parse(req.body);
    const pai = await this.paisService.createPai(body);
    return reply.status(201).send(pai);
  }

  async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;
    const pai = await this.paisService.getPaiById(id);
    return reply.send(pai);
  }

  async listByFazenda(
    req: FastifyRequest<{ Querystring: { fazendaId: string } }>,
    reply: FastifyReply
  ) {
    const { fazendaId } = req.query;
    const pais = await this.paisService.listPaisByFazenda(fazendaId);
    return reply.send(pais);
  }

  async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;
    const body = UpdatePaiSchema.parse(req.body);
    const pai = await this.paisService.updatePai(id, body);
    return reply.send(pai);
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;
    await this.paisService.deletePai(id);
    return reply.status(204).send();
  }
}
