/*
  Warnings:

  - You are about to drop the `RagDocumentChunk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SourceDocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RagDocumentChunk" DROP CONSTRAINT "RagDocumentChunk_sourceDocumentId_fkey";

-- DropTable
DROP TABLE "RagDocumentChunk";

-- DropTable
DROP TABLE "SourceDocument";

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
