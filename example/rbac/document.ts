import { PrismaClient } from "@prisma/client";
import createPermitClientExtension from "../../src";
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
};

const prisma = new PrismaClient().$extends(
  createPermitClientExtension(clientExtensionConfig)
);

async function testDocumentRBAC() {
  logger.info("Starting Document RBAC Test...\n");

  const adminUser = "user1@permit.io";
  const editorUser = "user2@permit.io";
  const viewerUser = "user3@permit.io";

  // =======> START TESTING FOR ADMIN USER <===========
  // logger.info(`Testing Admin User: ${JSON.stringify(adminUser)}`);

  // try {
  //   prisma.$permit.setUser(adminUser);

  //   const newDocument = await prisma.document.create({
  //     data: {
  //       title: "Admin Post Sunday",
  //       content: "Created by admin on Sunday test",
  //     },
  //   });

  //   logger.info(`Admin Document Create: Success -> ${newDocument}`);

  //   const documents = await prisma.document.findMany();
  //   logger.info(`Admin Read: Success -> ${JSON.stringify(documents)}`);

  //   const updatedDocument = await prisma.document.update({
  //     where: { id: documents[1].id },
  //     data: { content: "Updated by admin Sunday" },
  //   });

  //   logger.info(`Admin Update Success -> ${JSON.stringify(updatedDocument)}`);

  //   await prisma.document.delete({ where: { id: documents[2].id } });

  //   logger.info(`Admin Delete Success`);
  // } catch (error) {
  //   if (error instanceof Error) {
  //     logger.error(`Admin Test Failed -> ${JSON.stringify(error)}`);
  //   }
  // }
  // =======> END TESTING FOR ADMIN USER <=========

  // ======> START TESTING FOR EDITOR USER <==========
  // logger.info(`Testing Editor User, ${JSON.stringify(editorUser)}`);

  // let editorDocuments: any[] = [];
  // try {
  //   prisma.$permit.setUser(editorUser);

  //   editorDocuments = await prisma.document.findMany();
  //   logger.info(`Editor Read: Success, ${JSON.stringify(editorDocuments)}`);

  //   const updatedEditorDocument = await prisma.document.update({
  //     where: { id: editorDocuments[0].id },
  //     data: { content: "Updated by editor on Sunday" },
  //   });

  //   logger.info(
  //     `Editor Update: Success -> ${JSON.stringify(updatedEditorDocument)}`
  //   );

  //   await prisma.document.create({
  //     data: { title: "Editor Document", content: "Created by editor" },
  //   });
  //   logger.info("Editor create: Success (Unexpected)");
  // } catch (error) {
  //   if (error instanceof Error) {
  //     logger.error(
  //       `Editor Create Failed as expected -> ${JSON.stringify(error)}`
  //     );
  //   }

  //   try {
  //     await prisma.document.delete({
  //       where: { id: editorDocuments[0].id },
  //     });
  //     logger.info("Editor Delete: Success (Unexpected)");
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       logger.error(
  //         `Editor Delete: Failed as expected ${JSON.stringify(error)}`
  //       );
  //     }
  //   }
  // }
  // =========== ENDING TESTING FOR EDITOR USER <==========

  // ========= START TESTING FOR VIEWER USER <=============
  // logger.info(`Testing Viewer User: ${JSON.stringify(viewerUser)}`);

  // try {
  //   prisma.$permit.setUser(viewerUser);

  //   const viewDocuments = await prisma.document.findMany();
  //   logger.info(
  //     `Viewer Read: Success", viewDocuments ${JSON.stringify(viewDocuments)}`
  //   );

  //   await prisma.document.create({
  //     data: {
  //       title: "API Design DOc",
  //       content: "API Design Documentation implementation",
  //     },
  //   });
  //   logger.info("Viewer Create: Success (Unexpected!)");
  // } catch (error) {
  //   if (error instanceof Error) {
  //     logger.info("Viewer Create: Failed as expected:", error);
  //   }

  //   try {
  //     await prisma.document.update({
  //       where: { id: 1 },
  //       data: { content: "Starup guide" },
  //     });
  //     logger.info("Viewer Update: Success (Unexpected!)");
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       logger.info("Viewer Update: Failed as expected:", error);
  //     }
  //   }

  //   try {
  //     await prisma.document.delete({ where: { id: 1 } });
  //     logger.info("Viewer Delete: Success (Unexpected!)");
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       logger.info("Viewer Delete: Failed as expected:", error);
  //     }
  //   }
  // }
  // =========> END TESTING FOR VIEWER USER <============
}

testDocumentRBAC()
  .catch((e) => {
    console.error("RBAC Document Testing Error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
