
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res, next) => {
  try { res.status(200).json(await prisma.trip.findMany({ include: { route: true, parcels: true } })); } catch (error) { next(error); }
};
const create = async (req, res, next) => {
  try { res.status(201).json(await prisma.trip.create({ data: req.body })); } catch (error) { next(error); }
};
const update = async (req, res, next) => {
  try { res.status(200).json(await prisma.trip.update({ where: { id: req.params.id }, data: req.body })); } catch (error) { next(error); }
};
const remove = async (req, res, next) => {
  try { await prisma.trip.delete({ where: { id: req.params.id } }); res.status(204).send(); } catch (error) { next(error); }
};
module.exports = { getAll, create, update, remove };
