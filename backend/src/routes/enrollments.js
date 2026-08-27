const router = require('express').Router();
const Enrollment = require('../models/Enrollment');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const { protect } = require('../middleware/auth');

// Inscrever-se em um desafio + nível (exige assinatura ativa do app)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.subscription?.status !== 'active' && req.user.role !== 'admin') {
      return res.status(402).json({ error: 'Assine o TheChallenge para se inscrever nos desafios', code: 'SUBSCRIPTION_REQUIRED' });
    }

    const { challengeId, level } = req.body;
    if (!challengeId || !level) {
      return res.status(400).json({ error: 'challengeId and level are required' });
    }
    const challenge = await Challenge.findById(challengeId);
    if (!challenge || !challenge.active) return res.status(404).json({ error: 'Challenge not found' });

    const exists = await Enrollment.findOne({ user: req.user._id, challenge: challengeId });
    if (exists) return res.status(409).json({ error: 'Already enrolled in this challenge' });

    const enrollment = await Enrollment.create({
      user: req.user._id,
      challenge: challengeId,
      level,
    });
    res.status(201).json({ enrollment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Minhas inscrições
router.get('/me', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id }).populate('challenge', 'title slug coverImage durationDays');
    res.json({ enrollments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Progresso detalhado de uma inscrição: tasks do nível + status de cada dia
router.get('/:id/progress', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id).populate('challenge');
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    if (String(enrollment.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const levelData = enrollment.challenge.levels.find((l) => l.name === enrollment.level);
    const submissions = await Submission.find({ enrollment: enrollment._id });
    const subByDay = new Map(submissions.map((s) => [s.day, s]));

    const days = (levelData?.tasks || []).sort((a, b) => a.day - b.day).map((task) => ({
      task,
      submission: subByDay.get(task.day) || null,
    }));

    res.json({ enrollment, days });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
