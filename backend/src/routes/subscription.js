const router = require('express').Router();
const User = require('../models/User');
const plan = require('../config/plan');
const { protect, requireAdmin } = require('../middleware/auth');

// Plano único do app (público, para tela de assinatura)
router.get('/plan', (req, res) => {
  res.json({ plan });
});

// Status da assinatura do usuário logado
router.get('/me', protect, async (req, res) => {
  res.json({ subscription: req.user.subscription || { status: 'inactive' } });
});

// Admin: ativar/desativar assinatura de um usuário (após confirmar Pix manualmente)
router.patch('/users/:id', protect, requireAdmin, async (req, res) => {
  try {
    const { status, plan: chosenPlan } = req.body;
    if (!['active', 'inactive'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const update = {
      'subscription.status': status,
      'subscription.plan': chosenPlan,
      'subscription.activatedBy': req.user._id,
    };
    if (status === 'active') update['subscription.activatedAt'] = new Date();

    const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: listar assinantes/pendentes
router.get('/users', protect, requireAdmin, async (req, res) => {
  const users = await User.find().select('name email subscription createdAt').sort({ createdAt: -1 });
  res.json({ users });
});

module.exports = router;
