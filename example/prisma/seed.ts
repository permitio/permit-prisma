import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // =========> POST TABLE <=========
  // await prisma.document.deleteMany({});
  // // Create test documents
  // const doc1 = await prisma.document.create({
  //   data: {
  //     title: "Getting Started Guide",
  //     content: "This is a guide to help you get started.",
  //   },
  // });
  // const doc2 = await prisma.document.create({
  //   data: {
  //     title: "Project Roadmap",
  //     content: "Our planned features and timeline.",
  //   },
  // });
  // const doc3 = await prisma.document.create({
  //   data: {
  //     title: "Internal Policy",
  //     content: "Company policies and procedures.",
  //   },
  // });
  // console.log({ doc1, doc2, doc3 });

  // =========> USER TABLE <=========

  await prisma.invoice.deleteMany();

  const invoice1 = await prisma.invoice.create({
    data: {
      amount: 1200.0,
      department: "engineering",
      issuedTo: "user1@permit.io",
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      amount: 800.0,
      department: "finance",
      issuedTo: "user2@permit.io",
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      amount: 3000.0,
      department: "engineering",
      issuedTo: "user3@permit.io",
    },
  });

  console.log({ invoice1, invoice2, invoice3 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
