
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAnalytics = async (req, res, next) => {
  try { 
    const results = await prisma.rating.groupBy({ by: ['category'], _avg: { score: true } });
    const formatted = {};
    results.forEach(r => formatted[r.category] = r._avg.score || 0);
    res.status(200).json(formatted); 
  } catch (error) { next(error); }
};
const getComments = async (req, res, next) => {
  try { 
    res.status(200).json(await prisma.rating.findMany({ 
      where: { comment: { not: null } }, 
      include: { driver: true, student: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    })); 
  } catch (error) { next(error); }
};
module.exports = { getAnalytics, getComments };
