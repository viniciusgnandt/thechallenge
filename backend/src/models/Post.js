const mongoose = require('mongoose');

// Item do feed social: gerado automaticamente ao concluir um dia/desafio,
// ou criado livremente pelo usuário (texto + foto/vídeo opcional).
const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },
  day: { type: Number },
  type: {
    type: String,
    enum: ['checkin', 'medal', 'free'],
    default: 'free',
  },
  text: { type: String, maxlength: 500 },
  imageUrl: { type: String },
  videoUrl: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true });

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
