const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['athlete', 'admin'],
    default: 'athlete',
  },
  avatar: { type: String },
  city: { type: String },
  pushToken: { type: String },

  // Assinatura única do app (dá acesso a todos os desafios). Ativada manualmente
  // pelo admin após confirmação do pagamento (Pix à vista ou 3x fora do app).
  subscription: {
    status: { type: String, enum: ['inactive', 'active'], default: 'inactive' },
    plan: { type: String, enum: ['avista', 'parcelado'] },
    activatedAt: { type: Date },
    activatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },

  // Strava integration
  strava: {
    athleteId: { type: String },
    accessToken: { type: String, select: false },
    refreshToken: { type: String, select: false },
    expiresAt: { type: Number },
    connectedAt: { type: Date },
  },

  refreshTokens: [{ type: String, select: false }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  if (obj.strava) {
    delete obj.strava.accessToken;
    delete obj.strava.refreshToken;
  }
  return obj;
};

module.exports = mongoose.model('User', userSchema);
