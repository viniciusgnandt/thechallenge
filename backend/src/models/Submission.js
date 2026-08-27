const mongoose = require('mongoose');

// Prova de conclusão de um dia do desafio
const submissionSchema = new mongoose.Schema({
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  day: { type: Number, required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, required: true },

  validationType: {
    type: String,
    enum: ['strava', 'video_link', 'checkin'],
    required: true,
  },

  // video_link
  videoUrl: { type: String },

  // strava
  stravaActivityId: { type: String },
  distanceKm: { type: Number },
  durationMin: { type: Number },
  activityType: { type: String },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },
}, { timestamps: true });

submissionSchema.index({ enrollment: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
