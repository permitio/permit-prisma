// import { PrismaClient } from "@prisma/client";
// import createPermitClientExtension, { AccessControlModel } from "../../src";
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
//   accessControlModel: AccessControlModel.ReBAC,
// };

// const prisma = new PrismaClient().$extends(
//   createPermitClientExtension(clientExtensionConfig)
// );

// async function checkPermissions() {
//   try {
//     logger.info("🔍 Checking permissions for owner_user");

//     // Set the user context to owner_user
//     prisma.$permit.setUser("owner_user");

//     // Check folder permissions
//     logger.info("\n--- Folder Permissions ---");

//     // Check which folder IDs the user can read
//     const readableFolderIds = await prisma.$permit.getAllowedResourceIds(
//       "owner_user",
//       "folder",
//       "read"
//     );
//     logger.info(`Folders user can READ: ${readableFolderIds.join(", ")}`);

//     // Check which folder IDs the user can update
//     const updatableFolderIds = await prisma.$permit.getAllowedResourceIds(
//       "owner_user",
//       "folder",
//       "update"
//     );
//     logger.info(`Folders user can UPDATE: ${updatableFolderIds.join(", ")}`);

//     // Check which folder IDs the user can delete
//     const deletableFolderIds = await prisma.$permit.getAllowedResourceIds(
//       "owner_user",
//       "folder",
//       "delete"
//     );
//     logger.info(`Folders user can DELETE: ${deletableFolderIds.join(", ")}`);

//     // Check if user can create folders (this is a resource-type level permission)
//     const canCreateFolder = await prisma.$permit.check(
//       "owner_user",
//       "create",
//       { type: "folder" }
//     );
//     logger.info(`Can create new folders: ${canCreateFolder}`);

//     // Check file permissions
//     logger.info("\n--- File Permissions ---");

//     // Check which file IDs the user can read
//     const readableFileIds = await prisma.$permit.getAllowedResourceIds(
//       "owner_user",
//       "file",
//       "read"
//     );
//     logger.info(`Files user can READ: ${readableFileIds.join(", ")}`);

//     // Check which file IDs the user can update
//     const updatableFileIds = await prisma.$permit.getAllowedResourceIds(
//       "owner_user",
//       "file",
//       "update"
//     );
//     logger.info(`Files user can UPDATE: ${updatableFileIds.join(", ")}`);

//     // Check which file IDs the user can delete
//     const deletableFileIds = await prisma.$permit.getAllowedResourceIds(
//       "owner_user",
//       "file",
//       "delete"
//     );
//     logger.info(`Files user can DELETE: ${deletableFileIds.join(", ")}`);

//     // Check if user can create files (this is a resource-type level permission)
//     const canCreateFile = await prisma.$permit.check(
//       "owner_user",
//       "create",
//       { type: "file" }
//     );
//     logger.info(`Can create new files: ${canCreateFile}`);

//     // Now do the same for viewer_user for comparison
//     logger.info("\n🔍 Checking permissions for viewer_user");

//     // Set the user context to viewer_user
//     prisma.$permit.setUser("viewer_user");

//     // Check folder permissions
//     logger.info("\n--- Folder Permissions ---");

//     // Check which folder IDs the user can read
//     const viewerReadableFolderIds = await prisma.$permit.getAllowedResourceIds(
//       "viewer_user",
//       "folder",
//       "read"
//     );
//     logger.info(`Folders user can READ: ${viewerReadableFolderIds.join(", ")}`);

//     // Check which folder IDs the user can update
//     const viewerUpdatableFolderIds = await prisma.$permit.getAllowedResourceIds(
//       "viewer_user",
//       "folder",
//       "update"
//     );
//     logger.info(`Folders user can UPDATE: ${viewerUpdatableFolderIds.join(", ")}`);

//     // Check if viewer can create folders
//     const viewerCanCreateFolder = await prisma.$permit.check(
//       "viewer_user",
//       "create",
//       { type: "folder" }
//     );
//     logger.info(`Can create new folders: ${viewerCanCreateFolder}`);

//     // Check file permissions
//     logger.info("\n--- File Permissions ---");

//     // Check which file IDs the user can read
//     const viewerReadableFileIds = await prisma.$permit.getAllowedResourceIds(
//       "viewer_user",
//       "file",
//       "read"
//     );
//     logger.info(`Files user can READ: ${viewerReadableFileIds.join(", ")}`);

//   } catch (error: any) {
//     logger.error(`Error checking permissions: ${error.message}`);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// checkPermissions().catch((error) => {
//   logger.error(`Unhandled error: ${error.message}`);
//   process.exit(1);
// });
