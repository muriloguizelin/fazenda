import { z } from 'zod';

export const createPesagemSchema = z.object({
  animalId: z.string(),
  peso: z.number().positive(),
  flag: z.enum(['ATIVO', 'MORTO', 'VENDIDO', 'DOENTE']),
  observacao: z.string().optional(),
<<<<<<< HEAD
  data: z.string().optional(),
=======
>>>>>>> ec2b2b825e6d61ed4df55de994311e26cf3e11b3
});

export type CreatePesagemDto = z.infer<typeof createPesagemSchema>;
