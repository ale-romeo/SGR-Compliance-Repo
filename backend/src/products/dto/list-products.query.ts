import { z } from 'zod';
import { PaginationQuerySchema } from '../../common/pagination.dto';

export const ListProductsQuerySchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['price', 'created_at']).default('created_at').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type ListProductsQueryDto = z.infer<typeof ListProductsQuerySchema>;
