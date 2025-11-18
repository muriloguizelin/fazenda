import { z } from 'zod';

export const transferAnimalsSchema = z.object({
  destinoLoteId: z.string(),
  animalIds: z.array(z.string()).min(1),
});

export type TransferAnimalsDto = z.infer<typeof transferAnimalsSchema>;
