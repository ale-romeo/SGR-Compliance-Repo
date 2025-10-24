import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(120),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
