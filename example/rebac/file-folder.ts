// test/rebac-automatic-filtering.ts
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
    enableAutomaticChecks: true,
    enableDataFiltering: true,
  })
);

// Test function to demonstrate automatic data filtering
async function testAutomaticDataFiltering() {
  console.log("🔍 Testing ReBAC Automatic Data Filtering");
  console.log("===========================================");

  try {
    // Test with Admin user
    // const adminUser = "admin@example.com";
    // console.log(`\n👤 Testing as ${adminUser}:`);
    
    // // Set the current user to admin
    // prisma.$permit.setUser(adminUser);
    
    // // Perform findMany - with automatic filtering, this should return all files
    // const adminFiles = await prisma.file.findMany();
    
    // console.log(`Files accessible to ${adminUser}:`);
    // console.log(adminFiles.map(file => ({ id: file.id, name: file.name })));
    // console.log(`Total files: ${adminFiles.length}`);

        // Test with Editor user
        // const editorUser = "editor@example.com";
        // console.log(`\n👤 Testing as ${editorUser}:`);
        
        // // Set the current user to editor
        // prisma.$permit.setUser(editorUser);
        
        // // Perform findMany - with automatic filtering, this should return only files 
        // // in Marketing and HR folders
        // const editorFiles = await prisma.file.findMany();
        
        // console.log(`Files accessible to ${editorUser}:`);
        // console.log(editorFiles.map(file => ({ id: file.id, name: file.name })));
        // console.log(`Total files: ${editorFiles.length}`);
    
        // Test with Viewer user

        const viewerUser = "viewer@example.com";
    console.log(`\n👤 Testing as ${viewerUser}:`);
    
    // Set the current user to viewer
    prisma.$permit.setUser(viewerUser);
    
    // Perform findMany - with automatic filtering, this should return only files
    // in Marketing and Public folders
    const viewerFiles = await prisma.file.findMany();
    
    console.log(`Files accessible to ${viewerUser}:`);
    console.log(viewerFiles.map(file => ({ id: file.id, name: file.name })));
    console.log(`Total files: ${viewerFiles.length}`);

  } catch (error) {
    console.error("❌ Error during testing:", error);
  } finally {
    await prisma.$disconnect();
  }
}
testAutomaticDataFiltering()
  .catch(console.error)
  .finally(() => console.log("✅ Test completed"));