import { z } from 'zod';

export const registerSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(6),
  contaNome: z.string().min(1).optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
