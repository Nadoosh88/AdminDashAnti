
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getRules = async (req, res, next) => {
  try { res.status(200).json(await prisma.rewardRule.findMany()); } catch (error) { next(error); }
};
const updateRules = async (req, res, next) => {
  try { 
    // Simplified update logic
    const { rules } = req.body;
    for (const r of rules) {
      await prisma.rewardRule.update({ where: { id: r.id }, data: { points: r.points, label: r.label } });
    }
    res.status(200).json({ success: true }); 
  } catch (error) { next(error); }
};
module.exports = { getRules, updateRules };
