import { z } from 'zod';

export const CreatePaiSchema = z.object({
  fazendaId: z.string().cuid(),
  nome: z.string().min(1),
  descricao: z.string().optional(),
});

export type CreatePaiDto = z.infer<typeof CreatePaiSchema>;
