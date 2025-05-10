import { PrismaClient } from "@prisma/client";
import createPermitClientExtension, { AccessControlModel } from "../../src";
import dotenv from "dotenv";
import logger from "../../src/utils/logger";

dotenv.config();

const permitConfig = {
  token: process.env.PERMIT_API_KEY!,
  pdp: "http://localhost:7767",
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

async function testGDPRDocumentABAC() {
  logger.info("Starting Document ABAC Test...\n");

  // Test user1 (should have access)
  logger.info("Testing user1 (should have access)");
  try {
    prisma.$permit.setUser({
      key: "user1@permit.io",
      attributes: { location: "EU", clearance: "high" },
    });
    const documents = await prisma.gDPRDocument.findMany({
      where: { data: "GDPR_protected" },
    });
    logger.info(`user1 Read: Success -> ${JSON.stringify(documents)}`);

    const updatedDoc = await prisma.gDPRDocument.update({
      where: { id: documents[0].id },
      data: { content: "Updated by user1 again" },
    });
    logger.info(`user1 Update: Success -> ${JSON.stringify(updatedDoc)}`);
  } catch (error) {
    logger.error(`user1 Test Failed -> ${JSON.stringify(error)}`);
  }

  // Test user2 (should be denied)
  logger.info("Testing user2 (should be denied)");
  try {
    prisma.$permit.setUser({ key: "user2@permit.io" });
    const documents = await prisma.gDPRDocument.findMany({
      where: { data: "GDPR_protected" },
    });
    logger.info(
      `user2 Read: Success (Unexpected!) -> ${JSON.stringify(documents)}`
    );
  } catch (error) {
    logger.info(`user2 Read: Failed as expected -> ${JSON.stringify(error)}`);
  }

  try {
    await prisma.gDPRDocument.update({
      where: { id: 1 },
      data: { content: "Updated by user2" },
    });
    logger.info("user2 Update: Success (Unexpected!)");
  } catch (error) {
    logger.info(`user2 Update: Failed as expected -> ${JSON.stringify(error)}`);
  }
}

testGDPRDocumentABAC()
  .catch((e) => {
    console.error("ABAC Document Testing Error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
