// example/crud-permissions.ts

import { PrismaClient } from "@prisma/client";
import permitExtension from "../src";
import { AccessControlModel } from "../src/domain/entities/PermissionModels";

async function main() {
  // Create a standard Prisma Client
  const prisma = new PrismaClient();

  try {
    // Initialize our extension with the required configuration
    const prismaWithPermit = prisma.$extends(
      permitExtension({
        permitConfig: {
          //   token: process.env.PERMIT_API_KEY || "your-api-key-here",
          //   pdp: process.env.PERMIT_PDP_URL || "https://cloudpdp.api.permit.io",
          token: "",
          pdp: "http://localhost:7767",
          // Enable debug logging to see what's happening
          debug: true,
        },
        // Enable automatic permission checks for all CRUD operations
        enableAutomaticChecks: true,
        // Use RBAC as the access control model
        accessControlModel: AccessControlModel.RBAC,
        // Map Prisma models to Permit resource types
        resourceTypeMapping: {
          User: "user",
          Post: "post",
          Comment: "comment",
        },
        // You can exclude certain models from permission checks
        excludedModels: ["Log", "Audit"],
        // You can exclude certain operations from permission checks
        excludedOperations: ["count"],
        transactionAware: true,
      })
    );

    // Set the current user for permission checks
    const user = {
      key: "user-123",
      attributes: { role: "admin", department: "IT" },
    };
    const permitContext = prismaWithPermit.$permit.setUser(user);

    console.log("Running CRUD operations with permission checks...");

    // READ operation - findMany
    console.log("\n--- Testing READ permission ---");
    try {
      const users = await prismaWithPermit.user.findMany({
        ...(permitContext as any), // Include the permit context in all queries
      });
      console.log(`✅ READ permission granted. Found ${users.length} users.`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ READ permission denied: ${errorMessage}`);
    }

    // CREATE operation
    console.log("\n--- Testing CREATE permission ---");
    try {
      const newPost = await prismaWithPermit.post.create({
        data: {
          title: "Test Post",
          content: "This is a test post for permission checking.",
          authorId: "user-123",
        },
        ...permitContext,
      });

      console.log(
        `✅ CREATE permission granted. Created post with ID: ${JSON.stringify(
          newPost,
          null,
          2
        )},${newPost.id}`
      );

      const verificationPost = await prisma.post.findUnique({
        where: { id: newPost.id },
      });

      console.log(
        "Post verification from database:",
        verificationPost ? "Found" : "Not found"
      );

      // UPDATE operation - Only if create succeeded
      console.log("\n--- Testing UPDATE permission ---");
      try {
        const updatedPost = await prismaWithPermit.post.update({
          where: { id: newPost.id },
          data: { title: "Updated Test Post" },
          ...permitContext,
        });
        console.log(
          `✅ UPDATE permission granted. Updated post title to: ${updatedPost.title}`
        );

        // DELETE operation - Only if update succeeded
        console.log("\n--- Testing DELETE permission ---");
        try {
          await prismaWithPermit.post.delete({
            where: { id: newPost.id },
            ...permitContext,
          });
          console.log(
            `✅ DELETE permission granted. Deleted post with ID: ${newPost.id}`
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(`❌ DELETE permission denied: ${errorMessage}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ UPDATE permission denied: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ CREATE permission denied: ${errorMessage}`);
    }

    // Test direct permission check method
    console.log("\n--- Testing direct permission check ---");
    const canManageUsers = await prismaWithPermit.$permit.check(
      user,
      "manage",
      "user"
    );
    console.log(
      `Direct check result: User can manage users = ${canManageUsers}`
    );

    // Test enforceCheck method (will throw if not allowed)
    console.log("\n--- Testing enforceCheck method ---");
    try {
      await prismaWithPermit.$permit.enforceCheck(user, "admin", {
        type: "system",
        key: "settings",
      });
      console.log("✅ Admin permission on system settings granted");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ Admin permission denied: ${errorMessage}`);
    }

    // Clean up
    await prisma.$disconnect();
    console.log("\nTest completed.");
  } catch (error) {
    console.error("Unexpected error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
