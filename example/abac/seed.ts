// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   await prisma.medicalRecord.createMany({
//     data: [
//       {
//         id: "record-1",
//         patientId: "patient_1",
//         department: "cardiology",
//         content: "Patient heart examination results.",
//       },
//       {
//         id: "record-2",
//         patientId: "patient_2",
//         department: "cardiology",
//         content: "Follow-up after surgery.",
//       },
//       {
//         id: "record-3",
//         patientId: "patient_3",
//         department: "oncology",
//         content: "Initial cancer screening.",
//       },
//     ],
//   });

//   console.log("Seeded medical records!");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
