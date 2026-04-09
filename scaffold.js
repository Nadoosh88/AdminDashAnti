const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'uniFleet/server');

const dirs = [
  'src',
  'src/routes',
  'src/controllers',
  'src/middleware',
  'src/schemas',
  'src/sockets',
  'src/utils',
];

dirs.forEach(d => {
  const p = path.join(root, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Middleware
fs.writeFileSync(path.join(root, 'src/middleware/error.middleware.js'), `
const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';
  res.status(status).json({ status, message });
};
module.exports = { errorMiddleware };
`);

fs.writeFileSync(path.join(root, 'src/middleware/validate.middleware.js'), `
const validateMiddleware = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};
module.exports = { validateMiddleware };
`);

fs.writeFileSync(path.join(root, 'src/middleware/auth.middleware.js'), `
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authMiddleware };
`);

// Utils
fs.writeFileSync(path.join(root, 'src/sockets/socketHandler.js'), `
const { Server } = require('socket.io');

const initSocket = (server) => {
  const io = new Server(server, { cors: { origin: '*', credentials: true } });
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
  });
  return io;
};
module.exports = { initSocket };
`);

// Auth
fs.writeFileSync(path.join(root, 'src/routes/auth.routes.js'), `
const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
router.post('/login', controller.login);
module.exports = router;
`);
fs.writeFileSync(path.join(root, 'src/controllers/auth.controller.js'), `
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.status(200).json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) { next(error); }
};
module.exports = { login };
`);

// Dashboard
fs.writeFileSync(path.join(root, 'src/routes/dashboard.routes.js'), `
const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.get('/stats', authMiddleware, controller.getStats);
module.exports = router;
`);
fs.writeFileSync(path.join(root, 'src/controllers/dashboard.controller.js'), `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getStats = async (req, res, next) => {
  try {
    const [buses, drivers, students, trips] = await Promise.all([
      prisma.bus.count(), prisma.driver.count(), prisma.student.count(), prisma.trip.count()
    ]);
    res.status(200).json({ buses, drivers, students, trips });
  } catch (error) { next(error); }
};
module.exports = { getStats };
`);

// Buses
fs.writeFileSync(path.join(root, 'src/routes/buses.routes.js'), `
const express = require('express');
const router = express.Router();
const controller = require('../controllers/buses.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/', controller.getAll);
router.get('/locations', controller.getLocations);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
module.exports = router;
`);
fs.writeFileSync(path.join(root, 'src/controllers/buses.controller.js'), `
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
`);

// Routes Resource
fs.writeFileSync(path.join(root, 'src/routes/routes.routes.js'), `
const express = require('express');
const router = express.Router();
const controller = require('../controllers/routes.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
module.exports = router;
`);
fs.writeFileSync(path.join(root, 'src/controllers/routes.controller.js'), `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res, next) => {
  try { res.status(200).json(await prisma.route.findMany({ include: { stops: true } })); } catch (error) { next(error); }
};
const create = async (req, res, next) => {
  try { res.status(201).json(await prisma.route.create({ data: req.body })); } catch (error) { next(error); }
};
const update = async (req, res, next) => {
  try { res.status(200).json(await prisma.route.update({ where: { id: req.params.id }, data: req.body })); } catch (error) { next(error); }
};
const remove = async (req, res, next) => {
  try { await prisma.route.delete({ where: { id: req.params.id } }); res.status(204).send(); } catch (error) { next(error); }
};
module.exports = { getAll, create, update, remove };
`);

// Drivers
fs.writeFileSync(path.join(root, 'src/routes/drivers.routes.js'), `
const express = require('express');
const router = express.Router();
const controller = require('../controllers/drivers.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
module.exports = router;
`);
fs.writeFileSync(path.join(root, 'src/controllers/drivers.controller.js'), `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res, next) => {
  try { res.status(200).json(await prisma.driver.findMany({ include: { bus: true } })); } catch (error) { next(error); }
};
const create = async (req, res, next) => {
  try { res.status(201).json(await prisma.driver.create({ data: req.body })); } catch (error) { next(error); }
};
const update = async (req, res, next) => {
  try { res.status(200).json(await prisma.driver.update({ where: { id: req.params.id }, data: req.body })); } catch (error) { next(error); }
};
const remove = async (req, res, next) => {
  try { await prisma.driver.delete({ where: { id: req.params.id } }); res.status(204).send(); } catch (error) { next(error); }
};
module.exports = { getAll, create, update, remove };
`);

// Students
fs.writeFileSync(path.join(root, 'src/routes/students.routes.js'), `
const express = require('express');
const router = express.Router();
const controller = require('../controllers/students.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/', controller.getAll);
router.post('/:id/blacklist', controller.blacklist);
router.delete('/:id/blacklist', controller.liftBlacklist);
module.exports = router;
`);
fs.writeFileSync(path.join(root, 'src/controllers/students.controller.js'), `
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
module.exports = { getAll, blacklist, liftBlacklist };
`);

// Trips
fs.writeFileSync(path.join(root, 'src/routes/trips.routes.js'), `
const express = require('express');
const router = express.Router();
const controller = require('../controllers/trips.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
module.exports = router;
`);
fs.writeFileSync(path.join(root, 'src/controllers/trips.controller.js'), `
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
module.exports = { getAll, create, update };
`);

// Parcels
fs.writeFileSync(path.join(root, 'src/routes/parcels.routes.js'), `
const express = require('express');
const router = express.Router();
const controller = require('../controllers/parcels.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/', controller.getAll);
router.patch('/:id/status', controller.updateStatus);
module.exports = router;
`);
fs.writeFileSync(path.join(root, 'src/controllers/parcels.controller.js'), `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res, next) => {
  try { res.status(200).json(await prisma.parcel.findMany({ include: { trip: true } })); } catch (error) { next(error); }
};
const updateStatus = async (req, res, next) => {
  try { res.status(200).json(await prisma.parcel.update({ where: { id: req.params.id }, data: { status: req.body.status } })); } catch (error) { next(error); }
};
module.exports = { getAll, updateStatus };
`);

// Ratings
fs.writeFileSync(path.join(root, 'src/routes/ratings.routes.js'), `
const express = require('express');
const router = express.Router();
const controller = require('../controllers/ratings.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/analytics', controller.getAnalytics);
router.get('/comments', controller.getComments);
module.exports = router;
`);
fs.writeFileSync(path.join(root, 'src/controllers/ratings.controller.js'), `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAnalytics = async (req, res, next) => {
  try { 
    // Basic aggregation
    const averages = await prisma.rating.groupBy({ by: ['category'], _avg: { score: true } });
    res.status(200).json(averages); 
  } catch (error) { next(error); }
};
const getComments = async (req, res, next) => {
  try { res.status(200).json(await prisma.rating.findMany({ where: { comment: { not: null } }, include: { driver: true } })); } catch (error) { next(error); }
};
module.exports = { getAnalytics, getComments };
`);

// Alerts
fs.writeFileSync(path.join(root, 'src/routes/alerts.routes.js'), `
const express = require('express');
const router = express.Router();
const controller = require('../controllers/alerts.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/', controller.getAll);
router.patch('/:id/resolve', controller.resolveAlert);
module.exports = router;
`);
fs.writeFileSync(path.join(root, 'src/controllers/alerts.controller.js'), `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res, next) => {
  try { res.status(200).json(await prisma.emergencyAlert.findMany({ include: { bus: true, student: true } })); } catch (error) { next(error); }
};
const resolveAlert = async (req, res, next) => {
  try { res.status(200).json(await prisma.emergencyAlert.update({ where: { id: req.params.id }, data: { status: 'resolved', resolvedAt: new Date() } })); } catch (error) { next(error); }
};
module.exports = { getAll, resolveAlert };
`);

// Rewards
fs.writeFileSync(path.join(root, 'src/routes/rewards.routes.js'), `
const express = require('express');
const router = express.Router();
const controller = require('../controllers/rewards.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/rules', controller.getRules);
router.put('/rules', controller.updateRules);
module.exports = router;
`);
fs.writeFileSync(path.join(root, 'src/controllers/rewards.controller.js'), `
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
`);

// App.js
fs.writeFileSync(path.join(root, 'src/app.js'), `
const express = require('express');
const cors = require('cors');
const { errorMiddleware } = require('./middleware/error.middleware');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Mount all route files
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/buses',     require('./routes/buses.routes'));
app.use('/api/routes',    require('./routes/routes.routes'));
app.use('/api/drivers',   require('./routes/drivers.routes'));
app.use('/api/students',  require('./routes/students.routes'));
app.use('/api/trips',     require('./routes/trips.routes'));
app.use('/api/parcels',   require('./routes/parcels.routes'));
app.use('/api/ratings',   require('./routes/ratings.routes'));
app.use('/api/alerts',    require('./routes/alerts.routes'));
app.use('/api/rewards',   require('./routes/rewards.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.use(errorMiddleware);
module.exports = app;
`);

// Server.js
fs.writeFileSync(path.join(root, 'server.js'), `
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/sockets/socketHandler');
require('dotenv').config();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(\`✅ UniFleet server running on http://localhost:\${PORT}\`);
});
`);

console.log('Scaffolding complete!');
