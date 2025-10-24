import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const SortOrderEnum = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderEnum>;

export const SortQuerySchema = z.object({
  sortOrder: SortOrderEnum.default('desc').optional(),
});
export type SortQuery = z.infer<typeof SortQuerySchema>;
