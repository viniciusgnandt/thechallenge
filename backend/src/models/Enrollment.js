const mongoose = require('mongoose');

// Inscrição de um usuário em um desafio + nível escolhido
const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  level: {
    type: String,
    enum: ['basico', 'intermediario', 'avancado'],
    required: true,
  },
  startDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active',
  },
  completedDays: { type: Number, default: 0 },
  completedAt: { type: Date },
  certificateIssued: { type: Boolean, default: false },
  medalIssued: { type: Boolean, default: false },
}, { timestamps: true });

enrollmentSchema.index({ user: 1, challenge: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
