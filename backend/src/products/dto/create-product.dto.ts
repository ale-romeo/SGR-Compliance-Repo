import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(0),
  categoryId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
