import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import helmet from 'helmet';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(helmet());
    // Validation is handled per-route using ZodValidationPipe

    prisma = app.get(PrismaService);
    await app.init();

    // Cleanup DB
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('health', async () => {
    await request(app.getHttpServer()).get('/api/v1/health').expect(200);
  });

  it('categories CRUD minimal', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .send({ name: 'Electronics' })
      .expect(201);
    expect(createRes.body).toHaveProperty('id');

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBe(1);

    // duplicate -> 409
    await request(app.getHttpServer())
      .post('/api/v1/categories')
      .send({ name: 'Electronics' })
      .expect(409);
  });

  it('products CRUD + list', async () => {
    const cat = await prisma.category.create({ data: { name: 'Books' } });

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/products')
      .send({ name: 'TS Handbook', price: 29.9, categoryId: cat.id, tags: ['book'] })
      .expect(201);
    const id = createRes.body.id;

    const getRes = await request(app.getHttpServer()).get(`/api/v1/products/${id}`).expect(200);
    expect(getRes.body.name).toBe('TS Handbook');

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/products')
      .query({ search: 'handbook', sortBy: 'price', sortOrder: 'asc', page: 1, pageSize: 10 })
      .expect(200);
    expect(listRes.body).toHaveProperty('data');
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.total).toBeGreaterThanOrEqual(1);

    await request(app.getHttpServer())
      .put(`/api/v1/products/${id}`)
      .send({ price: 25 })
      .expect(200);

    await request(app.getHttpServer()).delete(`/api/v1/products/${id}`).expect(204);

    await request(app.getHttpServer()).get(`/api/v1/products/${id}`).expect(404);
  });
});
