
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res, next) => {
  try { res.status(200).json(await prisma.parcel.findMany({ include: { trip: { include: { route: true } } } })); } catch (error) { next(error); }
};
const create = async (req, res, next) => {
  try {
    const { description, tripId } = req.body;
    const trackingCode = `JB-${Math.floor(1000 + Math.random() * 9000)}`;
    res.status(201).json(await prisma.parcel.create({
      data: { trackingCode, description, tripId, status: 'pending' },
      include: { trip: true }
    }));
  } catch (error) { next(error); }
};
const updateStatus = async (req, res, next) => {
  try { res.status(200).json(await prisma.parcel.update({ where: { id: req.params.id }, data: { status: req.body.status } })); } catch (error) { next(error); }
};
const remove = async (req, res, next) => {
  try { await prisma.parcel.delete({ where: { id: req.params.id } }); res.status(204).send(); } catch (error) { next(error); }
};
module.exports = { getAll, create, updateStatus, remove };
