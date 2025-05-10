import { PrismaClient } from "@prisma/client";
import createPermitClientExtension, { AccessControlModel } from "../../src";
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
  accessControlModel: AccessControlModel.ABAC,
};

const prisma = new PrismaClient().$extends(
  createPermitClientExtension(clientExtensionConfig)
);

async function testCardiologistPermissions() {
  logger.info("Testing Cardiologist User Permissions (department=cardiology)");
  
  try {
    prisma.$permit.setUser({
      key: "doctor_cardio@example.com",
      attributes: { 
        department: "cardiology" 
      }
    });
    
    // Should be able to read cardiology records
    logger.info("Testing READ for cardiology records...");
    const records = await prisma.medicalRecord.findMany({
      where: { department: "cardiology" }
    });
    logger.info(`✅ READ successful, found ${records.length} cardiology records`);
    
    // Should NOT be able to read oncology records
    logger.info("Testing READ for oncology records (should fail)...");
    try {
      const oncologyRecords = await prisma.medicalRecord.findMany({
        where: { department: "oncology" }
      });
      
      if (oncologyRecords.length > 0) {
        logger.error("❌ READ unexpectedly succeeded for oncology records");
      } else {
        logger.info("✅ READ returned empty results for oncology records");
      }
    } catch (error: any) {
      logger.info("✅ READ correctly failed for oncology records");
    }
    
    // Try to update a cardiology record (should succeed)
    logger.info("Testing UPDATE for cardiology record...");
    if (records.length > 0) {
      const updated = await prisma.medicalRecord.update({
        where: { id: records[0].id },
        data: { content: "Updated by cardiologist", department: "cardiology" }
      });
      logger.info(`✅ UPDATE successful for cardiology record: ${updated.id}`);
    }
    
    return true;
  } catch (error: any) {
    logger.error(`❌ Cardiologist permission test failed: ${error.message}`);
    return false;
  }
}

async function testOncologistPermissions() {
  logger.info("Testing Oncologist User Permissions (department=oncology)");
  
  try {
    // Set user with department attribute
    prisma.$permit.setUser({
      key: "doctor_onco@example.com",
      attributes: { 
        department: "oncology" 
      }
    });
    
    // Should be able to read oncology records
    logger.info("Testing READ for oncology records...");
    const records = await prisma.medicalRecord.findMany({
      where: { department: "oncology" }
    });
    logger.info(`✅ READ successful, found ${records.length} oncology records`);
    
    // Should NOT be able to read cardiology records
    logger.info("Testing READ for cardiology records (should fail)...");
    try {
      const cardiologyRecords = await prisma.medicalRecord.findMany({
        where: { department: "cardiology" }
      });
      
      if (cardiologyRecords.length > 0) {
        logger.error("❌ READ unexpectedly succeeded for cardiology records");
      } else {
        logger.info("✅ READ returned empty results for cardiology records");
      }
    } catch (error: any) {
      logger.info("✅ READ correctly failed for cardiology records");
    }
    
    return true;
  } catch (error: any) {
    logger.error(`❌ Oncologist permission test failed: ${error.message}`);
    return false;
  }
}

async function runABACTests() {
  logger.info("🚀 Starting Medical Records ABAC Tests");
  
  try {
    await testCardiologistPermissions();
    await testOncologistPermissions();
    logger.info("✅ ABAC Tests Completed Successfully");
  } catch (error: any) {
    logger.error(`❌ ABAC Tests Failed: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

runABACTests().catch(console.error);