import { z } from 'zod';

export const UpdatePaiSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
});

export type UpdatePaiDto = z.infer<typeof UpdatePaiSchema>;
