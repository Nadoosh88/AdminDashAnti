
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getStats = async (req, res, next) => {
  try {
    const [buses, drivers, students, trips] = await Promise.all([
      prisma.bus.count(), prisma.driver.count(), prisma.student.count(), prisma.trip.count()
    ]);
    res.status(200).json({ buses, drivers, students, trips });
  } catch (error) { next(error); }
};
module.exports = { getStats };
