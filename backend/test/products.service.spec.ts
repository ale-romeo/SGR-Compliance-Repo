/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductsService } from '../src/products/products.service'
import { PrismaService } from '../src/prisma/prisma.service'
import { Prisma } from '@prisma/client'

describe('ProductsService', () => {
  let service: ProductsService
  let prisma: any

  beforeEach(() => {
    prisma = {
      product: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(async (promises: any[]) => Promise.all(promises)),
    } as any

    service = new ProductsService(prisma)
  })

  it('lists with default sorting (createdAt desc) and pagination', async () => {
    prisma.product.count.mockResolvedValue(12)
    prisma.product.findMany.mockResolvedValueOnce([] as any)

    const res = await service.list({ page: 2, pageSize: 5 } as any)

    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.product.count).toHaveBeenCalledWith({ where: {} })
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
        skip: 5,
        take: 5,
      }),
    )
    expect(res).toEqual({ data: [], page: 2, pageSize: 5, total: 12, totalPages: 3 })
  })

  it('applies filters and sorts by price asc when requested', async () => {
    prisma.product.count.mockResolvedValue(1)
    prisma.product.findMany.mockResolvedValueOnce([{
      id: 'p1', name: 'A', price: new Prisma.Decimal('10.00'),
      tags: [], categoryId: null, createdAt: new Date()
    }] as any)

    const query = {
      search: 'abc',
      categoryId: 'cat1',
      minPrice: 10,
      maxPrice: 20,
      sortBy: 'price',
      sortOrder: 'asc',
      page: 1,
      pageSize: 10,
    } as any

    await service.list(query)

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { contains: 'abc', mode: 'insensitive' },
          categoryId: 'cat1',
          price: expect.objectContaining({ gte: expect.anything(), lte: expect.anything() }),
        }),
        orderBy: { price: 'asc' },
      }),
    )
  })

  it('returns empty page with totalPages=1 when no results', async () => {
    prisma.product.count.mockResolvedValueOnce(0)
    prisma.product.findMany.mockResolvedValueOnce([])

    const res = await service.list({ page: 3, pageSize: 10 } as any)
    expect(res).toEqual({ data: [], page: 3, pageSize: 10, total: 0, totalPages: 1 })
  })

  it('maps Prisma P2025 on update to NotFoundException', async () => {
    const err = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: '5.22.0',
    } as any)
    prisma.product.update.mockRejectedValueOnce(err as any)

    await expect(service.update('missing-id', { name: 'X' } as any)).rejects.toMatchObject({
      status: 404,
    })
  })
})
