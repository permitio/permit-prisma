import { PrismaClient } from "@prisma/client";
import createPermitClientExtension, { AccessControlModel } from "../../src";
import dotenv from "dotenv";

dotenv.config();

const permitConfig = {
  token: process.env.PERMIT_API_KEY!,
  pdp: process.env.PERMIT_PDP_URL || "http://localhost:7766",
  debug: true,
};

const prisma = new PrismaClient().$extends(
  createPermitClientExtension({
    permitConfig,
    accessControlModel: AccessControlModel.ReBAC,
    enableDataFiltering: false,
  })
);

async function testPostFetchFiltering() {
  console.log("🔍 Testing ReBAC Post-Fetch Data Filtering");
  console.log("===========================================");

  try {
    // First, get all files without any filtering
    const allFiles = await prisma.file.findMany();
    console.log(`\nTotal files in database: ${allFiles.length}`);

    // Test with Admin user
    const adminUser = "admin@example.com";
    console.log(`\n👤 Testing post-fetch filtering for ${adminUser}:`);

    // Set the current user
    prisma.$permit.setUser(adminUser);
    // Before calling filterQueryResults
    console.log(
      "🙈 User permissions:",
      await prisma.$permit.client.getUserPermissions(adminUser)
    );

    // Use filterQueryResults to filter the already fetched files
    const adminFiles = await prisma.$permit.filterQueryResults(
      "read",
      "file",
      allFiles
    );

    console.log(`Files ${adminUser} can access (after filtering):`);
    console.log(adminFiles.map((file) => ({ id: file.id, name: file.name })));
    console.log(`Total accessible files: ${adminFiles.length}`);

    // Test with Editor user
    const editorUser = "editor@example.com";
    console.log(`\n👤 Testing post-fetch filtering for ${editorUser}:`);

    // Set the current user
    prisma.$permit.setUser(editorUser);

    // Use filterQueryResults to filter the already fetched files
    const editorFiles = await prisma.$permit.filterQueryResults(
      "read",
      "file",
      allFiles
    );

    console.log(`Files ${editorUser} can access (after filtering):`);
    console.log(editorFiles.map((file) => ({ id: file.id, name: file.name })));
    console.log(`Total accessible files: ${editorFiles.length}`);

    // Test with Viewer user
    const viewerUser = "viewer@example.com";
    console.log(`\n👤 Testing post-fetch filtering for ${viewerUser}:`);

    // Set the current user
    prisma.$permit.setUser(viewerUser);

    // Use filterQueryResults to filter the already fetched files
    const viewerFiles = await prisma.$permit.filterQueryResults(
      "read",
      "file",
      allFiles
    );

    console.log(`Files ${viewerUser} can access (after filtering):`);
    console.log(viewerFiles.map((file) => ({ id: file.id, name: file.name })));
    console.log(`Total accessible files: ${viewerFiles.length}`);

    // Compare results
    console.log("\n📊 Results Comparison:");
    console.log(`Admin access: ${adminFiles.length} files`);
    console.log(`Editor access: ${editorFiles.length} files`);
    console.log(`Viewer access: ${viewerFiles.length} files`);

    // Testing with different action (write permission)
    console.log("\n🔍 Testing post-fetch filtering with 'update' action:");

    // Admin with update permission
    prisma.$permit.setUser(adminUser);
    const adminWriteFiles = await prisma.$permit.filterQueryResults(
      "update",
      "file",
      allFiles
    );
    console.log(`Files ${adminUser} can update: ${adminWriteFiles.length}`);

    // Editor with update permission
    prisma.$permit.setUser(editorUser);
    const editorWriteFiles = await prisma.$permit.filterQueryResults(
      "update",
      "file",
      allFiles
    );
    console.log(`Files ${editorUser} can update: ${editorWriteFiles.length}`);

    // Viewer with update permission (probably none)
    prisma.$permit.setUser(viewerUser);
    const viewerWriteFiles = await prisma.$permit.filterQueryResults(
      "update",
      "file",
      allFiles
    );
    console.log(`Files ${viewerUser} can update: ${viewerWriteFiles.length}`);
  } catch (error) {
    console.error("❌ Error during testing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPostFetchFiltering()
  .catch(console.error)
  .finally(() => console.log("✅ Test completed"));
