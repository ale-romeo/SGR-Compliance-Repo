import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQueryDto } from './dto/list-products.query';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListProductsQueryDto) {
    const where: Prisma.ProductWhereInput = {};
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: Prisma.DecimalFilter = {}
      if (query.minPrice !== undefined) priceFilter.gte = new Prisma.Decimal(query.minPrice)
      if (query.maxPrice !== undefined) priceFilter.lte = new Prisma.Decimal(query.maxPrice)
      where.price = priceFilter
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

  async getById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: {
          name: dto.name,
          price: new Prisma.Decimal(dto.price),
          categoryId: dto.categoryId ?? null,
          tags: dto.tags ?? [],
        },
      });
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // Optionally map foreign key errors
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    try {
      const data: Prisma.ProductUncheckedUpdateInput = {};
      if (dto.name !== undefined) data.name = dto.name;
      if (dto.price !== undefined) data.price = new Prisma.Decimal(dto.price);
      if (dto.categoryId !== undefined) data.categoryId = dto.categoryId; // allow null to unset
      if (dto.tags !== undefined) data.tags = dto.tags as string[];

      return await this.prisma.product.update({ where: { id }, data });
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        // record not found
        throw new NotFoundException('Product not found');
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('Product not found');
      }
      throw e;
    }
  }
}
