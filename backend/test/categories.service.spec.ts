/* eslint-disable @typescript-eslint/no-explicit-any */
import { CategoriesService } from '../src/categories/categories.service'
import { PrismaService } from '../src/prisma/prisma.service'
import { ConflictException } from '@nestjs/common'
import { Prisma } from '@prisma/client'

describe('CategoriesService', () => {
  let service: CategoriesService
  let prisma: any

  beforeEach(() => {
    prisma = {
      category: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    } as any

    service = new CategoriesService(prisma)
  })

  it('findAll returns categories sorted by name asc', async () => {
    prisma.category.findMany.mockResolvedValueOnce([{ id: '1', name: 'A' }] as any)
    const res = await service.findAll()
    expect(prisma.category.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } })
    expect(res).toEqual([{ id: '1', name: 'A' }])
  })

  it('create returns new category and maps unique error to ConflictException', async () => {
    prisma.category.create.mockResolvedValueOnce({ id: '2', name: 'Books' } as any)
    const created = await service.create({ name: 'Books' })
    expect(prisma.category.create).toHaveBeenCalledWith({ data: { name: 'Books' } })
    expect(created).toEqual({ id: '2', name: 'Books' })

    // simulate unique constraint error
    const err = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '5.22.0',
    } as any)
    ;(prisma.category.create as any).mockRejectedValueOnce(err)
    await expect(service.create({ name: 'Books' })).rejects.toBeInstanceOf(ConflictException)
  })
})
