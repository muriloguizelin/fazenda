import { z } from 'zod';

export const createReceitaSchema = z.object({
  fazendaId: z.string().cuid(),
  descricao: z.string().min(3),
  valor: z.number().positive(),
  data: z.string().datetime().optional(), // ISO string
  categoria: z.enum(['VENDA_ANIMAIS', 'LEITE', 'SERVICOS', 'OUTROS']),
  observacao: z.string().optional(),
  animaisIds: z.array(z.string().cuid()).optional(), // IDs of animals sold
});

export type CreateReceitaDto = z.infer<typeof createReceitaSchema>;
