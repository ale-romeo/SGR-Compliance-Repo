import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({ data: { name: dto.name } });
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Category name already exists');
      }
      throw e;
    }
  }
}
