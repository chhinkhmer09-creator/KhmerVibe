import express from 'express';
import path from 'path';
import { apiRouter } from './server/apiRouter.ts';

const app = express();
const port = process.env.PORT || 3000;
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const DIST_DIR = path.resolve(process.cwd(), 'dist');

app.use(express.json());
app.use('/api', apiRouter);
app.use('/uploads', express.static(UPLOADS_DIR));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(DIST_DIR));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`KhmerVibe server running on port ${port}`);
});
