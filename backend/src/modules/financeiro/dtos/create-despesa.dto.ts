import { z } from 'zod';

export const createDespesaSchema = z.object({
  fazendaId: z.string().cuid(),
  descricao: z.string().min(3),
  valor: z.number().positive(),
  data: z.string().optional(), // Recebe como string ISO e converte
  categoria: z.enum(['PESSOAL', 'COMBUSTIVEL', 'RACAO', 'MANUTENCAO', 'MEDICAMENTOS', 'OUTROS']),
  observacao: z.string().optional(),
});

export type CreateDespesaDto = z.infer<typeof createDespesaSchema>;
