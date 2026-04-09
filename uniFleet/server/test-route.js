
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Route Create...');
    const result = await prisma.route.create({
      data: {
        name: 'Test Route ' + Date.now(),
        startStop: 'Start',
        endStop: 'End',
        status: 'active',
        stops: {
          create: [
            { name: 'Stop 1', order: 1, lat: 0, lng: 0 },
            { name: 'Stop 2', order: 2, lat: 0, lng: 0 }
          ]
        }
      },
      include: { stops: true }
    });
    console.log('Success:', result);
  } catch (e) {
    console.error('Error creating route:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
