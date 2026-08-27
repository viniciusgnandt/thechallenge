const router = require('express').Router();
const Challenge = require('../models/Challenge');
const { protect, requireAdmin } = require('../middleware/auth');

// Lista pública de desafios ativos
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find({ active: true })
      .select('-levels.tasks'); // lista leve, sem os 100 dias
    res.json({ challenges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Detalhe (com tasks) por slug
router.get('/:slug', async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ slug: req.params.slug, active: true });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    res.json({ challenge });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: criar desafio
router.post('/', protect, requireAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.create(req.body);
    res.status(201).json({ challenge });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: atualizar desafio
router.put('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    res.json({ challenge });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: remover (soft delete)
router.delete('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
