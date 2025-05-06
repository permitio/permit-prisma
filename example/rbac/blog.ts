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
    accessControlModel: AccessControlModel.RBAC,
};

const prisma = new PrismaClient().$extends(
    createPermitClientExtension(clientExtensionConfig)
);

// <======== START OF ADMIN TESTING =========>
// async function testAdminPermissions() {
//     logger.info("Testing Admin User Permissions");
    
//     try {
//       // Set admin user context
//       prisma.$permit.setUser("user1@permit.io");
      
//       // Test creating a new blog
//       logger.info("Testing CREATE permission for admin...");
//       const newBlog = await prisma.blog.create({
//         data: {
//           title: "New Admin Test Blog",
//           content: "This is a test blog created by admin",
//           published: true,
//           authorId: "user1@permit.io"
//         }
//       });
//       logger.info(`✅ CREATE successful, created blog with ID: ${newBlog.id}`);
      
//       // Test reading blogs
//       logger.info("Testing READ permission for admin...");
//       const blogs = await prisma.blog.findMany();
//       logger.info(`✅ READ successful, found ${blogs.length} blogs`);
      
//       // Test updating a blog
//       logger.info("Testing UPDATE permission for admin...");
//       const updatedBlog = await prisma.blog.update({
//         where: { id: newBlog.id },
//         data: { 
//           title: "Updated Admin Test Blog" 
//         }
//       });
//       logger.info(`✅ UPDATE successful, updated blog title to: ${updatedBlog.title}`);
      
//       // Test deleting a blog
//       logger.info("Testing DELETE permission for admin...");
//       await prisma.blog.delete({
//         where: { id: newBlog.id }
//       });
//       logger.info("✅ DELETE successful");
      
//       return true;
//     } catch (error: any) {
//       logger.error(`❌ Admin permission test failed: ${error.message}`);
//       return false;
//     }
//   }

// <======== END OF ADMIN TESTING =========>

// <======== START OF EDITOR TESTING =========>
//   async function testEditorPermissions() {
//     logger.info("\nTesting Editor User Permissions");
    
//     try {
//       // Set editor user context
//       prisma.$permit.setUser("user2@permit.io");
      
//       // Test creating a new blog (should succeed)
//       logger.info("Testing CREATE permission for editor...");
//       const newBlog = await prisma.blog.create({
//         data: {
//           title: "New Editor Test Blog",
//           content: "This is a test blog created by editor",
//           published: true,
//           authorId: "user2@permit.io"
//         }
//       });
//       logger.info(`✅ CREATE successful, created blog with ID: ${newBlog.id}`);
      
//       // Test reading blogs (should succeed)
//       logger.info("Testing READ permission for editor...");
//       const blogs = await prisma.blog.findMany();
//       logger.info(`✅ READ successful, found ${blogs.length} blogs`);
      
//       // Test updating a blog (should succeed)
//       logger.info("Testing UPDATE permission for editor...");
//       const updatedBlog = await prisma.blog.update({
//         where: { id: newBlog.id },
//         data: { 
//           title: "Updated Editor Test Blog" 
//         }
//       });
//       logger.info(`✅ UPDATE successful, updated blog title to: ${updatedBlog.title}`);
      
//       // Test deleting a blog (should fail for editors)
//       logger.info("Testing DELETE permission for editor (should fail)...");
//       try {
//         await prisma.blog.delete({
//           where: { id: newBlog.id }
//         });
//         logger.error("❌ DELETE unexpectedly succeeded for editor user");
//       } catch (error: any) {
//         logger.info("✅ DELETE correctly failed with permission error");
//       }
      
//       return true;
//     } catch (error: any) {
//       logger.error(`❌ Editor permission test failed: ${error.message}`);
//       return false;
//     }
//   }

// <======== END OF EDITOR TESTING =========>

// <======== START OF VIEWER TESTING =========>
  
  async function testViewerPermissions() {
    logger.info("\nTesting Viewer User Permissions");
    
    try {
      // Set viewer user context
      prisma.$permit.setUser("user3@permit.io");
      
      // Test reading blogs (should succeed)
      logger.info("Testing READ permission for viewer...");
      const blogs = await prisma.blog.findMany();
      logger.info(`✅ READ successful, found ${blogs.length} blogs`);
      
      // Test creating a new blog (should fail)
      logger.info("Testing CREATE permission for viewer (should fail)...");
      try {
        await prisma.blog.create({
          data: {
            title: "Viewer Test Blog",
            content: "This should fail",
            published: true,
            authorId: "user3@permit.io"
          }
        });
        logger.error("❌ CREATE unexpectedly succeeded for viewer user");
      } catch (error: any) {
        logger.info("✅ CREATE correctly failed with permission error");
      }
      
      // Get first blog ID to test other operations
      const firstBlog = blogs[0];
      
      // Test updating a blog (should fail)
      logger.info("Testing UPDATE permission for viewer (should fail)...");
      try {
        await prisma.blog.update({
          where: { id: firstBlog.id },
          data: { 
            title: "Viewer Updated Blog" 
          }
        });
        logger.error("❌ UPDATE unexpectedly succeeded for viewer user");
      } catch (error: any) {
        logger.info("✅ UPDATE correctly failed with permission error");
      }
      
      // Test deleting a blog (should fail)
      logger.info("Testing DELETE permission for viewer (should fail)...");
      try {
        await prisma.blog.delete({
          where: { id: firstBlog.id }
        });
        logger.error("❌ DELETE unexpectedly succeeded for viewer user");
      } catch (error: any) {
        logger.info("✅ DELETE correctly failed with permission error");
      }
      
      return true;
    } catch (error: any) {
      logger.error(`❌ Viewer permission test failed: ${error.message}`);
      return false;
    }
  }

// <======== END OF VIEWER TESTING =========>
  
  async function runRBACTests() {
    logger.info("🚀 Starting Blog RBAC Tests");
    
    try {
    //   await testAdminPermissions();
    //   await testEditorPermissions();
      await testViewerPermissions();
      
      logger.info("\n✅ RBAC Tests Completed Successfully");
    } catch (error: any) {
      logger.error(`❌ RBAC Tests Failed: ${error.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  // Run the tests
  runRBACTests().catch(console.error);