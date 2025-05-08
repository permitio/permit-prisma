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


// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// async function main() {
//   console.log('Seeding file data...');
  
//   // Clear existing data
//   await prisma.file.deleteMany({});
  
//   // Define test data
//   const files = [
//     // Public files
//     {
//       title: 'Public Announcement',
//       content: 'This is a public announcement for everyone',
//       visibility: 'public',
//       departmentId: 'marketing',
//       ownerId: 'senior_manager@example.com'
//     },
//     {
//       title: 'Employee Handbook',
//       content: 'General guidelines for all employees',
//       visibility: 'public',
//       departmentId: 'hr',
//       ownerId: 'employee@example.com'
//     },
    
//     // Internal files
//     {
//       title: 'Marketing Strategy',
//       content: 'Internal marketing department strategy',
//       visibility: 'internal',
//       departmentId: 'marketing',
//       ownerId: 'employee@example.com'
//     },
//     {
//       title: 'HR Policy Updates',
//       content: 'Internal HR department updates',
//       visibility: 'internal',
//       departmentId: 'hr',
//       ownerId: 'senior_manager@example.com'
//     },
    
//     // Confidential files
//     {
//       title: 'Financial Forecasts',
//       content: 'Confidential financial projections',
//       visibility: 'confidential',
//       departmentId: 'finance',
//       ownerId: 'senior_manager@example.com'
//     },
//     {
//       title: 'Personal File',
//       content: 'Private content owned by file owner',
//       visibility: 'confidential',
//       departmentId: 'marketing',
//       ownerId: 'file_owner@example.com'
//     }
//   ];
  
//   // Insert data
//   for (const file of files) {
//     await prisma.file.create({
//       data: file
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

// prisma/seed.ts
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// async function main() {
//   console.log('Seeding file-folder structure...');
  
//   // Clear existing data
//   await prisma.file.deleteMany({});
//   await prisma.folder.deleteMany({});
  
//   // Create folders
//   const marketing = await prisma.folder.create({
//     data: {
//       id: 'marketing', // Use the same IDs as in Permit.io
//       name: 'Marketing'
//     }
//   });
  
//   const finance = await prisma.folder.create({
//     data: {
//       id: 'finance',
//       name: 'Finance'
//     }
//   });
  
//   const hr = await prisma.folder.create({
//     data: {
//       id: 'HR',
//       name: 'Human Resources'
//     }
//   });
  
//   const publicFolder = await prisma.folder.create({
//     data: {
//       id: 'public',
//       name: 'Public'
//     }
//   });

//   // Create files
//   await prisma.file.create({
//     data: {
//       id: 'Marketing_Plan2024', // Use the same IDs as in Permit.io
//       name: 'Marketing Plan 2024',
//       content: 'Marketing strategy for 2024',
//       folderId: marketing.id
//     }
//   });

//   await prisma.file.create({
//     data: {
//       id: 'Brand_Guidelines',
//       name: 'Brand Guidelines',
//       content: 'Company brand guidelines',
//       folderId: marketing.id
//     }
//   });

//   await prisma.file.create({
//     data: {
//       id: 'Q2_Budget',
//       name: 'Q2 Budget',
//       content: 'Financial budget for Q2',
//       folderId: finance.id
//     }
//   });

//   await prisma.file.create({
//     data: {
//       id: 'Tax_Documents',
//       name: 'Tax Documents',
//       content: 'Important tax documentation',
//       folderId: finance.id
//     }
//   });

//   await prisma.file.create({
//     data: {
//       id: 'Employee_Handbook',
//       name: 'Employee Handbook',
//       content: 'Guide for all employees',
//       folderId: hr.id
//     }
//   });

//   await prisma.file.create({
//     data: {
//       id: 'Recruitment_Plan',
//       name: 'Recruitment Plan',
//       content: 'Strategy for hiring new talent',
//       folderId: hr.id
//     }
//   });

//   await prisma.file.create({
//     data: {
//       id: 'Company_Overview',
//       name: 'Company Overview',
//       content: 'Public company information',
//       folderId: publicFolder.id
//     }
//   });

//   await prisma.file.create({
//     data: {
//       id: 'Annual_Report',
//       name: 'Annual Report',
//       content: 'Annual company report',
//       folderId: publicFolder.id
//     }
//   });

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


// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding project data for ABAC testing...');
  
  // Clear existing data
  await prisma.project.deleteMany({});
  
  // Create projects with different statuses
  const projects = [
    {
      id: "project-draft-1",
      name: "Marketing Campaign Planning",
      status: "draft"
    },
    {
      id: "project-draft-2",
      name: "New Product Roadmap",
      status: "draft"
    },
    {
      id: "project-active-1",
      name: "Website Redesign",
      status: "active"
    },
    {
      id: "project-active-2",
      name: "Mobile App Development",
      status: "active"
    },
    {
      id: "project-completed-1",
      name: "Q1 Sales Report",
      status: "completed"
    },
    {
      id: "project-completed-2",
      name: "Employee Training Program",
      status: "completed"
    }
  ];
  
  // Insert projects
  for (const project of projects) {
    await prisma.project.create({
      data: project
    });
  }

  console.log('✅ Projects seeded successfully!');
  
  // Log the seeded data
  const seededProjects = await prisma.project.findMany();
  console.log(`Created ${seededProjects.length} projects:`);
  console.table(seededProjects.map(p => ({
    id: p.id,
    name: p.name,
    status: p.status
  })));
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });