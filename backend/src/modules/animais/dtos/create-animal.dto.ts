import { z } from 'zod';

export const createAnimalSchema = z.object({
  fazendaId: z.string(),
  prefixo: z.string().min(3).max(4).regex(/^[A-Z]+$/),
  numero: z.number().int().min(1).max(10000),
  sexo: z.enum(['MACHO', 'FEMEA', 'DESCONHECIDO']).optional(),
  paiId: z.string().optional(),
  nascimento: z.string().optional(), // We will handle parsing in the service or allow ISO string
  origem: z.string().optional(),
  fotoUrl: z.string().url().nullable().optional(),
  loteId: z.string().optional(),
});

export type CreateAnimalDto = z.infer<typeof createAnimalSchema>;
