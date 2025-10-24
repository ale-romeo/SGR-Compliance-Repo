import { z } from 'zod';

import { CreateProductSchema } from './create-product.dto';

export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
