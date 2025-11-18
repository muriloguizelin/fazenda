import { z } from 'zod';

export const createPesagemSchema = z.object({
  animalId: z.string(),
  peso: z.number().positive(),
  flag: z.enum(['ATIVO', 'MORTO', 'VENDIDO', 'DOENTE']),
  observacao: z.string().optional(),
});

export type CreatePesagemDto = z.infer<typeof createPesagemSchema>;
