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

// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
//   // Upsert one project
//   const project = await prisma.project.upsert({
//     where: { id: "project-alpha" },
//     update: {},
//     create: {
//       id: "project-alpha",
//       name: "Alpha Project",
//     },
//   });

//   // Upsert three tasks under that project
//   await prisma.task.upsert({
//     where: { id: "task-123" },
//     update: {},
//     create: {
//       id: "task-123",
//       title: "Fix Bug #42",
//       projectId: project.id,
//     },
//   });

//   await prisma.task.upsert({
//     where: { id: "task-456" },
//     update: {},
//     create: {
//       id: "task-456",
//       title: "Implement Feature X",
//       projectId: project.id,
//     },
//   });

//   await prisma.task.upsert({
//     where: { id: "task-789" },
//     update: {},
//     create: {
//       id: "task-789",
//       title: "Write Test Cases",
//       projectId: project.id,
//     },
//   });

//   console.log("✅ Seed complete: 1 project, 3 tasks");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function seed() {
//   await prisma.gDPRDocument.create({
//     data: {
//       title: "GDPR Document",
//       content: "Sensitive GDPR content",
//       data: "GDPR_protected",
//     },
//   });
//   console.log("Seeded GDPRDocument with data: GDPR_protected");
// }

// seed()
//   .catch((e) => console.error(e))
//   .finally(() => prisma.$disconnect());


// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// async function main() {
//   const blogs = [
//     {
//       title: 'Admin Blog Post 1',
//       content: 'This is a post created by the admin user',
//       published: true,
//       authorId: 'user1@permit.io'
//     },
//     {
//       title: 'Admin Blog Post 2',
//       content: 'Another post by the admin',
//       published: false,
//       authorId: 'user1@permit.io'
//     },
//     {
//       title: 'Editor Blog Post',
//       content: 'Content created by an editor',
//       published: true,
//       authorId: 'user2@permit.io'
//     },
//     {
//       title: 'Another Editor Post',
//       content: 'More content from an editor',
//       published: true,
//       authorId: 'user2@permit.io'
//     },
//     {
//       title: 'Draft Editor Post',
//       content: 'Unpublished content',
//       published: false,
//       authorId: 'user2@permit.io'
//     }
//   ];

//   console.log('Seeding blog data...');
  
//   for (const blog of blogs) {
//     await prisma.blog.create({
//       data: blog
//     });
//   }

//   console.log('Seeding completed successfully!');
// }

// main()
//   .catch((e) => {
//     console.error('Error during seeding:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding file data...');
  
  // Clear existing data
  await prisma.file.deleteMany({});
  
  // Define test data
  const files = [
    // Public files
    {
      title: 'Public Announcement',
      content: 'This is a public announcement for everyone',
      visibility: 'public',
      departmentId: 'marketing',
      ownerId: 'senior_manager@example.com'
    },
    {
      title: 'Employee Handbook',
      content: 'General guidelines for all employees',
      visibility: 'public',
      departmentId: 'hr',
      ownerId: 'employee@example.com'
    },
    
    // Internal files
    {
      title: 'Marketing Strategy',
      content: 'Internal marketing department strategy',
      visibility: 'internal',
      departmentId: 'marketing',
      ownerId: 'employee@example.com'
    },
    {
      title: 'HR Policy Updates',
      content: 'Internal HR department updates',
      visibility: 'internal',
      departmentId: 'hr',
      ownerId: 'senior_manager@example.com'
    },
    
    // Confidential files
    {
      title: 'Financial Forecasts',
      content: 'Confidential financial projections',
      visibility: 'confidential',
      departmentId: 'finance',
      ownerId: 'senior_manager@example.com'
    },
    {
      title: 'Personal File',
      content: 'Private content owned by file owner',
      visibility: 'confidential',
      departmentId: 'marketing',
      ownerId: 'file_owner@example.com'
    }
  ];
  
  // Insert data
  for (const file of files) {
    await prisma.file.create({
      data: file
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });