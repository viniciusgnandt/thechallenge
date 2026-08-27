const router = require('express').Router();
const axios = require('axios');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');
const { protect } = require('../middleware/auth');
const { recalcCompletion, createCheckinPost } = require('./submissions');

// Passo 1: gera a URL de autorização Strava para o usuário logado
router.get('/connect-url', protect, (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    redirect_uri: process.env.STRAVA_REDIRECT_URI,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'activity:read_all',
    state: String(req.user._id),
  });
  res.json({ url: `https://www.strava.com/oauth/authorize?${params.toString()}` });
});

// Passo 2: callback do Strava (recebe "code" e "state"=userId)
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send('Missing code/state');

    const tokenRes = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, expires_at, athlete } = tokenRes.data;

    await User.findByIdAndUpdate(state, {
      strava: {
        athleteId: String(athlete.id),
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_at,
        connectedAt: new Date(),
      },
    });

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/perfil?strava=connected`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/perfil?strava=error`);
  }
});

router.post('/disconnect', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { strava: 1 } });
  res.json({ ok: true });
});

async function ensureFreshToken(user) {
  const full = await User.findById(user._id).select('+strava.accessToken +strava.refreshToken');
  if (!full.strava?.refreshToken) throw new Error('Strava not connected');

  if (full.strava.expiresAt && full.strava.expiresAt * 1000 > Date.now() + 60000) {
    return full.strava.accessToken;
  }

  const tokenRes = await axios.post('https://www.strava.com/oauth/token', {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: full.strava.refreshToken,
  });
  const { access_token, refresh_token, expires_at } = tokenRes.data;
  full.strava.accessToken = access_token;
  full.strava.refreshToken = refresh_token;
  full.strava.expiresAt = expires_at;
  await full.save();
  return access_token;
}

const STRAVA_TYPE_MAP = {
  Walk: 'caminhada',
  Hike: 'caminhada',
  Run: 'corrida',
  Ride: 'bike',
  VirtualRide: 'bike',
};

// Sincroniza atividades recentes do Strava e valida automaticamente o dia pendente correspondente
router.post('/sync/:enrollmentId', protect, async (req, res) => {
  try {
    const accessToken = await ensureFreshToken(req.user);

    const enrollment = await Enrollment.findById(req.params.enrollmentId).populate('challenge');
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    if (String(enrollment.user) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });

    const levelData = enrollment.challenge.levels.find((l) => l.name === enrollment.level);
    const stravaTasks = (levelData?.tasks || []).filter((t) => t.validationType === 'strava');

    const existingSubs = await Submission.find({ enrollment: enrollment._id });
    const doneDays = new Set(existingSubs.filter((s) => s.status === 'approved').map((s) => s.day));
    const pendingTasks = stravaTasks.filter((t) => !doneDays.has(t.day)).sort((a, b) => a.day - b.day);
    if (pendingTasks.length === 0) return res.json({ matched: [] });

    const activitiesRes = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { per_page: 30 },
    });

    const activities = activitiesRes.data
      .filter((a) => STRAVA_TYPE_MAP[a.type])
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    const usedActivityIds = new Set(existingSubs.map((s) => s.stravaActivityId).filter(Boolean));
    const matched = [];

    for (const task of pendingTasks) {
      const activityType = STRAVA_TYPE_MAP;
      const candidate = activities.find((a) => {
        if (usedActivityIds.has(String(a.id))) return false;
        if (STRAVA_TYPE_MAP[a.type] !== task.activityType) return false;
        const distanceKm = a.distance / 1000;
        const durationMin = a.moving_time / 60;
        if (task.targetDistanceKm && distanceKm < task.targetDistanceKm * 0.9) return false;
        if (task.targetDurationMin && durationMin < task.targetDurationMin * 0.9) return false;
        return true;
      });
      if (!candidate) continue;

      usedActivityIds.add(String(candidate.id));
      const submission = await Submission.findOneAndUpdate(
        { enrollment: enrollment._id, day: task.day },
        {
          $set: {
            user: req.user._id,
            challenge: enrollment.challenge._id,
            taskId: task._id,
            validationType: 'strava',
            stravaActivityId: String(candidate.id),
            distanceKm: candidate.distance / 1000,
            durationMin: candidate.moving_time / 60,
            activityType: task.activityType,
            status: 'approved',
            reviewedAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      matched.push(submission);
      await createCheckinPost(submission, enrollment);
    }

    if (matched.length) await recalcCompletion(enrollment._id);

    res.json({ matched });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(400).json({ error: err.response?.data?.message || err.message });
  }
});

module.exports = router;
