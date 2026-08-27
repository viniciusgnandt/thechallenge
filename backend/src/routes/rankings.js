const router = require('express').Router();
const Enrollment = require('../models/Enrollment');

// Ranking geral por desafio: quem completou mais dias primeiro
router.get('/:challengeId', async (req, res) => {
  try {
    const { level } = req.query;
    const filter = { challenge: req.params.challengeId };
    if (level) filter.level = level;

    const enrollments = await Enrollment.find(filter)
      .populate('user', 'name avatar city')
      .sort({ completedDays: -1, completedAt: 1, updatedAt: 1 })
      .limit(100);

    res.json({ ranking: enrollments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
