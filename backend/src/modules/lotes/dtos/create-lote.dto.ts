import { z } from 'zod';

export const createLoteSchema = z.object({
  fazendaId: z.string(),
  nome: z.string().min(1),
  prefixo: z.string().optional(),
  capacidade: z.number().int().optional(),
  animalIds: z.array(z.string()).optional(),
});

export type CreateLoteDto = z.infer<typeof createLoteSchema>;
