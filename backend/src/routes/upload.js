const router = require('express').Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB (vídeos curtos de treino)
  fileFilter: (req, file, cb) => {
    if (![...IMAGE_TYPES, ...VIDEO_TYPES].includes(file.mimetype)) {
      return cb(new Error('Formato não suportado'));
    }
    cb(null, true);
  },
});

async function uploadToOCI(file) {
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

  const client = new S3Client({
    region: process.env.OCI_REGION || 'sa-saopaulo-1',
    endpoint: `https://${process.env.OCI_NAMESPACE}.compat.objectstorage.${process.env.OCI_REGION}.oraclecloud.com`,
    credentials: {
      accessKeyId: process.env.OCI_ACCESS_KEY_ID,
      secretAccessKey: process.env.OCI_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  const fileName = `thechallenge/${uuidv4()}${path.extname(file.originalname)}`;
  await client.send(new PutObjectCommand({
    Bucket: process.env.OCI_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  }));

  return `https://objectstorage.${process.env.OCI_REGION}.oraclecloud.com/n/${process.env.OCI_NAMESPACE}/b/${process.env.OCI_BUCKET_NAME}/o/${fileName}`;
}

function uploadLocally(file, req) {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
  fs.writeFileSync(path.join(uploadsDir, fileName), file.buffer);
  return `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
}

// POST /api/upload/image (avatar, foto de post)
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    if (!IMAGE_TYPES.includes(req.file.mimetype)) return res.status(400).json({ error: 'Envie uma imagem JPEG, PNG ou WebP' });

    const hasOCI = process.env.OCI_ACCESS_KEY_ID && process.env.OCI_BUCKET_NAME;
    const url = hasOCI ? await uploadToOCI(req.file) : uploadLocally(req.file, req);
    res.json({ url });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/upload/video (vídeo de prova de treino)
router.post('/video', protect, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    if (!VIDEO_TYPES.includes(req.file.mimetype)) return res.status(400).json({ error: 'Envie um vídeo MP4, MOV ou WebM' });

    const hasOCI = process.env.OCI_ACCESS_KEY_ID && process.env.OCI_BUCKET_NAME;
    const url = hasOCI ? await uploadToOCI(req.file) : uploadLocally(req.file, req);
    res.json({ url });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
