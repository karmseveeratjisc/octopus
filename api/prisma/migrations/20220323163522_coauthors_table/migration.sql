-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "coAuthors" TEXT[];

-- CreateTable
CREATE TABLE "CoAuthors" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "linkedUser" TEXT,
    "confirmedCoAuthor" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CoAuthors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoAuthors_code_key" ON "CoAuthors"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CoAuthors_publicationId_email_key" ON "CoAuthors"("publicationId", "email");

-- AddForeignKey
ALTER TABLE "CoAuthors" ADD CONSTRAINT "CoAuthors_linkedUser_fkey" FOREIGN KEY ("linkedUser") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoAuthors" ADD CONSTRAINT "CoAuthors_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
