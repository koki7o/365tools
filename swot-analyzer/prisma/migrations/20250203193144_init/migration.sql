-- CreateTable
CREATE TABLE "SwotAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SwotItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "strengthOfId" TEXT,
    "weaknessOfId" TEXT,
    "opportunityOfId" TEXT,
    "threatOfId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SwotItem_strengthOfId_fkey" FOREIGN KEY ("strengthOfId") REFERENCES "SwotAnalysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SwotItem_weaknessOfId_fkey" FOREIGN KEY ("weaknessOfId") REFERENCES "SwotAnalysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SwotItem_opportunityOfId_fkey" FOREIGN KEY ("opportunityOfId") REFERENCES "SwotAnalysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SwotItem_threatOfId_fkey" FOREIGN KEY ("threatOfId") REFERENCES "SwotAnalysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
