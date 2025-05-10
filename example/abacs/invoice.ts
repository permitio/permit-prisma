import { PrismaClient } from "@prisma/client";
import createPermitClientExtension from "../../src";
import dotenv from "dotenv";
import logger from "../../src/utils/logger";
import { access } from "fs";
import { AccessControlModel } from "../../src/models/PermissionModels";

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

async function testInvoiceABAC() {
  logger.info("Starting Invoice ABAC Test for user1@permit.io");

  prisma.$permit.setUser({
    key: "user2@permit.io",
    attributes: {
      department: "engineering",
    },
  });

  try {
    // const invoices = await prisma.invoice.findMany();
    // logger.info(`Invoice Read Success: ${JSON.stringify(invoices, null, 2)}`);
    // const createdInvoice = await prisma.invoice.create({
    //   data: {
    //     amount: 190,
    //     department: "engineering",
    //     issuedTo: "user3@permit.io",
    //   },
    // });
    // logger.info(`Invoice Created: ${JSON.stringify(createdInvoice, null, 2)}`);
    // const updated = await prisma.invoice.update({
    //   where: { id: 5 },
    //   data: {
    //     amount: 19500,
    //     department: "engineering",
    //   },
    // });
    // logger.info(`Invoice Updated: ${JSON.stringify(updated, null, 2)}`);
  } catch (error) {
    logger.error("Invoice Read Failed:", error);
  }
}

testInvoiceABAC()
  .catch((e) => {
    console.error("ABAC Invoice Testing Error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
