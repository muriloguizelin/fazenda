import { z } from 'zod';

export const updateAnimalSchema = z.object({
  prefixo: z.string().min(3).max(4).regex(/^[A-Z]+$/).optional(),
  numero: z.number().int().min(1).max(10000).optional(),
  sexo: z.enum(['MACHO', 'FEMEA', 'DESCONHECIDO']).optional(),
  paiId: z.string().nullable().optional(),
  nascimento: z.string().datetime().optional(),
  origem: z.string().optional(),
  fotoUrl: z.string().url().nullable().optional(),
  loteId: z.string().nullable().optional(),
  status: z.enum(['ATIVO', 'MORTO', 'VENDIDO', 'DOENTE']).optional(),
  peso: z.number().positive().optional(),
  observacao: z.string().optional(),
});

export type UpdateAnimalDto = z.infer<typeof updateAnimalSchema>;
