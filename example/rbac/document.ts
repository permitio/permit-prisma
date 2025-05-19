// import { PrismaClient } from "@prisma/client";
// import createPermitClientExtension, { PermitError } from "../../src";
// import dotenv from "dotenv";
// import logger from "../../src/utils/logger";

// dotenv.config();

// const permitConfig = {
//   token: process.env.PERMIT_API_KEY!,
//   pdp: "http://localhost:7766",
//   throwOnError: true,
//   debug: true,
// };

// const clientExtensionConfig = {
//   permitConfig,
//   enableAutomaticChecks: true,
// };

// const prisma = new PrismaClient().$extends(
//   createPermitClientExtension(clientExtensionConfig)
// );

// async function testAdminPermissions() {
//   logger.info("Testing Admin User Permissions");
//   try {
//     prisma.$permit.setUser("admin@example.com");

//     // CREATE
//     logger.info("Testing CREATE for admin...");
//     const doc = await prisma.document.create({
//       data: {
//         title: "Admin's Document",
//         content: "Created by admin",
//         ownerId: "admin@example.com",
//       },
//     });
//     logger.info(`✅ CREATE successful, id: ${doc.id}`);

//     // READ
//     logger.info("Testing READ for admin...");
//     const docs = await prisma.document.findMany();
//     logger.info(`✅ READ successful, found ${docs.length} documents`);

//     // UPDATE
//     logger.info("Testing UPDATE for admin...");
//     const updated = await prisma.document.update({
//       where: { id: doc.id },
//       data: { title: "Admin Updated" },
//     });
//     logger.info(`✅ UPDATE successful, new title: ${updated.title}`);

//     // DELETE
//     logger.info("Testing DELETE for admin...");
//     await prisma.document.delete({ where: { id: doc.id } });
//     logger.info("✅ DELETE successful");

//     return true;
//   } catch (error: any) {
//     logger.error(`❌ Admin permission test failed: ${error.message}`);
//     return false;
//   }
// }

// async function testCustomerPermissions() {
//   logger.info("Testing Customer User Permissions");
//   try {
//     prisma.$permit.setUser("customer@example.com");

//     // CREATE (should fail)
//     logger.info("Testing CREATE for customer (should fail)...");
//     try {
//       await prisma.document.create({
//         data: {
//           title: "Customer's Document",
//           content: "Should not be allowed",
//           ownerId: "customer@example.com",
//         },
//       });
//       logger.error("❌ CREATE unexpectedly succeeded for customer");
//     } catch (error: any) {
//       if (error instanceof PermitError) {
//         logger.info("✅ CREATE correctly failed with permission error");
//       } else {
//         logger.error(
//           `❌ CREATE failed with unexpected error: ${error.message}`
//         );
//       }
//     }

//     // READ (should succeed)
//     logger.info("Testing READ for customer...");
//     const docs = await prisma.document.findMany();
//     logger.info(`✅ READ successful, found ${docs.length} documents`);

//     // UPDATE (should fail)
//     logger.info("Testing UPDATE for customer (should fail)...");
//     try {
//       await prisma.document.update({
//         where: { id: docs[0]?.id },
//         data: { title: "Customer Update" },
//       });
//       logger.error("❌ UPDATE unexpectedly succeeded for customer");
//     } catch (error: any) {
//       if (error instanceof PermitError) {
//         logger.info("✅ UPDATE correctly failed with permission error");
//       } else {
//         logger.error(
//           `❌ UPDATE failed with unexpected error: ${error.message}`
//         );
//       }
//     }

//     // DELETE (should fail)
//     logger.info("Testing DELETE for customer (should fail)...");
//     try {
//       await prisma.document.delete({ where: { id: docs[0]?.id } });
//       logger.error("❌ DELETE unexpectedly succeeded for customer");
//     } catch (error: any) {
//       if (error instanceof PermitError) {
//         logger.info("✅ DELETE correctly failed with permission error");
//       } else {
//         logger.error(
//           `❌ DELETE failed with unexpected error: ${error.message}`
//         );
//       }
//     }

//     return true;
//   } catch (error: any) {
//     logger.error(`❌ Customer permission test failed: ${error.message}`);
//     return false;
//   }
// }

// async function runRBACTests() {
//   logger.info("🚀 Starting Document RBAC Tests");
//   try {
//     await testAdminPermissions();
//     await testCustomerPermissions();
//     logger.info("✅ RBAC Tests Completed Successfully");
//   } catch (error: any) {
//     logger.error(`❌ RBAC Tests Failed: ${error.message}`);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// runRBACTests().catch(console.error);
