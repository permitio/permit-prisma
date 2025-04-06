// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   // Create a test user
//   const user = await prisma.user.upsert({
//     where: { email: "test2@example.com" },
//     update: {},
//     create: {
//       id: "user-456",
//       email: "test2@example.com",
//       name: "Second Test User",
//       role: "editor",
//     },
//   });

//   console.log("Seeded test user======>:", user);
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed post-1 (authorDepartment: "engineering", linked to user-123)
  const post1 = await prisma.post.upsert({
    where: { id: "post-1" },
    update: {},
    create: {
      id: "post-1",
      title: "Engineering Post",
      content: "This is a post by an engineering user.",
      published: true,
      authorId: "user-123", // Assumes user-123 exists
      authorDepartment: "engineering", // ABAC attribute
    },
  });

  // Seed post-2 (authorDepartment: "marketing", linked to user-456)
  const post2 = await prisma.post.upsert({
    where: { id: "post-2" },
    update: {},
    create: {
      id: "post-2",
      title: "Marketing Post",
      content: "This is a post by a marketing user.",
      published: true,
      authorId: "user-456", // Assumes user-456 exists
      authorDepartment: "marketing", // ABAC attribute
    },
  });

  console.log("Seeded test posts:", { post1, post2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
