const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);
  
  await prisma.user.updateMany({
    where: {
      email: {
        in: ["aarav0@example.com", "alex@example.com", "priya1@example.com"]
      }
    },
    data: {
      password: passwordHash
    }
  });

  console.log("Passwords updated successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
