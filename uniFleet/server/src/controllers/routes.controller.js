
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res, next) => {
  try { res.status(200).json(await prisma.route.findMany({ include: { stops: true, _count: { select: { buses: true } } } })); } catch (error) { next(error); }
};
const create = async (req, res, next) => {
  try {
    const { name, startStop, endStop, status, stops } = req.body;
    res.status(201).json(await prisma.route.create({
      data: {
        name,
        startStop,
        endStop,
        status: status || 'active',
        stops: stops && stops.length > 0 ? { 
          create: stops.map(({ name, order, lat, lng }) => ({ name, order, lat: Number(lat) || 0, lng: Number(lng) || 0 })) 
        } : undefined,
      },
      include: { stops: true }
    }));
  } catch (error) { next(error); }
};
const update = async (req, res, next) => {
  try {
    const { name, startStop, endStop, status, stops } = req.body;
    res.status(200).json(await prisma.route.update({
      where: { id: req.params.id },
      data: {
        name,
        startStop,
        endStop,
        status: status || 'active',
        stops: stops ? { 
          deleteMany: {}, 
          create: stops.map(({ name, order, lat, lng }) => ({ name, order, lat: Number(lat) || 0, lng: Number(lng) || 0 })) 
        } : undefined,
      },
      include: { stops: true }
    }));
  } catch (error) { next(error); }
};
const remove = async (req, res, next) => {
  try { await prisma.route.delete({ where: { id: req.params.id } }); res.status(204).send(); } catch (error) { next(error); }
};
module.exports = { getAll, create, update, remove };
