const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConnection() {
  try {
    await prisma.$connect();
    console.log("DATABASE_CONNECTED");
    process.exit(0);
  } catch (error) {
    console.error("DATABASE_ERROR:", error);
    process.exit(1);
  }
}
checkConnection();
