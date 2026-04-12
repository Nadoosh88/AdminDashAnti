
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res, next) => {
  try {
    const parcels = await prisma.parcel.findMany({
      include: {
        trip: { include: { route: true } },
        driver: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(parcels);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { description, tripId, driverId } = req.body;
    const trackingCode = `JB-${Math.floor(1000 + Math.random() * 9000)}`;
    const parcel = await prisma.parcel.create({
      data: {
        trackingCode,
        description,
        tripId: tripId || null,
        driverId: driverId || null,
        status: 'pending'
      },
      include: {
        trip: { include: { route: true } },
        driver: true
      }
    });
    res.status(201).json(parcel);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const parcel = await prisma.parcel.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        trip: { include: { route: true } },
        driver: true
      }
    });
    res.status(200).json(parcel);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await prisma.parcel.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, updateStatus, remove };
