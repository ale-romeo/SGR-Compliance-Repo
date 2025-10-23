import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  async findAll(): Promise<any[]> {
    // TODO: implement with Prisma: return prisma.category.findMany({ orderBy: { name: 'asc' } })
    return [];
  }

  async create(dto: CreateCategoryDto): Promise<any> {
    // TODO: implement with Prisma: return prisma.category.create({ data: dto })
    return { id: 'todo', ...dto };
  }
}
