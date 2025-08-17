// src/index.ts
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';

// Routers
import authRouter from './routes/auth';
import newsRouter from './routes/news';
import chatRouter from './routes/chat';
import adminRouter from './routes/admin';            // ⬅️ tambahkan ini

const app = express();
const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// --- CORS ---
const origins = FRONTEND_ORIGIN.split(',').map(s => s.trim());
const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    if (!origin || origins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// --- Middlewares ---
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- Health ---
app.get('/', (_req, res) => res.send('OK'));
app.get('/health', (_req, res) => res.json({ ok: true }));

// --- Routes ---
app.use('/auth', authRouter);
app.use('/admin', adminRouter);                     // ⬅️ mount router admin di sini
app.use('/api/news', newsRouter);
app.use('/api/chat', chatRouter);

// 404 (letakkan PALING AKHIR)
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
