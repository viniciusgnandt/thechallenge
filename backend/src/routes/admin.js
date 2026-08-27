const router = require('express').Router();
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Challenge = require('../models/Challenge');
const Report = require('../models/Report');
const Post = require('../models/Post');
const { protect, requireAdmin } = require('../middleware/auth');

router.use(protect, requireAdmin);

// Dashboard resumido
router.get('/stats', async (req, res) => {
  const [totalUsers, totalEnrollments, activeChallenges, completed, activeSubscribers] = await Promise.all([
    User.countDocuments(),
    Enrollment.countDocuments(),
    Challenge.countDocuments({ active: true }),
    Enrollment.countDocuments({ status: 'completed' }),
    User.countDocuments({ 'subscription.status': 'active' }),
  ]);
  res.json({ totalUsers, totalEnrollments, activeChallenges, completed, activeSubscribers });
});

// Listar inscrições de um desafio (para acompanhamento/moderação)
router.get('/challenges/:id/enrollments', async (req, res) => {
  const enrollments = await Enrollment.find({ challenge: req.params.id })
    .populate('user', 'name email');
  res.json({ enrollments });
});

// Promover usuário a admin
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['athlete', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Denúncias pendentes
router.get('/reports', async (req, res) => {
  const reports = await Report.find({ status: 'pending' })
    .populate('reporter', 'name')
    .populate('reportedUser', 'name email')
    .populate('post', 'text')
    .sort({ createdAt: -1 });
  res.json({ reports });
});

router.patch('/reports/:id/resolve', async (req, res) => {
  const { deletePost } = req.body;
  const report = await Report.findByIdAndUpdate(req.params.id, { status: 'reviewed' }, { new: true });
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (deletePost && report.post) await Post.findByIdAndDelete(report.post);
  res.json({ report });
});

module.exports = router;
