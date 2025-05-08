// test/abac-post-fetch-filtering.ts
import { PrismaClient } from "@prisma/client";
import createPermitClientExtension, { AccessControlModel } from "../../src";
import dotenv from "dotenv";

dotenv.config();

const permitConfig = {
  token: process.env.PERMIT_API_KEY!,
  pdp: process.env.PERMIT_PDP_URL || "http://localhost:7766",
  debug: true,
};

// Create Prisma client with our extension
const prisma = new PrismaClient().$extends(
  createPermitClientExtension({
    permitConfig,
    accessControlModel: AccessControlModel.ABAC,
    // We'll disable automatic filtering to test our post-fetch filtering
    enableDataFiltering: false,
  })
);

// Test function to demonstrate ABAC post-fetch filtering
async function testABACPostFetchFiltering() {
  console.log("🔍 Testing ABAC Post-Fetch Data Filtering");
  console.log("=========================================");

  try {
    // First, get all projects without any filtering
    const allProjects = await prisma.project.findMany();
    console.log(`\nTotal projects in database: ${allProjects.length}`);
    
    // Group projects by status for easier verification
    const projectsByStatus = {
      draft: allProjects.filter(p => p.status === "draft"),
      active: allProjects.filter(p => p.status === "active"),
      completed: allProjects.filter(p => p.status === "completed")
    };
    
    console.log("Projects by status:");
    console.log(`- Draft: ${projectsByStatus.draft.length}`);
    console.log(`- Active: ${projectsByStatus.active.length}`);
    console.log(`- Completed: ${projectsByStatus.completed.length}`);
    
    // Test with Manager (should see all projects)
    const managerUser = { 
      key: "manager@example.com",
      attributes: { role: "manager" }
    };
    console.log(`\n👤 Testing post-fetch filtering for manager:`);
    
    // Set the current user
    prisma.$permit.setUser(managerUser);
    
    // Use filterQueryResults to filter the already fetched projects
    const managerProjects = await prisma.$permit.filterQueryResults(
      "read",
      "project",
      allProjects
    );
    
    console.log(`Projects manager can access (after filtering):`);
    console.log(managerProjects.map(project => ({ 
      id: project.id, 
      name: project.name,
      status: project.status 
    })));
    console.log(`Total accessible projects: ${managerProjects.length}`);

    // Test with Developer (should see active and completed)
    const developerUser = { 
      key: "developer@example.com",
      attributes: { role: "developer" }
    };
    console.log(`\n👤 Testing post-fetch filtering for developer:`);
    
    // Set the current user
    prisma.$permit.setUser(developerUser);
    
    // Use filterQueryResults to filter the already fetched projects
    const developerProjects = await prisma.$permit.filterQueryResults(
      "read",
      "project",
      allProjects
    );
    
    console.log(`Projects developer can access (after filtering):`);
    console.log(developerProjects.map(project => ({ 
      id: project.id, 
      name: project.name,
      status: project.status 
    })));
    console.log(`Total accessible projects: ${developerProjects.length}`);
    
    // Test with Intern (should see only completed)
    const internUser = { 
      key: "intern@example.com",
      attributes: { role: "intern" }
    };
    console.log(`\n👤 Testing post-fetch filtering for intern:`);
    
    // Set the current user
    prisma.$permit.setUser(internUser);
    
    // Use filterQueryResults to filter the already fetched projects
    const internProjects = await prisma.$permit.filterQueryResults(
      "read",
      "project",
      allProjects
    );
    
    console.log(`Projects intern can access (after filtering):`);
    console.log(internProjects.map(project => ({ 
      id: project.id, 
      name: project.name,
      status: project.status 
    })));
    console.log(`Total accessible projects: ${internProjects.length}`);

    // Results comparison
    console.log("\n📊 Results Comparison:");
    console.log(`Manager access: ${managerProjects.length} projects`);
    console.log(`Developer access: ${developerProjects.length} projects`);
    console.log(`Intern access: ${internProjects.length} projects`);
    
    // Verify by status
    console.log("\n📋 Access by Status:");
    
    const managerByStatus = {
      draft: managerProjects.filter(p => p.status === "draft").length,
      active: managerProjects.filter(p => p.status === "active").length,
      completed: managerProjects.filter(p => p.status === "completed").length
    };
    
    const developerByStatus = {
      draft: developerProjects.filter(p => p.status === "draft").length,
      active: developerProjects.filter(p => p.status === "active").length,
      completed: developerProjects.filter(p => p.status === "completed").length
    };
    
    const internByStatus = {
      draft: internProjects.filter(p => p.status === "draft").length,
      active: internProjects.filter(p => p.status === "active").length,
      completed: internProjects.filter(p => p.status === "completed").length
    };
    
    console.log("Manager access by status:", managerByStatus);
    console.log("Developer access by status:", developerByStatus);
    console.log("Intern access by status:", internByStatus);

  } catch (error) {
    console.error("❌ Error during testing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testABACPostFetchFiltering()
  .catch(console.error)
  .finally(() => console.log("✅ Test completed"));