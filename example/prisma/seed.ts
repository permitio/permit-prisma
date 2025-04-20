// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
//   // =========> POST TABLE <=========
//   // await prisma.document.deleteMany({});
//   // // Create test documents
//   // const doc1 = await prisma.document.create({
//   //   data: {
//   //     title: "Getting Started Guide",
//   //     content: "This is a guide to help you get started.",
//   //   },
//   // });
//   // const doc2 = await prisma.document.create({
//   //   data: {
//   //     title: "Project Roadmap",
//   //     content: "Our planned features and timeline.",
//   //   },
//   // });
//   // const doc3 = await prisma.document.create({
//   //   data: {
//   //     title: "Internal Policy",
//   //     content: "Company policies and procedures.",
//   //   },
//   // });
//   // console.log({ doc1, doc2, doc3 });

//   // =========> USER TABLE <=========

//   await prisma.invoice.deleteMany();

//   const invoice1 = await prisma.invoice.create({
//     data: {
//       amount: 1200.0,
//       department: "engineering",
//       issuedTo: "user1@permit.io",
//     },
//   });

//   const invoice2 = await prisma.invoice.create({
//     data: {
//       amount: 800.0,
//       department: "finance",
//       issuedTo: "user2@permit.io",
//     },
//   });

//   const invoice3 = await prisma.invoice.create({
//     data: {
//       amount: 3000.0,
//       department: "engineering",
//       issuedTo: "user3@permit.io",
//     },
//   });

//   console.log({ invoice1, invoice2, invoice3 });
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
  // Upsert one project
  const project = await prisma.project.upsert({
    where: { id: "project-alpha" },
    update: {},
    create: {
      id: "project-alpha",
      name: "Alpha Project",
    },
  });

  // Upsert three tasks under that project
  await prisma.task.upsert({
    where: { id: "task-123" },
    update: {},
    create: {
      id: "task-123",
      title: "Fix Bug #42",
      projectId: project.id,
    },
  });

  await prisma.task.upsert({
    where: { id: "task-456" },
    update: {},
    create: {
      id: "task-456",
      title: "Implement Feature X",
      projectId: project.id,
    },
  });

  await prisma.task.upsert({
    where: { id: "task-789" },
    update: {},
    create: {
      id: "task-789",
      title: "Write Test Cases",
      projectId: project.id,
    },
  });

  console.log("✅ Seed complete: 1 project, 3 tasks");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
