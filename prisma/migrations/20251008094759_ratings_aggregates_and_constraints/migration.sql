/*
  Warnings:

  - A unique constraint covering the columns `[authorId,targetType,targetId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN "ratingBalance" INTEGER;
ALTER TABLE "Review" ADD COLUMN "ratingClarity" INTEGER;
ALTER TABLE "Review" ADD COLUMN "ratingCulture" INTEGER;
ALTER TABLE "Review" ADD COLUMN "ratingPay" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ratingAvg" REAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Company" ("createdAt", "id", "logoUrl", "name", "ownerId", "verified", "website") SELECT "createdAt", "id", "logoUrl", "name", "ownerId", "verified", "website" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "tagsCsv" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "companyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ratingAvg" REAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Job_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("city", "companyId", "createdAt", "description", "id", "isRemote", "ownerId", "salaryMax", "salaryMin", "status", "tagsCsv", "title", "updatedAt") SELECT "city", "companyId", "createdAt", "description", "id", "isRemote", "ownerId", "salaryMax", "salaryMin", "status", "tagsCsv", "title", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE INDEX "Job_ownerId_idx" ON "Job"("ownerId");
CREATE INDEX "Job_status_idx" ON "Job"("status");
CREATE INDEX "Job_city_idx" ON "Job"("city");
CREATE INDEX "Job_ownerId_createdAt_idx" ON "Job"("ownerId", "createdAt");
CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "phone" TEXT,
    "photoUrl" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ratingWorkerAvg" REAL NOT NULL DEFAULT 0,
    "ratingWorkerCount" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("createdAt", "displayName", "email", "firebaseUid", "id", "isAdmin", "phone", "photoUrl") SELECT "createdAt", "displayName", "email", "firebaseUid", "id", "isAdmin", "phone", "photoUrl" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Review_targetType_targetId_idx" ON "Review"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Review_authorId_idx" ON "Review"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_authorId_targetType_targetId_key" ON "Review"("authorId", "targetType", "targetId");
