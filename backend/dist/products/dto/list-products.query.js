"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProductsQuerySchema = void 0;
const zod_1 = require("zod");
const pagination_dto_1 = require("../../common/pagination.dto");
exports.ListProductsQuerySchema = pagination_dto_1.PaginationQuerySchema.extend({
    search: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    minPrice: zod_1.z.coerce.number().min(0).optional(),
    maxPrice: zod_1.z.coerce.number().min(0).optional(),
    sortBy: zod_1.z.enum(['price', 'created_at']).default('created_at').optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc').optional(),
});
//# sourceMappingURL=list-products.query.js.map