import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import http from 'node:http';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import { createClient } from 'redis';

// --- FIX FINAL: Cara Import yang Benar untuk connect-redis v9+ ---
// Di versi terbaru, class RedisStore ada di dalam properti .RedisStore
const RedisStore = require("connect-redis").RedisStore;

import { rateLimit } from 'express-rate-limit';
import { RedisStore as RateLimitRedisStore } from 'rate-limit-redis';
import helmet from 'helmet';

// Routes
import authRouter from './routes/auth';
import newsRouter from './routes/news';
import chatRouter from './routes/chat';
import adminRouter from './routes/admin';
import { employerRouter } from './routes/employer';
import employerAuthRouter from './routes/employer-auth';
import adminPlansRouter from './routes/admin-plans';
import paymentsRouter from './routes/payments';
import tendersRouter from './routes/tenders';
import adminTendersRouter from './routes/admin-tenders';
import { jobsRouter } from './routes/jobs';
import reportsRouter from './routes/reports';
import ratesRouter from './routes/rates';
import googleRouter from './routes/google';
import applicationsRouter from './routes/applications';
import employerApplicationsRouter from './routes/employer-applications';
import adminJobsRouter from './routes/admin-jobs';

// DEV helper routes
import authDev from './routes/auth-dev';
import devBillingMailRouter from './routes/dev-billing-mail';

import { authRequired, employerRequired, adminRequired } from './middleware/role';

// Aktifkan CRON billing
import './jobs/billingCron';

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
const DEFAULT_PORT = Number(process.env.PORT || 4000);

app.set('etag', false);     

/* ======= SECURITY HEADERS (HELMET) ======= */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* ======= CORS ======= */
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://arkwork.vercel.app',
  'https://arkwork-staging.vercel.app',
];

if (process.env.FRONTEND_ORIGIN) {
  process.env.FRONTEND_ORIGIN.split(',').forEach((origin) => {
    const cleanOrigin = origin.trim();
    if (cleanOrigin && !allowedOrigins.includes(cleanOrigin)) {
      allowedOrigins.push(cleanOrigin);
    }
  });
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error(`CORS Blocked: Origin ${origin} is not allowed.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Employer-Id',
    'x-employer-id',
  ],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

if (NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

/* ====== REDIS CLIENT ====== */
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

/* ====== SESSION SETUP ====== */
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error('FATAL: SESSION_SECRET is not defined in .env');
}

app.use(
  session({
    // --- FIX: Panggil Class RedisStore dengan benar ---
    store: new RedisStore({
      client: redisClient,
      prefix: 'arkwork:', 
    }),
    name: 'arkwork.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 Day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* --- RATE LIMITING CONFIGURATION --- */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 5, 
  message: { error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: new (RateLimitRedisStore as any)({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 3, 
  message: { error: 'Akses Admin ditahan sementara karena terlalu banyak percobaan gagal.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: new (RateLimitRedisStore as any)({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
});

/* BigInt -> string (safe untuk res.json) */
app.use((_req, res, next) => {
  const old = res.json.bind(res);
  function conv(x: any): any {
    if (x === null || x === undefined) return x;
    if (typeof x === 'bigint') return x.toString();
    if (Array.isArray(x)) return x.map(conv);
    if (typeof x === 'object') {
      const o: any = {};
      for (const k of Object.keys(x)) o[k] = conv((x as any)[k]);
      return o;
    }
    return x;
  }
  res.json = (body?: any) => old(conv(body));
  next();
});

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

/* ========= HEALTH ========= */
app.get('/', (_req, res) => res.send('OK'));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health', (_req, res) => res.json({ ok: true, status: 'healthy' }));
app.get('/healthz', (_req, res) => res.json({ ok: true }));

/* ========= DEV ROUTES ========= */
if (NODE_ENV !== 'production' && process.env.DEV_AUTH === '1') {
  app.use(authDev);
  app.use(devBillingMailRouter);
}

/* ================= ROUTES ================= */

// 1. RATE LIMITING (Hanya pasang di pintu masuk berbahaya)
//    Jangan pasang di parent route '/auth' agar '/auth/me' tidak kena blokir.

// -- User Auth --
app.use('/auth/signin', authLimiter);         // Limit Login
app.use('/auth/signup', authLimiter);         // Limit Daftar
app.use('/auth/forgot', authLimiter);         // Limit Lupa Password
app.use('/auth/reset-password', authLimiter); // Limit Reset Password
app.use('/auth', authRouter);                 // Sisa route (termasuk /me) BEBAS limit
app.use('/auth', googleRouter); 

// -- Employer Auth --
app.use('/api/employers/auth/signin', authLimiter);
app.use('/api/employers/auth/signup', authLimiter);
app.use('/api/employers/auth/forgot', authLimiter);
app.use('/api/employers/auth', employerAuthRouter); // Route lain bebas
app.use('/api/employers', employerRouter);
app.use('/api/employers/applications', employerApplicationsRouter);

// -- Admin Auth --
app.use('/api/admin/signin', adminLimiter); // Cuma login admin yang dilimit ketat
app.use('/api/admin', adminRouter);         // Dashboard admin bebas limit

// -- Route Lainnya --
app.use('/api/admin/jobs', adminJobsRouter);
app.use('/api/admin/tenders', adminTendersRouter);
app.use('/api/admin/plans', adminPlansRouter);

/* Public APIs */
app.use('/api/reports', reportsRouter);
app.use('/api/news', newsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/rates', ratesRouter);
app.use('/api/tenders', tendersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api', jobsRouter);
app.use('/api', applicationsRouter);

/* Example protected endpoints */
app.get('/api/profile', authRequired, (req, res) =>
  res.json({ ok: true, whoami: (req as any).auth })
);
app.get('/api/employer/dashboard', employerRequired, (_req, res) =>
  res.json({ ok: true, message: 'Employer-only area' })
);
app.post('/api/admin/stats', adminRequired, (_req, res) =>
  res.json({ ok: true })
);

/* 404 */
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

/* Error handler */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  if (err instanceof Error && err.message.startsWith('Not allowed by CORS')) {
    return res.status(403).json({ error: 'CORS: Origin not allowed' });
  }
  const status = (typeof err?.status === 'number' && err.status) || 500;
  const msg = NODE_ENV !== 'production' ? err?.message : 'Internal server error';
  res.status(status).json({ error: msg });
});

/* Start Server */
function startServer(port: number) {
  const server = http.createServer(app);
  server.listen(port);
  server.on('listening', () => {
    console.log('========================================');
    console.log(`🚀 Backend listening on http://localhost:${port}`);
    console.log(`NODE_ENV           : ${NODE_ENV}`);
    console.log(`FRONTEND_ORIGIN(s) : ${allowedOrigins.join(', ')}`);
    console.log('✅ Billing CRON     : loaded');
    if (NODE_ENV !== 'production' && process.env.DEV_AUTH === '1') {
      console.log('✅ Dev auth routes  : enabled');
    }
    console.log('✅ Redis Session    : connected & active');
    console.log('✅ Rate Limiting    : enabled (Targeted: Login Only)'); // Cek log ini nanti
    console.log('✅ Security Headers : enabled (Helmet)');
    console.log('========================================');
  });
}

startServer(DEFAULT_PORT);