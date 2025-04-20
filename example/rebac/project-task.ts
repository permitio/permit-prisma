import { PrismaClient } from "@prisma/client";
import createPermitClientExtension from "../../src";
import dotenv from "dotenv";
import { AccessControlModel } from "../../src/models/PermissionModels";

dotenv.config();

const permitConfig = {
  token: process.env.PERMIT_API_KEY!,
  pdp: "http://localhost:7767",
  throwOnError: true,
  debug: true,
};

const clientExtensionConfig = {
  permitConfig,
  enableAutomaticChecks: true,
  accessControlModel: AccessControlModel.ReBAC,
};

const prisma = new PrismaClient().$extends(
  createPermitClientExtension(clientExtensionConfig)
);

async function main() {
  prisma.$permit.setUser("user1@permit.io");

  const newTask = await prisma.task.create({
    data: {
      id: "task-899",
      title: "Sync Test Task",
      projectId: "project-alpha",
    },
  });

  console.log("✅ Task Created:", newTask);

  const permissions = await prisma.$permit.getAllowedResourceIds(
    "user1@permit.io",
    "task",
    "read"
  );

  const tasks = await prisma.task.findMany();
  console.log("💜Visible tasks:", tasks);
  console.log(
    "🧾 Permissions for user1@permit.io:\n",
    JSON.stringify(permissions, null, 2)
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
