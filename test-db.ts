import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sessionTypes = await prisma.sessionType.findMany();
  console.log("Session Types:", sessionTypes);
  
  const mentors = await prisma.mentor.findMany();
  console.log("Mentors:", mentors.map(m => ({ id: m.id, userId: m.userId })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
