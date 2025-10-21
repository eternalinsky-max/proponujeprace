-- CreateTable
CREATE TABLE "ContactMessageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageLen" INTEGER NOT NULL,
    "spam" BOOLEAN NOT NULL DEFAULT false,
    "rateLimited" BOOLEAN NOT NULL DEFAULT false,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "error" TEXT,
    "retryAfterSec" INTEGER,
    "deletedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "ContactMessageLog_createdAt_idx" ON "ContactMessageLog"("createdAt");

-- CreateIndex
CREATE INDEX "ContactMessageLog_ip_idx" ON "ContactMessageLog"("ip");

-- CreateIndex
CREATE INDEX "ContactMessageLog_deletedAt_idx" ON "ContactMessageLog"("deletedAt");
