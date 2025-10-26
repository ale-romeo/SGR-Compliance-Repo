"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategorySchema = void 0;
const zod_1 = require("zod");
exports.CreateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120),
});
//# sourceMappingURL=create-category.dto.js.map