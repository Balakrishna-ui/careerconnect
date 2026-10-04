const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    const hash = await bcrypt.hash('admin123', 10);
    admin = await prisma.user.create({
      data: {
        email: 'admin@careerconnect.io',
        password: hash,
        name: 'Admin User',
        role: 'ADMIN'
      }
    });
    console.log('Created admin user: admin@careerconnect.io / admin123');
  } else {
    // Force update password to admin123 so the user can definitely login
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hash }
    });
    console.log('Found admin user: ' + admin.email + ' / admin123');
  }
}
main().then(() => prisma.$disconnect());
