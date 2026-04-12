
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

const createManual = async (req, res, next) => {
  try {
    const { universityId, name, email, reason } = req.body;
    
    // Check if ID or Email already exists to avoid unique constraint error
    // but better yet, let's use a logic that blacklists them if they exist
    const student = await prisma.student.upsert({
      where: { universityId: universityId },
      update: {
        status: 'blacklisted',
        blacklistedReason: reason,
        blacklistedUntil: null
      },
      create: {
        universityId,
        name,
        email,
        status: 'blacklisted',
        blacklistedReason: reason,
        blacklistedUntil: null
      }
    });
    
    res.status(201).json(student);
  } catch (error) {
    console.error("Manual Blacklist Error:", error);
    next(error);
  }
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

const removeStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.$transaction([
      prisma.studentPoints.deleteMany({ where: { studentId: id } }),
      prisma.emergencyAlert.deleteMany({ where: { studentId: id } }),
      prisma.rating.deleteMany({ where: { studentId: id } }),
      prisma.student.delete({ where: { id: id } })
    ]);
    res.status(200).json({ message: 'Student record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getLeaderboard, blacklist, liftBlacklist, createManual, removeStudent };
