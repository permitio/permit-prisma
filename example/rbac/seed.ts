// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   await prisma.document.createMany({
//     data: [
//       {
//         title: "Admin Document 1",
//         content: "This is a document owned by the admin.",
//         ownerId: "admin@example.com",
//       },
//       {
//         title: "Customer Document 1",
//         content: "This is a document owned by the customer.",
//         ownerId: "customer@example.com",
//       },
//       {
//         title: "Admin Document 2",
//         content: "Another admin-owned document.",
//         ownerId: "admin@example.com",
//       },
//     ],
//   });

//   console.log("Seeded documents!");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
