const router = require('express').Router();
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Follow = require('../models/Follow');
const Block = require('../models/Block');
const Report = require('../models/Report');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { sendPush } = require('../utils/push');
const { protect } = require('../middleware/auth');

// Conta dias consecutivos (até hoje ou ontem) com pelo menos um checkin aprovado
async function computeStreak(userId) {
  const posts = await Post.find({ user: userId, type: { $in: ['checkin', 'medal'] } })
    .select('createdAt')
    .sort({ createdAt: -1 })
    .limit(400);
  if (posts.length === 0) return 0;

  const days = new Set(posts.map((p) => new Date(p.createdAt).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1); // permite streak "até ontem" sem quebrar hoje de manhã
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Buscar usuários por nome (para a tela de busca)
router.get('/search', protect, async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ users: [] });
  const users = await User.find({ name: { $regex: q, $options: 'i' } })
    .select('name avatar city')
    .limit(20);
  res.json({ users });
});

// Perfil público
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar city createdAt');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const enrollments = await Enrollment.find({ user: user._id }).populate('challenge', 'title slug durationDays');
    const medals = enrollments.filter((e) => e.medalIssued);
    const totalDays = enrollments.reduce((sum, e) => sum + e.completedDays, 0);

    const [followers, following, isFollowing, isBlocked, streak] = await Promise.all([
      Follow.countDocuments({ following: user._id }),
      Follow.countDocuments({ follower: user._id }),
      Follow.exists({ follower: req.user._id, following: user._id }),
      Block.exists({ blocker: req.user._id, blocked: user._id }),
      computeStreak(user._id),
    ]);

    res.json({
      user,
      stats: { totalDays, medals: medals.length, challenges: enrollments.length, followers, following, streak },
      medals,
      isFollowing: !!isFollowing,
      isBlocked: !!isBlocked,
      isMe: String(user._id) === String(req.user._id),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/me/push-token', protect, async (req, res) => {
  const { token } = req.body;
  await User.findByIdAndUpdate(req.user._id, { pushToken: token || undefined });
  res.json({ ok: true });
});

router.post('/:id/follow', protect, async (req, res) => {
  if (req.params.id === String(req.user._id)) return res.status(400).json({ error: 'Você não pode seguir a si mesmo' });
  const existing = await Follow.findOne({ follower: req.user._id, following: req.params.id });
  if (existing) {
    await existing.deleteOne();
    return res.json({ following: false });
  }
  await Follow.create({ follower: req.user._id, following: req.params.id });
  await Notification.create({ user: req.params.id, fromUser: req.user._id, type: 'follow' });
  const target = await User.findById(req.params.id);
  sendPush(target, { title: 'Novo seguidor', body: `${req.user.name} começou a te seguir` });
  res.json({ following: true });
});

router.post('/:id/block', protect, async (req, res) => {
  if (req.params.id === String(req.user._id)) return res.status(400).json({ error: 'Você não pode bloquear a si mesmo' });
  const existing = await Block.findOne({ blocker: req.user._id, blocked: req.params.id });
  if (existing) {
    await existing.deleteOne();
    return res.json({ blocked: false });
  }
  await Block.create({ blocker: req.user._id, blocked: req.params.id });
  await Follow.deleteMany({ $or: [
    { follower: req.user._id, following: req.params.id },
    { follower: req.params.id, following: req.user._id },
  ] });
  res.json({ blocked: true });
});

router.post('/:id/report', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason is required' });
    await Report.create({ reporter: req.user._id, targetType: 'user', reportedUser: req.params.id, reason });
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
