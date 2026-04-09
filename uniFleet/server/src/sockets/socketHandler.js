const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// In-memory GPS state for each bus
const busPositions = {};

const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: 'http://localhost:5173', credentials: true }
  });

  io.on('connection', (socket) => {
    console.log(`Admin connected: ${socket.id}`);
    socket.on('disconnect', () => console.log(`Admin disconnected: ${socket.id}`));
  });

  // Simulate live GPS every 3 seconds
  setInterval(async () => {
    const buses = await prisma.bus.findMany({
      where: { condition: { not: 'fault' } },
      include: { driver: true, route: true }
    });

    buses.forEach((bus) => {
      if (!busPositions[bus.id]) {
        busPositions[bus.id] = { lat: 32.0853, lng: 35.8456 };
      }
      busPositions[bus.id].lat += (Math.random() - 0.5) * 0.001;
      busPositions[bus.id].lng += (Math.random() - 0.5) * 0.001;

      io.emit('bus:location', {
        busId: bus.id,
        plateNumber: bus.plateNumber,
        lat: busPositions[bus.id].lat,
        lng: busPositions[bus.id].lng,
        routeId: bus.routeId,
        driverName: bus.driver?.name,
        status: bus.condition,
      });
    });
  }, 3000);

  return io;
};

module.exports = { initSocket };
