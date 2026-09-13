import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { saveInquiry, getRecentInquiries } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Setup uploads directory for videos
  const uploadsDir = path.resolve(__dirname, 'public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.mp4';
      const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      cb(null, `${cleanName}-${Date.now()}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 300 * 1024 * 1024 }, // 300MB
  });

  // Video Upload Route
  app.post('/api/upload-video', upload.single('video'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided' });
    }

    const target = req.query.target;
    let videoUrl = `/uploads/${req.file.filename}`;

    if (target === 'ppf') {
      const publicPpfPath = path.resolve(__dirname, 'public/assets/videos/ppf-installation-showcase.mp4');
      const distPpfPath = path.resolve(__dirname, 'dist/assets/videos/ppf-installation-showcase.mp4');
      try {
        fs.copyFileSync(req.file.path, publicPpfPath);
        if (fs.existsSync(path.dirname(distPpfPath))) {
          fs.copyFileSync(req.file.path, distPpfPath);
        }
        videoUrl = `/assets/videos/ppf-installation-showcase.mp4?v=${Date.now()}`;
        console.log('Successfully updated PPF showcase video with uploaded file:', req.file.filename);
      } catch (err) {
        console.warn('Failed to overwrite public ppf video file:', err);
      }
    }

    return res.json({
      success: true,
      url: videoUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  });

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'car-editz-api', timestamp: new Date().toISOString() });
  });

  app.post('/api/inquiries', async (req, res) => {
    try {
      const { fullName, phone, vehicle, service, notes } = req.body;
      if (!fullName || !phone || !vehicle || !service) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: fullName, phone, vehicle, and service are required.'
        });
      }

      const result = await saveInquiry({ fullName, phone, vehicle, service, notes });
      return res.status(201).json({
        success: true,
        id: result.id,
        savedToFirebase: result.savedToFirebase,
        message: 'Inquiry received! Our master detailer will reach out within 2 hours.'
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error handling booking inquiry:', message);
      return res.status(500).json({
        success: false,
        error: 'Failed to process inquiry. Please try again or contact us directly.'
      });
    }
  });

  app.get('/api/inquiries', async (_req, res) => {
    try {
      const inquiries = await getRecentInquiries(25);
      return res.json({ success: true, inquiries });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return res.status(500).json({ success: false, error: message });
    }
  });

  // Vite integration
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CAR EDITZ full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
