const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Setting specific Reward Rules points...');
  
  // Clear existing rules to ensure we have exactly these 4
  await prisma.rewardRule.deleteMany();
  
  const rules = [
    { label: 'Completed Trip', points: 1 },
    { label: '5 Star Driver Rating', points: 2 },
    { label: 'Special Trip Booking', points: 5 },
    { label: 'Parcel Delivery', points: 2 }
  ];

  for (const rule of rules) {
    await prisma.rewardRule.create({
      data: rule
    });
  }

  console.log('✅ 4 Reward Rules updated with requested points.');
}

main()
  .catch((e) => {
    console.error('❌ Error updating rules:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
