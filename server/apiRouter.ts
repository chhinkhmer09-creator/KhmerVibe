import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const apiRouter = express.Router();

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');
const THUMBNAILS_DIR = path.join(UPLOADS_DIR, 'thumbnails');
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure upload and data directories exist
[UPLOADS_DIR, VIDEOS_DIR, THUMBNAILS_DIR, DATA_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Setup multer storage
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, VIDEOS_DIR);
    } else {
      cb(null, THUMBNAILS_DIR);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `${cleanName}_${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB limit for up to 10-minute HD/4K videos
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska', 'video/avi', 'video/x-msvideo'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|mov|ogg|mkv|avi)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Allowed formats: MP4, MOV, WebM, AVI, MKV.'));
    }
  },
});

// Video upload endpoint
apiRouter.post('/upload/video', upload.single('video'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No video file uploaded or file rejected.' });
    return;
  }

  const filename = req.file.filename;
  const playbackUrl = `/api/stream/videos/${filename}`;
  const storagePath = `videos/${filename}`;

  res.json({
    success: true,
    playbackUrl,
    storagePath,
    size: req.file.size,
    mimeType: req.file.mimetype,
  });
});

// Stream video endpoint with Range request support (HTTP 206)
apiRouter.get('/stream/videos/:filename', (req: Request, res: Response) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(VIDEOS_DIR, safeFilename);
  handleVideoStream(req, res, filePath);
});

apiRouter.get('/videos/:filename', (req: Request, res: Response) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(VIDEOS_DIR, safeFilename);
  handleVideoStream(req, res, filePath);
});

// Stream video with HTTP Range requests (crucial for HTML5 video seeking)
export function handleVideoStream(req: Request, res: Response, filePath: string) {
  if (!fs.existsSync(filePath)) {
    res.status(404).send('Video not found');
    return;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send(`Requested range not satisfiable\n${start} >= ${fileSize}`);
      return;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
}
