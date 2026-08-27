const mongoose = require('mongoose');

// Notificações simples: curtida ou comentário em um post do usuário.
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // quem recebe
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // quem gerou
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  type: { type: String, enum: ['like', 'comment', 'follow'], required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
