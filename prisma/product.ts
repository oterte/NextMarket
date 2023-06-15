import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const productData: Prisma.productsCreateInput[] = Array.apply(
  null,
  Array(100)
).map((_, index) => ({
  name: `Blue Jean ${index + 1}`,
  contents: `{"blocks":[{"key":"78vap","text":"This is Blue Jean ${
    index + 1
  }","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"4dr7g","text":"This is good stuff","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
  category_id: 1,
  image_url: `https://picsum.photos/id/${
    (index + 1) % 10 === 0 ? 10 : (index + 1) % 10
  }/250/150/`,
  price: Math.floor(Math.random() * (100000 - 20000) + 20000),
}));

async function main() {
  await prisma.products.deleteMany({});

  for (const p of productData) {
    const product = await prisma.products.create({
      data: p,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    process.exit(1);
  });
