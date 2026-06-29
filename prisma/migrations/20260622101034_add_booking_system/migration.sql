-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MentorSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentorId" TEXT NOT NULL,
    "sessionDuration" INTEGER NOT NULL DEFAULT 60,
    "bufferTime" INTEGER NOT NULL DEFAULT 15,
    "maxSessionsPerDay" INTEGER NOT NULL DEFAULT 5,
    "advanceBookingWindow" INTEGER NOT NULL DEFAULT 30,
    "noticePeriod" INTEGER NOT NULL DEFAULT 24,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MentorSettings_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeeklySchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "WeeklySchedule_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentorId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "reason" TEXT,
    CONSTRAINT "BlockedDate_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "price" INTEGER NOT NULL,
    "meetingLink" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT,
    "mentorId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CalendarIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentorId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CalendarIntegration_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MentorSettings_mentorId_key" ON "MentorSettings"("mentorId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklySchedule_mentorId_dayOfWeek_key" ON "WeeklySchedule"("mentorId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedDate_mentorId_date_key" ON "BlockedDate"("mentorId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayOrderId_key" ON "Payment"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayPaymentId_key" ON "Payment"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarIntegration_mentorId_key" ON "CalendarIntegration"("mentorId");
