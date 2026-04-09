const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database...');

  const passwordHash = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@unifleet.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@unifleet.com',
      passwordHash,
      role: 'admin',
    },
  });

  const route1 = await prisma.route.create({
    data: {
      name: 'North Campus Loop',
      startStop: 'Main Gate',
      endStop: 'Engineering Hub',
      status: 'active',
      stops: {
        create: [
          { name: 'Main Gate', order: 1, lat: 32.0853, lng: 35.8456 },
          { name: 'Library', order: 2, lat: 32.0860, lng: 35.8465 },
          { name: 'Engineering Hub', order: 3, lat: 32.0875, lng: 35.8480 },
        ],
      },
    },
  });

  const driver1 = await prisma.driver.create({
    data: {
      name: 'John Doe',
      phone: '555-0101',
      licenseNumber: 'LIC-001',
      status: 'active',
    },
  });

  const bus1 = await prisma.bus.create({
    data: {
      plateNumber: 'UNB-101',
      model: 'Volvo 9900',
      capacity: 50,
      condition: 'good',
      routeId: route1.id,
    },
  });

  await prisma.driver.update({
    where: { id: driver1.id },
    data: { busId: bus1.id },
  });

  const student1 = await prisma.student.create({
    data: {
      universityId: 'STU2023001',
      name: 'Jane Smith',
      email: 'jane@student.unifleet.com',
      status: 'active',
    },
  });

  await prisma.rewardRule.createMany({
    data: [
      { label: 'Report Bus Issue', points: 50 },
      { label: 'Perfect Ridership', points: 20 },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
