"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const where = {};
        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }
        if (query.categoryId) {
            where.categoryId = query.categoryId;
        }
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            where.price = {};
            if (query.minPrice !== undefined)
                where.price.gte = new client_1.Prisma.Decimal(query.minPrice);
            if (query.maxPrice !== undefined)
                where.price.lte = new client_1.Prisma.Decimal(query.maxPrice);
        }
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const sortField = query.sortBy === 'price' ? 'price' : 'createdAt';
        const sortOrder = query.sortOrder ?? 'desc';
        const [total, data] = await this.prisma.$transaction([
            this.prisma.product.count({ where }),
            this.prisma.product.findMany({
                where,
                orderBy: { [sortField]: sortOrder },
                skip,
                take,
            }),
        ]);
        const totalPages = Math.ceil(total / pageSize) || 1;
        return { data, page, pageSize, total, totalPages };
    }
    async getById(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async create(dto) {
        try {
            return await this.prisma.product.create({
                data: {
                    name: dto.name,
                    price: new client_1.Prisma.Decimal(dto.price),
                    categoryId: dto.categoryId ?? null,
                    tags: dto.tags ?? [],
                },
            });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            }
            throw e;
        }
    }
    async update(id, dto) {
        try {
            const data = {};
            if (dto.name !== undefined)
                data.name = dto.name;
            if (dto.price !== undefined)
                data.price = new client_1.Prisma.Decimal(dto.price);
            if (dto.categoryId !== undefined)
                data.categoryId = dto.categoryId;
            if (dto.tags !== undefined)
                data.tags = dto.tags;
            return await this.prisma.product.update({ where: { id }, data });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                throw new common_1.NotFoundException('Product not found');
            }
            throw e;
        }
    }
    async remove(id) {
        try {
            await this.prisma.product.delete({ where: { id } });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                throw new common_1.NotFoundException('Product not found');
            }
            throw e;
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map