"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductSchema = void 0;
const zod_1 = require("zod");
exports.CreateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    price: zod_1.z.coerce.number().min(0),
    categoryId: zod_1.z.string().uuid().nullable().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
//# sourceMappingURL=create-product.dto.js.map