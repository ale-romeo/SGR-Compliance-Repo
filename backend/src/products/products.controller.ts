import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, CreateProductSchema } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductSchema } from './dto/update-product.dto';
import { ListProductsQueryDto, ListProductsQuerySchema } from './dto/list-products.query';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List products with filters/pagination' })
  async list(@Query(new ZodValidationPipe(ListProductsQuerySchema)) query: ListProductsQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200 })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201 })
  async create(@Body(new ZodValidationPipe(CreateProductSchema)) dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiResponse({ status: 200 })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(UpdateProductSchema)) dto: UpdateProductDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.service.remove(id);
    return;
  }
}
