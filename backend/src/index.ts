// src/index.ts
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';

// Routers (existing)
import authRouter from './routes/auth';
import newsRouter from './routes/news';
import chatRouter from './routes/chat';
import adminRouter from './routes/admin';
import { employerRouter } from './routes/employer';

// Monetization & Payments
import adminPlansRouter from './routes/admin-plans';
import paymentsRouter from './routes/payments';

const app = express();
const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

if (process.env.NODE_ENV === 'production') {
  // agar Express membaca IP asli di belakang proxy (Heroku/Render/Nginx)
  app.set('trust proxy', 1);
}

/** ---------------- CORS ---------------- */
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

/** --------------- Middlewares --------------- */
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
app.use(cookieParser());
app.use(express.json({ limit: '1mb' })); // webhook midtrans juga JSON → cukup
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/** --------------- Static --------------- */
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

/** --------------- Health --------------- */
app.get('/', (_req, res) => res.send('OK'));
app.get('/health', (_req, res) => res.json({ ok: true }));

/** --------------- Routes --------------- */
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/api/news', newsRouter);
app.use('/api/chat', chatRouter);

// Employer 5-step signup
app.use('/api/employers', employerRouter);

// Admin Monetization (plans CRUD)
app.use('/admin/plans', adminPlansRouter);

// Payments / Midtrans (checkout & webhook)
app.use('/api/payments', paymentsRouter);

/** --------------- 404 (paling akhir) --------------- */
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

/** --------------- Error handler --------------- */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  // Jika error CORS custom dari middleware di atas
  if (err instanceof Error && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS: Origin not allowed' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

/** --------------- Listen --------------- */
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
