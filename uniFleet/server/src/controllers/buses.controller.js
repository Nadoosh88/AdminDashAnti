
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res, next) => {
  try { res.status(200).json(await prisma.bus.findMany({ include: { route: true, driver: true } })); } catch (error) { next(error); }
};
const getLocations = async (req, res, next) => {
  try { res.status(200).json(await prisma.bus.findMany({ select: { id: true, plateNumber: true, condition: true, routeId: true, driver: true } })); } catch (error) { next(error); }
};
const create = async (req, res, next) => {
  try { res.status(201).json(await prisma.bus.create({ data: req.body })); } catch (error) { next(error); }
};
const update = async (req, res, next) => {
  try { res.status(200).json(await prisma.bus.update({ where: { id: req.params.id }, data: req.body })); } catch (error) { next(error); }
};
const remove = async (req, res, next) => {
  try { await prisma.bus.delete({ where: { id: req.params.id } }); res.status(204).send(); } catch (error) { next(error); }
};
module.exports = { getAll, getLocations, create, update, remove };
