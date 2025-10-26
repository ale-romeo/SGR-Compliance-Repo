import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

function pick<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  while (out.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length)
    out.push(copy.splice(i, 1)[0])
  }
  return out
}

async function main() {
  // Start clean for dev/demo purposes
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  const categoriesData = ['Electronics', 'Books', 'Home', 'Toys', 'Outdoors', 'Office']
  const categories = await Promise.all(
    categoriesData.map((name) => prisma.category.create({ data: { name } }))
  )

  const adjectives = ['Wireless', 'Smart', 'Portable', 'Compact', 'Durable', 'Eco', 'Pro', 'Lite', 'Ultra', 'Classic']
  const nouns = ['Mouse', 'Headphones', 'Speaker', 'Notebook', 'Backpack', 'Bottle', 'Lamp', 'Chair', 'Kettle', 'Charger', 'Keyboard', 'Camera', 'Book', 'Mug']
  const tagPool = ['gadget', 'home', 'office', 'kitchen', 'audio', 'eco', 'new', 'sale', 'gift', 'premium']

  const products: Prisma.ProductCreateManyInput[] = Array.from({ length: 60 }).map(() => {
    const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`
    const price = new Prisma.Decimal((Math.random() * 490 + 10).toFixed(2))
    const category = categories[Math.floor(Math.random() * categories.length)]
    const tags = pick(tagPool, Math.floor(Math.random() * 3))
    return { name, price, categoryId: category.id, tags }
  })

  await prisma.product.createMany({ data: products })

  console.log(`Seeded ${categories.length} categories and ${products.length} products`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
