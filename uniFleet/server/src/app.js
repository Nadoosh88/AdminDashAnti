
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
