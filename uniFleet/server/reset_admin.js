const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetAdmin() {
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@unifleet.com' },
    update: { passwordHash },
    create: {
      name: 'Super Admin',
      email: 'admin@unifleet.com',
      passwordHash,
      role: 'admin',
    },
  });
  console.log('Admin password reset to "password123"');
  process.exit(0);
}

resetAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
