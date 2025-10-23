import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const catNames = ['Electronics', 'Books', 'Home'];
  const categories = await Promise.all(
    catNames.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const [electronics, books, home] = categories;

  await prisma.product.createMany({
    data: [
      {
        name: 'Wireless Mouse',
        price: new Prisma.Decimal(19.99),
        categoryId: electronics.id,
        tags: ['gadget', 'accessory'],
      },
      {
        name: 'TypeScript Handbook',
        price: new Prisma.Decimal(29.9),
        categoryId: books.id,
        tags: ['book', 'typescript'],
      },
      {
        name: 'Electric Kettle',
        price: new Prisma.Decimal(49.0),
        categoryId: home.id,
        tags: ['kitchen'],
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
