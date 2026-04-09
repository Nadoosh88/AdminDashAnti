
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res, next) => {
  try { 
    const alerts = await prisma.emergencyAlert.findMany({ 
      include: { bus: true, student: true },
      orderBy: { createdAt: 'desc' }
    });

    // Sort: active first, then resolved
    alerts.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    const today = new Date().toDateString();
    const activeCount = alerts.filter(a => a.status === 'active').length;
    const resolvedToday = alerts.filter(a => a.status === 'resolved' && a.resolvedAt && new Date(a.resolvedAt).toDateString() === today).length;
    
    let totalTime = 0;
    let resolvedCount = 0;
    alerts.forEach(a => {
      if (a.status === 'resolved' && a.resolvedAt) {
        const diff = Math.abs(new Date(a.resolvedAt) - new Date(a.createdAt));
        totalTime += diff;
        resolvedCount++;
      }
    });
    const avgResponseTime = resolvedCount > 0 ? Math.round(totalTime / resolvedCount / 60000) : 0;

    res.status(200).json({ alerts, stats: { activeCount, resolvedToday, avgResponseTime } }); 
  } catch (error) { next(error); }
};
const resolveAlert = async (req, res, next) => {
  try { res.status(200).json(await prisma.emergencyAlert.update({ where: { id: req.params.id }, data: { status: 'resolved', resolvedAt: new Date() } })); } catch (error) { next(error); }
};
module.exports = { getAll, resolveAlert };
