import { PrismaClient } from "@prisma/client";
import permitExtension from "../src/index";
import { PermitError } from "../src/utils/errors";

async function main() {
  // Create a standard Prisma Client
  const prisma = new PrismaClient();

  try {
    // Initialize our extension with the required configuration
    const prismaWithPermit = prisma.$extends(
      permitExtension({
        permitConfig: {
          //   token: process.env.PERMIT_API_KEY || 'your-api-key-here',
          token: "",
          pdp: "http://localhost:7767",
          //   pdp: process.env.PERMIT_PDP_URL || 'https://cloudpdp.api.permit.io',
          debug: true,
        },
        // Optional mapping from Prisma models to Permit resource types
        resourceTypeMapping: {
          User: "user",
          Post: "post",
          Comment: "comment",
        },
      })
    );

    // Example: Check if a user has permission to create a post
    const userId = "user123";
    const canCreatePost = await prismaWithPermit.$permit.check(
      userId,
      "create",
      "post"
    );

    console.log(`User ${userId} can create post: ${canCreatePost}`);

    // Example: Using enforceCheck to throw on denied permissions
    try {
      await prismaWithPermit.$permit.enforceCheck(userId, "delete", {
        type: "post",
        key: "post-456",
      });

      // This will only execute if permission is granted
      console.log("Permission granted to delete post-456");

      // You would perform the actual operation here
      // await prismaWithPermit.post.delete({ where: { id: 'post-456' } });
    } catch (error) {
      if (error instanceof PermitError) {
        console.error(`Permission denied: ${error.message}`);
      } else {
        console.error(`Unexpected error: ${error}`);
      }
    }

    // Clean up - close the Prisma Client connection
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error initializing the extension:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error in example:", error);
  process.exit(1);
});
