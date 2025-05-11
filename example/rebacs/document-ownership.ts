// example/rebac/document-ownership.ts
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
    enableAutomaticChecks: true,
    enableAutoSync: true,
    accessControlModel: AccessControlModel.ReBAC
  })
);

async function testDocumentOwnership() {
  console.log("🔍 Testing Document Ownership with ReBAC");
  console.log("=========================================");
  
  try {
    // Clear existing data
    await prisma.$executeRaw`DELETE FROM "Document"`;
    console.log("Database cleared");
    
    // Test with first user (owner)
    const user1 = "user1@example.com";
    console.log(`\n👤 Testing as ${user1} (document owner):`);
    
    // Set user context
    prisma.$permit.setUser(user1);
    
    // Create a document as user1
    console.log("Creating a document...");
    const doc = await prisma.document.create({
      data: {
        title: "Test Document",
        content: "This is a test document",
        ownerId: user1
      }
    });
    console.log(`Document created with ID: ${doc.id}`);
    
    // Update the document as owner (should succeed)
    console.log("Updating document as owner...");
    const updatedDoc = await prisma.document.update({
      where: { id: doc.id },
      data: { content: "Updated content by owner" }
    });
    console.log("✅ Update successful:", updatedDoc.content);
    
    // Test with second user (non-owner)
    const user2 = "user2@example.com";
    console.log(`\n👤 Testing as ${user2} (non-owner):`);
    
    // Set user context to user2
    prisma.$permit.setUser(user2);
    
    // Try to update the document as non-owner (should fail)
    console.log("Attempting to update document as non-owner...");
    try {
      await prisma.document.update({
        where: { id: doc.id },
        data: { content: "Unauthorized update attempt" }
      });
      console.log("❌ Update succeeded (UNEXPECTED!)");
    } catch (error: any) {
      console.log("✅ Update failed as expected:", error.message);
    }
    
    console.log("\n✅ Test completed successfully");
  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDocumentOwnership()
  .catch(console.error);