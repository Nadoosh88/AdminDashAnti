
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res, next) => {
  try { res.status(200).json(await prisma.student.findMany()); } catch (error) { next(error); }
};
const blacklist = async (req, res, next) => {
  try { 
    const { reason, until } = req.body;
    res.status(200).json(await prisma.student.update({ 
      where: { id: req.params.id }, 
      data: { status: 'blacklisted', blacklistedReason: reason, blacklistedUntil: until ? new Date(until) : null } 
    })); 
  } catch (error) { next(error); }
};
const liftBlacklist = async (req, res, next) => {
  try { 
    res.status(200).json(await prisma.student.update({ 
      where: { id: req.params.id }, 
      data: { status: 'active', blacklistedReason: null, blacklistedUntil: null } 
    })); 
  } catch (error) { next(error); }
};
const getLeaderboard = async (req, res, next) => {
  try { 
    const students = await prisma.student.findMany({ 
      where: { points: { isNot: null } },
      include: { points: true },
      orderBy: { points: { total: 'desc' } },
      take: 10
    });
    res.status(200).json(students); 
  } catch (error) { next(error); }
};
module.exports = { getAll, getLeaderboard, blacklist, liftBlacklist };
