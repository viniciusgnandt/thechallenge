const router = require('express').Router();
const Group = require('../models/Group');
const Enrollment = require('../models/Enrollment');
const { protect } = require('../middleware/auth');

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

router.post('/', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    let code;
    for (let i = 0; i < 5; i++) {
      code = genCode();
      if (!(await Group.exists({ code }))) break;
    }

    const group = await Group.create({ name, code, owner: req.user._id, members: [req.user._id] });
    res.status(201).json({ group });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/join', protect, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });

    const group = await Group.findOne({ code: code.toUpperCase() });
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado' });

    if (!group.members.some((m) => String(m) === String(req.user._id))) {
      group.members.push(req.user._id);
      await group.save();
    }
    res.json({ group });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/mine', protect, async (req, res) => {
  const groups = await Group.find({ members: req.user._id }).populate('owner', 'name');
  res.json({ groups });
});

router.post('/:id/leave', protect, async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  group.members = group.members.filter((m) => String(m) !== String(req.user._id));
  await group.save();
  res.json({ ok: true });
});

// Ranking do grupo: soma de dias concluídos em todos os desafios de cada membro
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name avatar city');
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!group.members.some((m) => String(m._id) === String(req.user._id))) {
      return res.status(403).json({ error: 'Você não é membro deste grupo' });
    }

    const ranking = await Promise.all(group.members.map(async (member) => {
      const enrollments = await Enrollment.find({ user: member._id });
      const totalDays = enrollments.reduce((sum, e) => sum + e.completedDays, 0);
      const medals = enrollments.filter((e) => e.medalIssued).length;
      return { user: member, totalDays, medals };
    }));
    ranking.sort((a, b) => b.totalDays - a.totalDays);

    res.json({ group, ranking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
