require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const challengeRoutes = require('./routes/challenges');
const enrollmentRoutes = require('./routes/enrollments');
const submissionRoutes = require('./routes/submissions');
const stravaRoutes = require('./routes/strava');
const uploadRoutes = require('./routes/upload');
const rankingRoutes = require('./routes/rankings');
const adminRoutes = require('./routes/admin');
const postRoutes = require('./routes/posts');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const subscriptionRoutes = require('./routes/subscription');
const groupRoutes = require('./routes/groups');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowed = [
      process.env.FRONTEND_URL || 'http://localhost:5174',
      'https://thechallenge.viniciusgnandt.com.br',
      'https://apitest-thechallenge.viniciusgnandt.com.br',
      'http://localhost:4174',
      'http://localhost:8081',
      'http://localhost:8082',
    ];

    if (
      allowed.includes(origin) ||
      origin.startsWith('exp://') ||
      origin.startsWith('exp+') ||
      origin.startsWith('https://u.expo.dev') ||
      origin.startsWith('https://expo.dev') ||
      origin.startsWith('https://expo.io')
    ) return callback(null, true);

    console.warn('CORS bloqueado para origem:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Muitas tentativas. Tente novamente mais tarde.' } });
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/strava', stravaRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/groups', groupRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'thechallenge-backend' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thechallenge');
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 TheChallenge API running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
