const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkPassword() {
  const admin = await prisma.admin.findUnique({ where: { email: 'admin@unifleet.com' } });
  if (!admin) {
    console.log('Admin not found');
    process.exit(1);
  }
  const isMatch = await bcrypt.compare('password123', admin.passwordHash);
  console.log('Password "password123" matches:', isMatch);
  process.exit(0);
}

checkPassword().catch(err => {
  console.error(err);
  process.exit(1);
});
