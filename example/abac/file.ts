// examples/abac/file.ts
import { PrismaClient } from '@prisma/client';
import createPermitClientExtension, { AccessControlModel } from '../../src';
import dotenv from 'dotenv';
import logger from '../../src/utils/logger';

// Load environment variables
dotenv.config();

// Configure Permit integration
const permitConfig = {
  token: process.env.PERMIT_API_KEY!,
  pdp: process.env.PERMIT_PDP_URL || "http://localhost:7766",
  debug: true,
};

// Create extended Prisma client with Permit
const prisma = new PrismaClient().$extends(
  createPermitClientExtension({
    permitConfig,
    enableAutomaticChecks: true,
    accessControlModel: AccessControlModel.ABAC
  })
);

async function testFileOwnerPermissions() {
  logger.info("Testing File Owner Permissions");
  
  try {
    // Set the user context to file owner
    prisma.$permit.setUser("file_owner@example.com");
    
    logger.info("Testing File Owner read access to their own file...");
    const ownedFiles = await prisma.file.findMany({
      where: {
        ownerId: "file_owner@example.com"
      }
    });
    logger.info(`✅ File Owner can read their files. Found ${ownedFiles.length} files.`);
    
    // Test updating own file
    if (ownedFiles.length > 0) {
      const fileId = ownedFiles[0].id;
      logger.info(`Testing File Owner update access to their own file (ID: ${fileId})...`);
      
      const updatedFile = await prisma.file.update({
        where: { id: fileId },
        data: { title: "Updated by Owner", ownerId: "file_owner@example.com"}
      });
      logger.info(`✅ File Owner can update their own file: ${updatedFile.title}`);
      
      // Try to access a file they don't own
      logger.info("Testing File Owner access to files they don't own (should fail)...");
      try {
        const notOwnedFile = await prisma.file.findFirst({
          where: {
            ownerId: { not: "file_owner@example.com" },
            visibility: "confidential"
          }
        });
        
        if (notOwnedFile) {
          await prisma.file.update({
            where: { id: notOwnedFile.id },
            data: { title: "This should fail" }
          });
          logger.error("❌ File Owner unexpectedly allowed to update a file they don't own");
        }
      } catch (error: any) {
        logger.info("✅ File Owner correctly denied access to files they don't own");
      }
    }
    
    return true;
  } catch (error: any) {
    logger.error(`❌ File Owner permission test failed: ${error.message}`);
    return false;
  }
}

// async function testDepartmentMatchPermissions() {
//   logger.info("\nTesting Department Match Permissions");
  
//   try {
//     // Set the user context to an employee
//     prisma.$permit.setUser("employee@example.com");
    
//     // First, get department for this user (for the test, we know it's marketing)
//     const userDepartment = "marketing";
    
//     // Test read access to internal files in their department
//     logger.info(`Testing Department Match read access to internal files in ${userDepartment}...`);
//     const departmentFiles = await prisma.file.findMany({
//       where: {
//         departmentId: userDepartment,
//         visibility: "internal"
//       }
//     });
//     logger.info(`✅ User can read internal files in their department. Found ${departmentFiles.length} files.`);
    
//     // Test update access to an internal file in their department
//     if (departmentFiles.length > 0) {
//       const fileId = departmentFiles[0].id;
//       logger.info(`Testing Department Match update access to internal file (ID: ${fileId})...`);
      
//       const updatedFile = await prisma.file.update({
//         where: { id: fileId },
//         data: { content: "Updated by department member", departmentId: "marketing", visibility: "internal" }
//       });
//       logger.info(`✅ User can update internal files in their department: ${updatedFile.title}`);
//     }
    
//     // Try to access internal files from a different department
//     logger.info("Testing access to internal files from different department (should fail)...");
//     try {
//       const otherDeptFile = await prisma.file.findFirst({
//         where: {
//           departmentId: { not: userDepartment },
//           visibility: "internal"
//         }
//       });
      
//       if (otherDeptFile) {
//         await prisma.file.update({
//           where: { id: otherDeptFile.id },
//           data: { content: "This should fail" }
//         });
//         logger.error("❌ User unexpectedly allowed to update internal file from different department");
//       }
//     } catch (error: any) {
//       logger.info("✅ User correctly denied access to internal files from different department");
//     }
    
//     return true;
//   } catch (error: any) {
//     logger.error(`❌ Department Match permission test failed: ${error.message}`);
//     return false;
//   }
// }

// async function testSeniorUserPermissions() {
//   logger.info("\nTesting Senior User Permissions");
  
//   try {
//     // Set the user context to senior manager
//     prisma.$permit.setUser("senior_manager@example.com");
    
//     // Test access to confidential files
//     logger.info("Testing Senior User access to confidential files...");
//     const confidentialFiles = await prisma.file.findMany({
//       where: {
//         visibility: "confidential"
//       }
//     });
//     logger.info(`✅ Senior User can access confidential files. Found ${confidentialFiles.length} files.`);
    
//     // Test update on confidential file
//     if (confidentialFiles.length > 0) {
//       const fileId = confidentialFiles[0].id;
//       logger.info(`Testing Senior User update access to confidential file (ID: ${fileId})...`);
      
//       const updatedFile = await prisma.file.update({
//         where: { id: fileId },
//         data: { content: "Updated by senior manager", visibility: "confidential"  }
//       });
//       logger.info(`✅ Senior User can update confidential files: ${updatedFile.title}`);
//     }
    
//     // Test create confidential file
//     logger.info("Testing Senior User creating a confidential file...");
//     const newFile = await prisma.file.create({
//       data: {
//         title: "New Confidential File",
//         content: "Created by senior manager",
//         visibility: "confidential",
//         departmentId: "finance",
//         ownerId: "senior_manager@example.com"
//       }
//     });
//     logger.info(`✅ Senior User can create confidential files. New file ID: ${newFile.id}`);
    
//     return true;
//   } catch (error: any) {
//     logger.error(`❌ Senior User permission test failed: ${error.message}`);
//     return false;
//   }
// }

async function runABACTests() {
  logger.info("🚀 Starting File ABAC Tests");
  
  try {
    await testFileOwnerPermissions();
    // await testDepartmentMatchPermissions();
    // await testSeniorUserPermissions();
    
    logger.info("\n✅ ABAC Tests Completed");
  } catch (error: any) {
    logger.error(`❌ ABAC Tests Failed: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
runABACTests().catch(console.error);