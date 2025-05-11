// example/rebac/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data first
  console.log('Clearing existing data...');
  
  // Delete all files first (due to foreign key constraints)
  await prisma.file.deleteMany({});
  console.log('Cleared all files');
  
  // Then delete all folders
  await prisma.folder.deleteMany({});
  console.log('Cleared all folders');
  
  console.log('Database cleared, starting to seed new data...');

  // Create test folders
  const folder1 = await prisma.folder.create({
    data: {
      id: 'folder1',  // Using a predictable ID for easy reference
      name: 'Test Folder 1',
      ownerId: 'owner_user'
    }
  });

  const folder2 = await prisma.folder.create({
    data: {
      id: 'folder2',
      name: 'Test Folder 2',
      ownerId: 'owner_user'
    }
  });

  // Create test files in those folders
  const file1 = await prisma.file.create({
    data: {
      id: 'file1',  // Using a predictable ID for easy reference
      name: 'Test File 1',
      content: 'This is the content of test file 1',
      folderId: folder1.id
    }
  });

  const file2 = await prisma.file.create({
    data: {
      id: 'file2',
      name: 'Test File 2',
      content: 'This is the content of test file 2',
      folderId: folder1.id
    }
  });

  const file3 = await prisma.file.create({
    data: {
      id: 'file3',
      name: 'Test File 3',
      content: 'This is the content of test file 3',
      folderId: folder2.id
    }
  });

  console.log('Seed data created:');
  console.log('Folders:', { folder1, folder2 });
  console.log('Files:', { file1, file2, file3 });
}

main()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });