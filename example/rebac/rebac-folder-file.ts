import { PrismaClient } from "@prisma/client";
import createPermitClientExtension, { AccessControlModel, PermitError } from "../../src";
import dotenv from "dotenv";
import logger from "../../src/utils/logger";

dotenv.config();

const permitConfig = {
  token: process.env.PERMIT_API_KEY!,
  pdp: "http://localhost:7766",
  throwOnError: true,
  debug: true,
};

const clientExtensionConfig = {
  permitConfig,
  enableAutomaticChecks: true,
  accessControlModel: AccessControlModel.ReBAC,
};

const prisma = new PrismaClient().$extends(
  createPermitClientExtension(clientExtensionConfig)
);

async function testViewerCRUD() {
  logger.info("🚀 Testing ReBAC CRUD Operations for Viewer User");

  try {
    // Set the viewer user context
    prisma.$permit.setUser("viewer_user");
    logger.info("User context set to viewer_user");

    // Test 1: Attempt to create a folder (should fail)
    logger.info("\n--- Test 1: Create Folder (should fail) ---");
    try {
      logger.info("Attempting to create a folder as viewer...");
      const folder = await prisma.folder.create({
        data: {
          name: "Viewer's New Folder",
          ownerId: "viewer_user"
        }
      });
      logger.error("❌ FAILED: Unexpectedly created a folder with ID: " + folder.id);
    } catch (error: any) {
      if (error instanceof PermitError) {
        logger.info("✅ PASSED: Correctly denied folder creation: " + error.message);
      } else {
        logger.error("⚠️ ERROR: Non-permission error occurred: " + error.message);
      }
    }

    // Test 2: Read folder1 (should succeed)
    logger.info("\n--- Test 2: Read Folder (should succeed) ---");
    try {
      logger.info("Attempting to read folder1...");
      const folder = await prisma.folder.findUnique({
        where: { id: "folder1" }
      });
      
      if (folder) {
        logger.info("✅ PASSED: Successfully read folder: " + folder.name);
      } else {
        logger.error("❌ FAILED: Could not find folder1");
      }
    } catch (error: any) {
      logger.error("❌ FAILED: Error reading folder: " + error.message);
    }

    // Test 3: Update folder1 (should fail)
    logger.info("\n--- Test 3: Update Folder (should fail) ---");
    try {
      logger.info("Attempting to update folder1...");
      await prisma.folder.update({
        where: { id: "folder1" },
        data: { name: "Renamed by Viewer" }
      });
      logger.error("❌ FAILED: Unexpectedly updated the folder");
    } catch (error: any) {
      if (error instanceof PermitError) {
        logger.info("✅ PASSED: Correctly denied folder update: " + error.message);
      } else {
        logger.error("⚠️ ERROR: Non-permission error occurred: " + error.message);
      }
    }

    // Test 4: Read file1 (should succeed)
    logger.info("\n--- Test 4: Read File (should succeed) ---");
    try {
      logger.info("Attempting to read file1...");
      const file = await prisma.file.findUnique({
        where: { id: "file1" }
      });
      
      if (file) {
        logger.info("✅ PASSED: Successfully read file: " + file.name);
      } else {
        logger.error("❌ FAILED: Could not find file1");
      }
    } catch (error: any) {
      logger.error("❌ FAILED: Error reading file: " + error.message);
    }

    // Test 5: Update file1 (should fail)
    logger.info("\n--- Test 5: Update File (should fail) ---");
    try {
      logger.info("Attempting to update file1...");
      await prisma.file.update({
        where: { id: "file1" },
        data: { content: "Modified by viewer" }
      });
      logger.error("❌ FAILED: Unexpectedly updated the file");
    } catch (error: any) {
      if (error instanceof PermitError) {
        logger.info("✅ PASSED: Correctly denied file update: " + error.message);
      } else {
        logger.error("⚠️ ERROR: Non-permission error occurred: " + error.message);
      }
    }

    // Test 6: Delete file1 (should fail)
    logger.info("\n--- Test 6: Delete File (should fail) ---");
    try {
      logger.info("Attempting to delete file1...");
      await prisma.file.delete({
        where: { id: "file1" }
      });
      logger.error("❌ FAILED: Unexpectedly deleted the file");
    } catch (error: any) {
      if (error instanceof PermitError) {
        logger.info("✅ PASSED: Correctly denied file deletion: " + error.message);
      } else {
        logger.error("⚠️ ERROR: Non-permission error occurred: " + error.message);
      }
    }

    // Test 7: Create file in folder1 (should fail)
    logger.info("\n--- Test 7: Create File in folder1 (should fail) ---");
    try {
      logger.info("Attempting to create a file in folder1...");
      const file = await prisma.file.create({
        data: {
          name: "Viewer's New File",
          content: "This file should not be created",
          folderId: "folder1"
        }
      });
      logger.error("❌ FAILED: Unexpectedly created a file with ID: " + file.id);
    } catch (error: any) {
      if (error instanceof PermitError) {
        logger.info("✅ PASSED: Correctly denied file creation: " + error.message);
      } else {
        logger.error("⚠️ ERROR: Non-permission error occurred: " + error.message);
      }
    }

    logger.info("\n=== ReBAC CRUD Testing for Viewer User Completed ===");
    return true;
  } catch (error: any) {
    logger.error(`Test script failed: ${error.message}`);
    return false;
  }
}

async function testOwnerCRUD() {
  logger.info("🚀 Testing ReBAC CRUD Operations for Owner User");

  try {
    // Set the owner user context
    prisma.$permit.setUser("owner_user");
    logger.info("User context set to owner_user");

    // Test 1: Create a new folder (should succeed)
    logger.info("\n--- Test 1: Create Folder (should succeed) ---");
    try {
      logger.info("Attempting to create a folder as owner...");
      const folder = await prisma.folder.create({
        data: {
          name: "Owner's New Folder",
          ownerId: "owner_user"
        }
      });
      logger.info(`✅ PASSED: Successfully created folder with ID: ${folder.id}`);
    } catch (error: any) {
      logger.error(`❌ FAILED: Error creating folder: ${error.message}`);
    }

    // Test 2: Read folder1 (should succeed)
    logger.info("\n--- Test 2: Read Folder (should succeed) ---");
    try {
      logger.info("Attempting to read folder1...");
      const folder = await prisma.folder.findUnique({
        where: { id: "folder1" }
      });
      
      if (folder) {
        logger.info(`✅ PASSED: Successfully read folder: ${folder.name}`);
      } else {
        logger.error("❌ FAILED: Could not find folder1");
      }
    } catch (error: any) {
      logger.error(`❌ FAILED: Error reading folder: ${error.message}`);
    }

    // Test 3: Update folder1 (should succeed)
    logger.info("\n--- Test 3: Update Folder (should succeed) ---");
    try {
      logger.info("Attempting to update folder1...");
      const updatedFolder = await prisma.folder.update({
        where: { id: "folder1" },
        data: { name: "Renamed by Owner" }
      });
      logger.info(`✅ PASSED: Successfully updated folder name to: ${updatedFolder.name}`);
    } catch (error: any) {
      logger.error(`❌ FAILED: Error updating folder: ${error.message}`);
    }

    // Test 4: Read file1 (should succeed)
    logger.info("\n--- Test 4: Read File (should succeed) ---");
    try {
      logger.info("Attempting to read file1...");
      const file = await prisma.file.findUnique({
        where: { id: "file1" }
      });
      
      if (file) {
        logger.info(`✅ PASSED: Successfully read file: ${file.name}`);
      } else {
        logger.error("❌ FAILED: Could not find file1");
      }
    } catch (error: any) {
      logger.error(`❌ FAILED: Error reading file: ${error.message}`);
    }

    // Test 5: Update file1 (should succeed)
    logger.info("\n--- Test 5: Update File (should succeed) ---");
    try {
      logger.info("Attempting to update file1...");
      const updatedFile = await prisma.file.update({
        where: { id: "file1" },
        data: { content: "Modified by owner" }
      });
      logger.info(`✅ PASSED: Successfully updated file content to: "${updatedFile.content}"`);
    } catch (error: any) {
      logger.error(`❌ FAILED: Error updating file: ${error.message}`);
    }

    // Test 6: Create file in folder1 (should succeed)
    logger.info("\n--- Test 6: Create File in folder1 (should succeed) ---");
    try {
      logger.info("Attempting to create a file in folder1...");
      const file = await prisma.file.create({
        data: {
          name: "Owner's New File",
          content: "This file was created by the owner",
          folderId: "folder1"
        }
      });
      logger.info(`✅ PASSED: Successfully created file with ID: ${file.id}`);
    } catch (error: any) {
      logger.error(`❌ FAILED: Error creating file: ${error.message}`);
    }

    // Test 7: Delete a file (should succeed)
    logger.info("\n--- Test 7: Delete File (should succeed) ---");
    try {
      // First create a temporary file to delete
      const tempFile = await prisma.file.create({
        data: {
          name: "Temporary File",
          content: "This file will be deleted",
          folderId: "folder1"
        }
      });
      
      logger.info(`Created temporary file with ID: ${tempFile.id}`);
      
      // Now delete it
      logger.info("Attempting to delete the temporary file...");
      await prisma.file.delete({
        where: { id: tempFile.id }
      });
      logger.info("✅ PASSED: Successfully deleted file");
    } catch (error: any) {
      logger.error(`❌ FAILED: Error deleting file: ${error.message}`);
    }

    logger.info("\n=== ReBAC CRUD Testing for Owner User Completed ===");
    return true;
  } catch (error: any) {
    logger.error(`Test script failed: ${error.message}`);
    return false;
  }
}

async function runReBACtests() {
  logger.info("🚀🚀 Starting ReBAC Permission Tests");
  logger.info("==================================");
  
  try {
    // Run owner tests first
    logger.info("\n\n📋 PART 1: OWNER USER TESTS");
    logger.info("----------------------------------");
    const ownerResult = await testOwnerCRUD();
    
    // Run viewer tests next
    logger.info("\n\n📋 PART 2: VIEWER USER TESTS");
    logger.info("----------------------------------");
    const viewerResult = await testViewerCRUD();
    
    // Final summary
    logger.info("\n\n📊 TEST RESULTS SUMMARY");
    logger.info("==================================");
    logger.info(`Owner tests: ${ownerResult ? '✅ PASSED' : '❌ FAILED'}`);
    logger.info(`Viewer tests: ${viewerResult ? '✅ PASSED' : '❌ FAILED'}`);
    logger.info(`Overall result: ${ownerResult && viewerResult ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  } catch (error: any) {
    logger.error(`❌ Unhandled error in test suite: ${error.message}`);
  } finally {
    // Always disconnect the Prisma client when done
    await prisma.$disconnect();
    logger.info("\n==================================");
    logger.info("🏁 ReBAC Permission Tests Complete");
  }
}

// Run the combined test suite
runReBACtests().catch((error: any) => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});