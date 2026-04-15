const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Demo Students for Leaderboard...');
  
  const demoStudents = [
    {
      universityId: '20210001',
      name: 'Ahmad Al-Omari',
      email: 'ahmad.omari@cit.just.edu.jo',
      points: { total: 750, freeRides: 1 }
    },
    {
      universityId: '20210002',
      name: 'Sarah Jordan',
      email: 'sarah.j@cit.just.edu.jo',
      points: { total: 520, freeRides: 1 }
    },
    {
      universityId: '20210003',
      name: 'Zaid Fawzi',
      email: 'zaid.fawzi@cit.just.edu.jo',
      points: { total: 480, freeRides: 0 }
    },
    {
      universityId: '20220150',
      name: 'Lina Mansour',
      email: 'l.mansour@cit.just.edu.jo',
      points: { total: 310, freeRides: 0 }
    }
  ];

  for (const s of demoStudents) {
    await prisma.student.upsert({
      where: { universityId: s.universityId },
      update: {
        points: {
          update: s.points
        }
      },
      create: {
        universityId: s.universityId,
        name: s.name,
        email: s.email,
        status: 'active',
        points: {
          create: s.points
        }
      }
    });
  }

  console.log('✅ Demo students seeded successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding students:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
