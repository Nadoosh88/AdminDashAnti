const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adjusting Reward Rules points to match 1-20 range...');
  
  // Clear existing rules to ensure we have exactly these 4
  await prisma.rewardRule.deleteMany();
  
  const rules = [
    { label: 'Completed Trip', points: 10 },
    { label: '5 Star Driver Rating', points: 5 },
    { label: 'Special Trip Booking', points: 8 },
    { label: 'Parcel Delivery', points: 4 }
  ];

  for (const rule of rules) {
    await prisma.rewardRule.create({
      data: rule
    });
  }

  console.log('✅ 4 Reward Rules adjusted successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error updating rules:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
