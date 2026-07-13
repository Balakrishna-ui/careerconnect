const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. User from screenshot
  await prisma.user.upsert({
    where: { email: "sailureddy0912@gmail.com" },
    update: { password: hashedPassword },
    create: {
      name: "Sailu Reddy",
      email: "sailureddy0912@gmail.com",
      password: hashedPassword,
      role: "JOB_SEEKER",
    },
  });

  // 2. Admin user
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { password: hashedPassword, role: "ADMIN" },
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 3. Mentor user
  const mentorEmail = "mentor@example.com";
  const mentorUser = await prisma.user.upsert({
    where: { email: mentorEmail },
    update: { password: hashedPassword, role: "MENTOR" },
    create: {
      name: "Test Mentor",
      email: mentorEmail,
      password: hashedPassword,
      role: "MENTOR",
    },
  });

  const existingMentor = await prisma.mentor.findUnique({ where: { userId: mentorUser.id }});
  if (!existingMentor) {
    await prisma.mentor.create({
      data: {
        userId: mentorUser.id,
        name: "Test Mentor",
        applicationStatus: "VERIFIED",
        companyTier: "Other",
        profileCompleted: true
      }
    });
  }

  console.log("Accounts ready!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
