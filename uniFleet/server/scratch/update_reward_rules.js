const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating Reward Rules...');
  
  // Clear existing rules to ensure we have exactly these 4
  await prisma.rewardRule.deleteMany();
  
  const rules = [
    { label: 'Completed Trip', points: 50 },
    { label: '5 Star Driver Rating', points: 20 },
    { label: 'Special Trip Booking', points: 30 },
    { label: 'Parcel Delivery', points: 15 }
  ];

  for (const rule of rules) {
    await prisma.rewardRule.create({
      data: rule
    });
  }

  console.log('✅ 4 Reward Rules created successfully.');
  
  // Also check if we have any students to ensure leaderboard works with emails
  const students = await prisma.student.findMany({ take: 5 });
  console.log(`Found ${students.length} students in DB.`);
}

main()
  .catch((e) => {
    console.error('❌ Error updating rules:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
