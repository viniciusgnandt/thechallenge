const mongoose = require('mongoose');

// Um dia do desafio dentro de um nível específico (básico/intermediário/avançado)
const dayTaskSchema = new mongoose.Schema({
  day: { type: Number, required: true }, // 1..durationDays
  title: { type: String, required: true },
  description: { type: String },
  activityType: {
    type: String,
    enum: ['caminhada', 'corrida', 'bike', 'video', 'outro'],
    required: true,
  },
  // Validação automática via Strava (caminhada/corrida/bike)
  validationType: {
    type: String,
    enum: ['strava', 'video_link', 'checkin'],
    required: true,
  },
  // Metas usadas para validar automaticamente via Strava
  targetDistanceKm: { type: Number }, // ex: 3 km
  targetDurationMin: { type: Number },
  restDay: { type: Boolean, default: false },
}, { _id: true });

const levelSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['basico', 'intermediario', 'avancado'],
    required: true,
  },
  label: { type: String, required: true }, // "Básico"
  tasks: [dayTaskSchema],
}, { _id: false });

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String },
  coverImage: { type: String },
  durationDays: { type: Number, default: 100 },
  category: { type: String, default: 'geral' }, // ex: cardio, forca, corrida...
  icon: { type: String, default: 'flame' },
  sponsors: [{
    name: String,
    logo: String,
    url: String,
  }],
  levels: [levelSchema],
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
