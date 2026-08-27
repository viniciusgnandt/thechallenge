const router = require('express').Router();
const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const Post = require('../models/Post');
const { protect, requireAdmin } = require('../middleware/auth');

async function createCheckinPost(submission, enrollment) {
  const exists = await Post.exists({ enrollment: enrollment._id, day: submission.day, type: 'checkin' });
  if (exists) return;
  await Post.create({
    user: submission.user,
    challenge: submission.challenge,
    enrollment: enrollment._id,
    day: submission.day,
    type: 'checkin',
    text: `Concluiu o dia ${submission.day} do ${enrollment.challenge?.title || 'desafio'}!`,
    videoUrl: submission.videoUrl,
  });
}

async function recalcCompletion(enrollmentId) {
  const enrollment = await Enrollment.findById(enrollmentId).populate('challenge');
  if (!enrollment) return;
  const levelData = enrollment.challenge.levels.find((l) => l.name === enrollment.level);
  const totalDays = levelData?.tasks?.length || enrollment.challenge.durationDays;

  const approvedCount = await Submission.countDocuments({ enrollment: enrollmentId, status: 'approved' });
  enrollment.completedDays = approvedCount;

  const wasCompleted = enrollment.status === 'completed';
  if (approvedCount >= totalDays && !wasCompleted) {
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
    enrollment.medalIssued = true;
    enrollment.certificateIssued = true;
    await Post.create({
      user: enrollment.user,
      challenge: enrollment.challenge._id,
      enrollment: enrollment._id,
      type: 'medal',
      text: `Concluiu o ${enrollment.challenge.title} (nível ${enrollment.level})! 🏅`,
    });
  }
  await enrollment.save();
  return enrollment;
}

// Enviar prova de um dia (video_link ou checkin manual). Strava é sincronizado por outra rota.
router.post('/', protect, async (req, res) => {
  try {
    const { enrollmentId, day, videoUrl } = req.body;
    if (!enrollmentId || !day) return res.status(400).json({ error: 'enrollmentId and day are required' });

    const enrollment = await Enrollment.findById(enrollmentId).populate('challenge');
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    if (String(enrollment.user) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });

    const levelData = enrollment.challenge.levels.find((l) => l.name === enrollment.level);
    const task = levelData?.tasks?.find((t) => t.day === Number(day));
    if (!task) return res.status(404).json({ error: 'Task not found for this day' });

    if (task.validationType === 'strava') {
      return res.status(400).json({ error: 'Este dia é validado automaticamente via Strava' });
    }

    const payload = {
      enrollment: enrollment._id,
      user: req.user._id,
      challenge: enrollment.challenge._id,
      day: Number(day),
      taskId: task._id,
      validationType: task.validationType,
      status: task.validationType === 'checkin' ? 'approved' : 'pending', // check-in por honestidade aprova direto
    };
    if (task.validationType === 'video_link') {
      if (!videoUrl) return res.status(400).json({ error: 'videoUrl is required' });
      payload.videoUrl = videoUrl;
    }
    if (payload.status === 'approved') {
      payload.reviewedAt = new Date();
    }

    const submission = await Submission.findOneAndUpdate(
      { enrollment: enrollment._id, day: Number(day) },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (submission.status === 'approved') await createCheckinPost(submission, enrollment);
    await recalcCompletion(enrollment._id);

    res.status(201).json({ submission });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Minhas submissões pendentes/aprovadas de uma inscrição
router.get('/', protect, async (req, res) => {
  try {
    const { enrollmentId } = req.query;
    const filter = { user: req.user._id };
    if (enrollmentId) filter.enrollment = enrollmentId;
    const submissions = await Submission.find(filter).sort({ day: 1 });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: fila de moderação (vídeos pendentes)
router.get('/pending', protect, requireAdmin, async (req, res) => {
  try {
    const submissions = await Submission.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('challenge', 'title')
      .sort({ createdAt: 1 });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: aprovar/rejeitar
router.patch('/:id/review', protect, requireAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved or rejected' });
    }
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    if (status === 'approved') {
      const enrollment = await Enrollment.findById(submission.enrollment).populate('challenge');
      await createCheckinPost(submission, enrollment);
    }
    await recalcCompletion(submission.enrollment);

    res.json({ submission });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
module.exports.recalcCompletion = recalcCompletion;
module.exports.createCheckinPost = createCheckinPost;
