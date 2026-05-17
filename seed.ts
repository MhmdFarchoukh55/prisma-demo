import { faker } from "@faker-js/faker";

import { prisma } from "./lib/prisma";

async function main() {
  const publisher = await prisma.publisher.create({
    data: {
      name: faker.company.name(),
    },
  });

  const genreNames = ["Fantasy", "Romance", "Science Fiction"];

  const genres = await Promise.all(
    genreNames.map((name) =>
      prisma.genre.upsert({
        where: {
          name,
        },
        update: {},
        create: {
          name,
        },
      })
    )
  );

  const author = await prisma.author.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      books: {
        create: {
          title: faker.book.title(),
          publisher: {
            connect: {
              id: publisher.id,
            },
          },
          genres: {
            connect: genres.map((genre) => ({
              id: genre.id,
            })),
          },
        },
      },
    },
    include: {
      books: {
        include: {
          publisher: true,
          genres: true,
        },
      },
    },
  });

  console.log("Created author with book:", author);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
