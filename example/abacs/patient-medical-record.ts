import { PrismaClient } from "@prisma/client";
import createPermitClientExtension, { AccessControlModel } from "../../src";
import dotenv from "dotenv";

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
  accessControlModel: AccessControlModel.ABAC,
};

const prisma = new PrismaClient().$extends(
  createPermitClientExtension(clientExtensionConfig)
);

// async function testDoctorCRUD() {
//   prisma.$permit.setUser({
//     key: "doctor_1",
//     attributes: {
//       role: "doctor",
//       department: "cardiology",
//       id: "doctor_1",
//     },
//   });

//   console.log("Testing as doctor_1 (cardiology)...");

//   // CREATE
//   try {
//     const created = await prisma.medicalRecord.create({
//       data: {
//         department: "cardiology",
//         patientId: "patient_1",
//         content: "Doctor created this record.",
//       },
//     });
//     console.log("CREATE: Success", created);
//   } catch (e:any) {
//     console.error("CREATE: Denied", e.message);
//   }

//   // READ
//   try {
//     const records = await prisma.medicalRecord.findMany({
//       where: { department: "cardiology" },
//     });
//     console.log("READ: Success", records);
//   } catch (e: any) {
//     console.error("READ: Denied", e.message);
//   }

//   // UPDATE
//   try {
//     // Find a record to update
//     const record = await prisma.medicalRecord.findFirst({
//       where: { department: "cardiology" },
//     });
//     console.log("READ: Success", record);
//     if (record) {
//       const updated = await prisma.medicalRecord.update({
//         where: { id: record.id },
//         data: { content: "Doctor updated this record." },
//       });
//       console.log("UPDATE: Success", updated);
//     } else {
//       console.log("UPDATE: No record found to update.");
//     }
//   } catch (e: any) {
//     console.error("UPDATE: Denied", e.message);
//   }

//   // DELETE
//   try {
//     // Find a record to delete
//     const record = await prisma.medicalRecord.findFirst({
//       where: { department: "cardiology" },
//     });
//     if (record) {
//       await prisma.medicalRecord.delete({ where: { id: record.id } });
//       console.log("DELETE: Success");
//     } else {
//       console.log("DELETE: No record found to delete.");
//     }
//   } catch (e: any) {
//     console.error("DELETE: Denied", e.message);
//   }
// }

// testDoctorCRUD()
//   .catch((e) => {
//     console.error("Script error:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


// async function testAdminCRUD() {
//     // Set admin user context
//     prisma.$permit.setUser({
//       key: "admin_1",
//       attributes: {
//         role: "admin",
//         department: "cardiology",
//         id: "admin_1",
//       },
//     });
  
//     console.log("Testing as admin_1...");
  
//     // CREATE
//     try {
//       const created = await prisma.medicalRecord.create({
//         data: {
//           department: "oncology",
//           patientId: "patient_4",
//           content: "Admin created this record.",
//         },
//       });
//       console.log("CREATE: Success", created);
//     } catch (e) {
//       if (e instanceof Error) {
//         console.error("CREATE: Denied", e.message);
//       } else {
//         console.error("CREATE: Denied", e);
//       }
//     }
  
//     // READ
//     try {
//       const records = await prisma.medicalRecord.findMany();
//       console.log("READ: Success", records);
//     } catch (e) {
//       if (e instanceof Error) {
//         console.error("READ: Denied", e.message);
//       } else {
//         console.error("READ: Denied", e);
//       }
//     }
  
//     // UPDATE
//     try {
//       const record = await prisma.medicalRecord.findFirst();
//       if (record) {
//         const updated = await prisma.medicalRecord.update({
//           where: { id: record.id },
//           data: { content: "Admin updated this record." },
//         });
//         console.log("UPDATE: Success", updated);
//       } else {
//         console.log("UPDATE: No record found to update.");
//       }
//     } catch (e) {
//       if (e instanceof Error) {
//         console.error("UPDATE: Denied", e.message);
//       } else {
//         console.error("UPDATE: Denied", e);
//       }
//     }
  
//     // DELETE
//     try {
//       const record = await prisma.medicalRecord.findFirst();
//       if (record) {
//         await prisma.medicalRecord.delete({ where: { id: record.id } });
//         console.log("DELETE: Success");
//       } else {
//         console.log("DELETE: No record found to delete.");
//       }
//     } catch (e) {
//       if (e instanceof Error) {
//         console.error("DELETE: Denied", e.message);
//       } else {
//         console.error("DELETE: Denied", e);
//       }
//     }
//   }
  
//   testAdminCRUD()
//     .catch((e) => {
//       console.error("Script error:", e);
//       process.exit(1);
//     })
//     .finally(async () => {
//       await prisma.$disconnect();
//     });
  

async function testNurseCRUD() {
    // Set nurse user context
    prisma.$permit.setUser({
      key: "nurse_1",
      attributes: {
        role: "nurse",
        department: "cardiology",
        id: "nurse_1",
      },
    });
  
    console.log("Testing as nurse_1 (cardiology)...");
  
    // CREATE
    try {
      const created = await prisma.medicalRecord.create({
        data: {
          department: "cardiology",
          patientId: "patient_2",
          content: "Nurse created this record.",
        },
      });
      console.log("CREATE: Success", created);
    } catch (e) {
      if (e instanceof Error) {
        console.error("CREATE: Denied", e.message);
      } else {
        console.error("CREATE: Denied", e);
      }
    }
  
    // READ
    try {
      const records = await prisma.medicalRecord.findMany({
        where: { department: "cardiology" },
      });
      console.log("READ: Success", records);
    } catch (e) {
      if (e instanceof Error) {
        console.error("READ: Denied", e.message);
      } else {
        console.error("READ: Denied", e);
      }
    }
  
    // UPDATE
    try {
      const record = await prisma.medicalRecord.findFirst({
        where: { department: "cardiology" },
      });
      if (record) {
        const updated = await prisma.medicalRecord.update({
          where: { id: record.id },
          data: { content: "Nurse updated this record." },
        });
        console.log("UPDATE: Success", updated);
      } else {
        console.log("UPDATE: No record found to update.");
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error("UPDATE: Denied", e.message);
      } else {
        console.error("UPDATE: Denied", e);
      }
    }
  
    // DELETE
    try {
      const record = await prisma.medicalRecord.findFirst({
        where: { department: "cardiology" },
      });
      if (record) {
        await prisma.medicalRecord.delete({ where: { id: record.id } });
        console.log("DELETE: Success");
      } else {
        console.log("DELETE: No record found to delete.");
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error("DELETE: Denied", e.message);
      } else {
        console.error("DELETE: Denied", e);
      }
    }
  }
  
  testNurseCRUD()
    .catch((e) => {
      console.error("Script error:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
