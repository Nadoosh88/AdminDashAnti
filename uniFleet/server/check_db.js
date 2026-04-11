const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  const admins = await prisma.admin.findMany();
  console.log('Admins in DB:', admins.map(a => ({ id: a.id, email: a.email })));
  process.exit(0);
}

checkAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
