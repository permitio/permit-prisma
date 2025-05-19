import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data first
  console.log('Clearing existing data...');
  
  // Delete all tasks first (due to foreign key constraints)
  await prisma.task.deleteMany({});
  console.log('Cleared all tasks');
  
  // Then delete all projects
  await prisma.project.deleteMany({});
  console.log('Cleared all projects');
  
  console.log('Database cleared, starting to seed new data...');

  // Create alpha project
  const projectAlpha = await prisma.project.create({
    data: {
      id: 'project_alpha',
      name: 'Alpha Project',
    }
  });

  // Create beta project
  const projectBeta = await prisma.project.create({
    data: {
      id: 'project_beta',
      name: 'Beta Project',
    }
  });

  // Create alpha tasks
  const taskAlpha1 = await prisma.task.create({
    data: {
      id: 'task-alpha-1',
      name: 'Alpha Task 1',
      description: 'First task in Project Alpha',
      projectId: projectAlpha.id
    }
  });

  const taskAlpha2 = await prisma.task.create({
    data: {
      id: 'task-alpha-2',
      name: 'Alpha Task 2',
      description: 'Second task in Project Alpha',
      projectId: projectAlpha.id
    }
  });

  // Create beta tasks
  const taskBeta1 = await prisma.task.create({
    data: {
      id: 'task-beta-1',
      name: 'Beta Task 1',
      description: 'First task in Project Beta',
      projectId: projectBeta.id
    }
  });

  const taskBeta2 = await prisma.task.create({
    data: {
      id: 'task-beta-2',
      name: 'Beta Task 2',
      description: 'Second task in Project Beta',
      projectId: projectBeta.id
    }
  });

  console.log('Seed data created:');
  console.log('Projects:', { projectAlpha, projectBeta });
  console.log('Tasks:', { taskAlpha1, taskAlpha2, taskBeta1, taskBeta2 });
}

main()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });