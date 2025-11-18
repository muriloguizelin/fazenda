import { z } from 'zod';

export const createFazendaSchema = z.object({
  nome: z.string().min(1),
  localizacao: z.any().optional(),
  hectares: z.number().optional(),
});

export type CreateFazendaDto = z.infer<typeof createFazendaSchema>;
