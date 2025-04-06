import { PrismaClient } from "@prisma/client";
import createPermitClientExtension, { PermitExtensionConfig } from "../src";

const permitConfig = {
  token: "",
  pdp: "http://localhost:7767",
  //   debug: true,
};

const config: PermitExtensionConfig = {
  permitConfig,
  enableAutomaticChecks: true,
  resourceTypeMapping: {
    User: "user",
  },
  debug: true,
};

const prisma = new PrismaClient().$extends(createPermitClientExtension(config));

async function testRBAC() {
  try {
    prisma.$permit.setUser("user-123");
    // const newUserAdmin = await prisma.user.create({
    //   data: {
    //     id: "user-720",
    //     email: "hwinks2@example.com",
    //     name: "Har Winks",
    //   },
    // });
    // console.log("Admin created user:", newUserAdmin);

    // Read (findMany) (should succeed)
    console.log("Admin: Reading users...");
    const usersAdmin = await prisma.user.findMany();
    console.log("Admin read users:", usersAdmin);

    // console.log("Admin: Updating user...");
    // const updatedUserAdmin = await prisma.user.update({
    //   where: { id: "user-720" },
    //   data: { name: "Har Winks Updated" },
    // });
    // console.log("Admin updated user:", updatedUserAdmin);

    // Delete (should succeed)
    // console.log("Admin: Deleting user...");
    // const deletedUserAdmin = await prisma.user.delete({
    //   where: { id: "user-790" },
    // });
    // console.log("Admin deleted user:", deletedUserAdmin);
  } catch (error) {
    console.error("Unexpected error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testRBAC();
