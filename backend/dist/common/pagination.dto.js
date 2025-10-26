"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortQuerySchema = exports.SortOrderEnum = exports.PaginationQuerySchema = void 0;
const zod_1 = require("zod");
exports.PaginationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
exports.SortOrderEnum = zod_1.z.enum(['asc', 'desc']);
exports.SortQuerySchema = zod_1.z.object({
    sortOrder: exports.SortOrderEnum.default('desc').optional(),
});
//# sourceMappingURL=pagination.dto.js.map