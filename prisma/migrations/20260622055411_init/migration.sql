-- CreateTable
CREATE TABLE "Mentor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0.0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "companyTier" TEXT NOT NULL DEFAULT 'Other',
    "location" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "remoteAvailable" BOOLEAN NOT NULL DEFAULT true,
    "nextAvailable" DATETIME,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "skills" TEXT NOT NULL,
    "goals" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
