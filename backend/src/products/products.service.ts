import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQueryDto } from './dto/list-products.query';

@Injectable()
export class ProductsService {
  async list(query: ListProductsQueryDto) {
    // TODO: implement Prisma filtering, sorting, pagination
    // Example shape:
    // return {
    //   data: [],
    //   page: query.page!,
    //   pageSize: query.pageSize!,
    //   total: 0,
    //   totalPages: 0,
    // };
    return { data: [], page: query.page ?? 1, pageSize: query.pageSize ?? 20, total: 0, totalPages: 0 };
  }

  async getById(id: string) {
    // TODO: return prisma.product.findUnique({ where: { id } }) and throw 404 if not found
    return { id };
  }

  async create(dto: CreateProductDto) {
    // TODO: prisma.product.create({ data: dto })
    return { id: 'todo', ...dto };
  }

  async update(id: string, dto: UpdateProductDto) {
    // TODO: prisma.product.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  async remove(id: string) {
    // TODO: prisma.product.delete({ where: { id } })
    return { id, deleted: true };
  }
}
