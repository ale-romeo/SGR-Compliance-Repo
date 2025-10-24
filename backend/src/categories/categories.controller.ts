import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, CreateCategorySchema } from './dto/create-category.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List of categories' })
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Category created' })
  async create(@Body(new ZodValidationPipe(CreateCategorySchema)) dto: CreateCategoryDto) {
    return this.service.create(dto);
  }
}
