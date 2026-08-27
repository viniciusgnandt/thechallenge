const router = require('express').Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const Block = require('../models/Block');
const User = require('../models/User');
const { sendPush } = require('../utils/push');
const { protect } = require('../middleware/auth');

// Feed geral (mais recentes primeiro) — some posts de quem eu bloqueei
router.get('/', protect, async (req, res) => {
  try {
    const { cursor, userId } = req.query;
    const filter = {};
    if (userId) filter.user = userId;
    if (cursor) filter.createdAt = { $lt: new Date(cursor) };

    if (!userId) {
      const blocked = await Block.find({ blocker: req.user._id }).select('blocked');
      if (blocked.length) filter.user = { $nin: blocked.map((b) => b.blocked) };
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name avatar city')
      .populate('challenge', 'title slug');

    const withLiked = posts.map((p) => ({
      ...p.toObject(),
      likesCount: p.likes.length,
      liked: p.likes.some((id) => String(id) === String(req.user._id)),
      likes: undefined,
    }));

    res.json({ posts: withLiked, nextCursor: posts.length === 20 ? posts[posts.length - 1].createdAt.toISOString() : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name avatar city').populate('challenge', 'title slug');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({
      post: {
        ...post.toObject(),
        likesCount: post.likes.length,
        liked: post.likes.some((id) => String(id) === String(req.user._id)),
        likes: undefined,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar post livre (texto + foto/vídeo opcional)
router.post('/', protect, async (req, res) => {
  try {
    const { text, imageUrl, videoUrl } = req.body;
    if (!text && !imageUrl && !videoUrl) return res.status(400).json({ error: 'Escreva algo ou anexe uma mídia' });

    const post = await Post.create({ user: req.user._id, text, imageUrl, videoUrl, type: 'free' });
    await post.populate('user', 'name avatar city');
    res.status(201).json({ post: { ...post.toObject(), likesCount: 0, liked: false, likes: undefined } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (String(post.user) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
  await post.deleteOne();
  await Comment.deleteMany({ post: post._id });
  res.json({ ok: true });
});

// Curtir / descurtir
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const already = post.likes.some((id) => String(id) === String(req.user._id));
    if (already) {
      post.likes = post.likes.filter((id) => String(id) !== String(req.user._id));
    } else {
      post.likes.push(req.user._id);
      if (String(post.user) !== String(req.user._id)) {
        await Notification.create({ user: post.user, fromUser: req.user._id, post: post._id, type: 'like' });
        const owner = await User.findById(post.user);
        sendPush(owner, { title: 'Nova curtida', body: `${req.user.name} curtiu sua publicação`, data: { postId: String(post._id) } });
      }
    }
    await post.save();
    res.json({ liked: !already, likesCount: post.likes.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Denunciar um post
router.post('/:id/report', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason is required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await Report.create({ reporter: req.user._id, targetType: 'post', post: post._id, reportedUser: post.user, reason });
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Comentários
router.get('/:id/comments', protect, async (req, res) => {
  const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: 1 }).populate('user', 'name avatar');
  res.json({ comments });
});

router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await Comment.create({ post: post._id, user: req.user._id, text });
    await comment.populate('user', 'name avatar');
    post.commentsCount += 1;
    await post.save();

    if (String(post.user) !== String(req.user._id)) {
      await Notification.create({ user: post.user, fromUser: req.user._id, post: post._id, type: 'comment' });
      const owner = await User.findById(post.user);
      sendPush(owner, { title: 'Novo comentário', body: `${req.user.name}: ${text.slice(0, 80)}`, data: { postId: String(post._id) } });
    }

    res.status(201).json({ comment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
