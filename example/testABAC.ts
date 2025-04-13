// import { PrismaClient } from "@prisma/client";
// import createPermitClientExtension, { PermitExtensionConfig } from "../src";

// async function testABAC() {
//   const prismaForQuery = new PrismaClient();
//   let prisma: any;

//   try {
//     const config: PermitExtensionConfig = {
//       permitConfig: {
//         token: "",
//         pdp: "http://localhost:7767",
//       },
//       enableAutomaticChecks: true,
//       resourceTypeMapping: { Post: "post" },
//       debug: true,
//       contextEnricher: async (modelName, operation, args) => {
//         const context: Record<string, any> = {};
//         if (modelName === "Post" && operation === "update") {
//           const post = await prismaForQuery.post.findUnique({
//             where: { id: args.where.id },
//           });
//           if (!post) {
//             throw new Error(`Post with ID ${args.where.id} not found`);
//           }
//           context.authorDepartment = post.authorDepartment;
//         }
//         return context;
//       },
//     };

//     prisma = new PrismaClient().$extends(createPermitClientExtension(config));

//     // Test with user-123 (department: engineering)
//     console.log("=== Testing User-123 (department: engineering) ===");
//     prisma.$permit.setUser("user-123");

//     // Update post in same department (should succeed)
//     console.log("User-123: Updating post in engineering...");
//     const updatedPostSameDept = await prisma.post.update({
//       where: { id: "post-1" }, // post-1 has authorDepartment: "engineering"
//       data: { title: "Updated Post by User-123" },
//     });
//     console.log(
//       "User-123 updated post in same department:",
//       updatedPostSameDept
//     );

//     // Update post in different department (should fail)
//     console.log("User-123: Updating post in marketing...");
//     try {
//       await prisma.post.update({
//         where: { id: "post-2" }, // post-2 has authorDepartment: "marketing"
//         data: { title: "User-123 Tried to Update" },
//       });
//       console.log(
//         "User-123 updated post in different department: Success (unexpected)"
//       );
//     } catch (error) {
//       console.log(
//         "User-123 update post in different department failed (expected):"
//         // error.message
//       );
//     }

//     // Test with user-456 (department: marketing)
//     console.log("\n=== Testing User-456 (department: marketing) ===");
//     prisma.$permit.setUser("user-456");

//     // Update post in same department (should succeed)
//     console.log("User-456: Updating post in marketing...");
//     const updatedPostSameDeptEditor = await prisma.post.update({
//       where: { id: "post-2" }, // post-2 has authorDepartment: "marketing"
//       data: { title: "Updated Post by User-456" },
//     });
//     console.log(
//       "User-456 updated post in same department:",
//       updatedPostSameDeptEditor
//     );

//     // Update post in different department (should fail)
//     console.log("User-456: Updating post in engineering...");
//     try {
//       await prisma.post.update({
//         where: { id: "post-1" }, // post-1 has authorDepartment: "engineering"
//         data: { title: "User-456 Tried to Update" },
//       });
//       console.log(
//         "User-456 updated post in different department: Success (unexpected)"
//       );
//     } catch (error) {
//       console.log(
//         "User-456 update post in different department failed (expected):"
//         // error.message
//       );
//     }
//   } catch (error) {
//     console.error("Unexpected error:", error);
//   } finally {
//     await prismaForQuery.$disconnect();
//     if (prisma) {
//       await prisma.$disconnect();
//     }
//   }
// }

// testABAC();
