// // example/data-filtering/data-filtering-rebac.ts
// import { PrismaClient } from "@prisma/client";
// import createPermitClientExtension, { AccessControlModel } from "../../src";
// import dotenv from "dotenv";
// import logger from "../../src/utils/logger";

// dotenv.config();

// // Configure Permit and the Prisma extension
// const permitConfig = {
//   token: process.env.PERMIT_API_KEY!,
//   pdp: "http://localhost:7766",
//   throwOnError: true,
//   debug: true,
// };

// const clientExtensionConfig = {
//   permitConfig,
//   accessControlModel: AccessControlModel.ReBAC,
//   enableAutomaticChecks: true,
//   enableDataFiltering: true
// };

// // Extend PrismaClient with the Permit extension
// const prisma = new PrismaClient().$extends(
//   createPermitClientExtension(clientExtensionConfig)
// );

// // Test direct permission ID checking
// async function testDirectPermissionIds() {
//   logger.info("🔍 TESTING DIRECT PERMISSION IDS");
//   logger.info("===============================");

//   try {
//     // Test John's permissions
//     logger.info("\n📋 Testing John's permissions");
//     logger.info("---------------------------");

//     // Check project access
//     const johnProjectIds = await prisma.$permit.getAllowedResourceIds(
//       "john@company.com",
//       "project",
//       "read"
//     );
//     logger.info(`Projects John can READ: ${johnProjectIds.join(", ") || "none"}`);

//     // Check task access
//     const johnTaskIds = await prisma.$permit.getAllowedResourceIds(
//       "john@company.com",
//       "task",
//       "read"
//     );
//     logger.info(`Tasks John can READ: ${johnTaskIds.join(", ") || "none"}`);

//     // Test Mary's permissions
//     logger.info("\n📋 Testing Mary's permissions");
//     logger.info("---------------------------");

//     // Check project access
//     const maryProjectIds = await prisma.$permit.getAllowedResourceIds(
//       "mary@company.com",
//       "project",
//       "read"
//     );
//     logger.info(`Projects Mary can READ: ${maryProjectIds.join(", ") || "none"}`);

//     // Check task access
//     const maryTaskIds = await prisma.$permit.getAllowedResourceIds(
//       "mary@company.com",
//       "task",
//       "read"
//     );
//     logger.info(`Tasks Mary can READ: ${maryTaskIds.join(", ") || "none"}`);

//     return {
//       john: { projects: johnProjectIds, tasks: johnTaskIds },
//       mary: { projects: maryProjectIds, tasks: maryTaskIds }
//     };
//   } catch (error: any) {
//     logger.error(`Error checking permissions: ${error.message}`);
//     throw error;
//   }
// }

// // Run test
// async function runTests() {
//   logger.info("🚀 STARTING ReBAC DATA FILTERING TESTS");
//   logger.info("======================================");

//   try {
//     // Run only the direct permissions test
//     const directPermissionsResults = await testDirectPermissionIds();

//     // Log summary
//     logger.info("\n\n📊 TEST RESULTS SUMMARY");
//     logger.info("=======================");

//     // Verify John's results
//     logger.info(`John's allowed projects: ${directPermissionsResults.john.projects.join(", ") || "none"}`);
//     logger.info(`John's allowed tasks: ${directPermissionsResults.john.tasks.join(", ") || "none"}`);

//     // Verify Mary's results
//     logger.info(`Mary's allowed projects: ${directPermissionsResults.mary.projects.join(", ") || "none"}`);
//     logger.info(`Mary's allowed tasks: ${directPermissionsResults.mary.tasks.join(", ") || "none"}`);

//     // Check if expected permissions are there
//     const johnHasCorrectPermissions =
//       directPermissionsResults.john.projects.includes("project_alpha") &&
//       directPermissionsResults.john.tasks.includes("task-alpha-1") &&
//       directPermissionsResults.john.tasks.includes("task-alpha-2");

//     const maryHasCorrectPermissions =
//       directPermissionsResults.mary.projects.includes("project_beta") &&
//       directPermissionsResults.mary.tasks.includes("task-beta-1") &&
//       directPermissionsResults.mary.tasks.includes("task-beta-2");

//     logger.info(`John's permissions test: ${johnHasCorrectPermissions ? '✅ PASSED' : '❌ FAILED'}`);
//     logger.info(`Mary's permissions test: ${maryHasCorrectPermissions ? '✅ PASSED' : '❌ FAILED'}`);
//     logger.info(`Overall result: ${johnHasCorrectPermissions && maryHasCorrectPermissions ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

//   } catch (error: any) {
//     logger.error(`❌ Test suite failed: ${error.message}`);
//   } finally {
//     // Always disconnect the Prisma client when done
//     await prisma.$disconnect();
//     logger.info("\n======================================");
//     logger.info("🏁 ReBAC Data Filtering Tests Complete");
//   }
// }

// // Run the tests
// runTests().catch((error: any) => {
//   logger.error(`Fatal error: ${error.message}`);
//   process.exit(1);
// });

// example/data-filtering/automatic-filtering-rebac.ts
import { PrismaClient } from "@prisma/client";
import createPermitClientExtension from "../../src";
import dotenv from "dotenv";
import logger from "../../src/utils/logger";

dotenv.config();

// Configure Permit and the Prisma extension
const permitConfig = {
  token: process.env.PERMIT_API_KEY!,
  pdp: "http://localhost:7766",
  throwOnError: true,
  debug: true,
};

const clientExtensionConfig = {
  permitConfig,
  enableAutomaticChecks: true,
  enableDataFiltering: true,
};

// Extend PrismaClient with the Permit extension
const prisma = new PrismaClient().$extends(
  createPermitClientExtension(clientExtensionConfig)
);

// Test automatic data filtering
async function testAutomaticFiltering() {
  logger.info("🔍 TESTING AUTOMATIC DATA FILTERING");
  logger.info("==================================");

  try {
    // Test John's filtered queries
    logger.info("\n📋 Filtering for John");
    logger.info("------------------");

    // Set the user context to John
    prisma.$permit.setUser("john@company.com");

    // Query projects - should only return project_alpha
    const johnsProjects = await prisma.project.findMany();
    logger.info(`John's visible projects: ${johnsProjects.length}`);
    logger.info(`Project IDs: ${johnsProjects.map((p) => p.id).join(", ")}`);

    // Query tasks - should only return alpha tasks
    const johnsTasks = await prisma.task.findMany();
    logger.info(`John's visible tasks: ${johnsTasks.length}`);
    logger.info(`Task IDs: ${johnsTasks.map((t) => t.id).join(", ")}`);

    // Test with where conditions
    const johnsFilteredTasks = await prisma.task.findMany({
      where: {
        name: {
          contains: "Task",
        },
      },
    });
    logger.info(
      `John's filtered tasks (with condition): ${johnsFilteredTasks.length}`
    );
    logger.info(`Task IDs: ${johnsFilteredTasks.map((t) => t.id).join(", ")}`);

    // Test Mary's filtered queries
    logger.info("\n📋 Filtering for Mary");
    logger.info("------------------");

    // Set the user context to Mary
    prisma.$permit.setUser("mary@company.com");

    // Query projects - should only return project_beta
    const marysProjects = await prisma.project.findMany();
    logger.info(`Mary's visible projects: ${marysProjects.length}`);
    logger.info(`Project IDs: ${marysProjects.map((p) => p.id).join(", ")}`);

    // Query tasks - should only return beta tasks
    const marysTasks = await prisma.task.findMany();
    logger.info(`Mary's visible tasks: ${marysTasks.length}`);
    logger.info(`Task IDs: ${marysTasks.map((t) => t.id).join(", ")}`);

    // Test with where conditions
    const marysFilteredTasks = await prisma.task.findMany({
      where: {
        name: {
          contains: "Task",
        },
      },
    });
    logger.info(
      `Mary's filtered tasks (with condition): ${marysFilteredTasks.length}`
    );
    logger.info(`Task IDs: ${marysFilteredTasks.map((t) => t.id).join(", ")}`);

    return {
      john: {
        projects: johnsProjects,
        tasks: johnsTasks,
        filteredTasks: johnsFilteredTasks,
      },
      mary: {
        projects: marysProjects,
        tasks: marysTasks,
        filteredTasks: marysFilteredTasks,
      },
    };
  } catch (error: any) {
    logger.error(`Error during automatic filtering test: ${error.message}`);
    throw error;
  }
}

// Run test
async function runTests() {
  logger.info("🚀 STARTING ReBAC AUTOMATIC FILTERING TESTS");
  logger.info("==========================================");

  try {
    const filteringResults = await testAutomaticFiltering();

    // Log summary
    logger.info("\n\n📊 TEST RESULTS SUMMARY");
    logger.info("=======================");

    // Check John's automatic filtering results
    const johnProjectCount = filteringResults.john.projects.length;
    const johnTaskCount = filteringResults.john.tasks.length;
    const johnProjectMatch = filteringResults.john.projects.every(
      (p) => p.id === "project_alpha"
    );
    const johnTaskMatch = filteringResults.john.tasks.every((t) =>
      t.id.includes("alpha")
    );

    // Check Mary's automatic filtering results
    const maryProjectCount = filteringResults.mary.projects.length;
    const maryTaskCount = filteringResults.mary.tasks.length;
    const maryProjectMatch = filteringResults.mary.projects.every(
      (p) => p.id === "project_beta"
    );
    const maryTaskMatch = filteringResults.mary.tasks.every((t) =>
      t.id.includes("beta")
    );

    // Log detailed results
    logger.info(`John's visible projects: ${johnProjectCount} (Expected: 1)`);
    logger.info(
      `Project IDs: ${filteringResults.john.projects
        .map((p) => p.id)
        .join(", ")}`
    );
    logger.info(`John's visible tasks: ${johnTaskCount} (Expected: 2)`);
    logger.info(
      `Task IDs: ${filteringResults.john.tasks.map((t) => t.id).join(", ")}`
    );

    logger.info(`Mary's visible projects: ${maryProjectCount} (Expected: 1)`);
    logger.info(
      `Project IDs: ${filteringResults.mary.projects
        .map((p) => p.id)
        .join(", ")}`
    );
    logger.info(`Mary's visible tasks: ${maryTaskCount} (Expected: 2)`);
    logger.info(
      `Task IDs: ${filteringResults.mary.tasks.map((t) => t.id).join(", ")}`
    );

    // Check overall results
    const johnSuccess =
      johnProjectCount === 1 &&
      johnTaskCount === 2 &&
      johnProjectMatch &&
      johnTaskMatch;
    const marySuccess =
      maryProjectCount === 1 &&
      maryTaskCount === 2 &&
      maryProjectMatch &&
      maryTaskMatch;

    logger.info(
      `John's automatic filtering test: ${
        johnSuccess ? "✅ PASSED" : "❌ FAILED"
      }`
    );
    logger.info(
      `Mary's automatic filtering test: ${
        marySuccess ? "✅ PASSED" : "❌ FAILED"
      }`
    );
    logger.info(
      `Overall result: ${
        johnSuccess && marySuccess
          ? "✅ ALL TESTS PASSED"
          : "❌ SOME TESTS FAILED"
      }`
    );
  } catch (error: any) {
    logger.error(`❌ Test suite failed: ${error.message}`);
  } finally {
    // Always disconnect the Prisma client when done
    await prisma.$disconnect();
    logger.info("\n==========================================");
    logger.info("🏁 ReBAC Automatic Filtering Tests Complete");
  }
}

// Run the tests
runTests().catch((error: any) => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
