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
import helmet from 'helmet';

// --- IMPORT LOGGER ---
import { logger } from './lib/logger';

// Fix Connect-Redis v9
const RedisStore = require("connect-redis").RedisStore;

import { rateLimit } from 'express-rate-limit';
import { RedisStore as RateLimitRedisStore } from 'rate-limit-redis';

// Routes Imports
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
import profileRouter from './routes/profile';

// --- BARIS BARU: Import Dashboard Router ---
import dashboardRouter from './routes/dashboard';
import wilayahRouter from './routes/wilayah';

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

/* ======= CORS SETUP ======= */
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:4000',
  'http://localhost:5173',
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
      console.warn(`[CORS Blocked] Origin: ${origin}`);
      return callback(new Error(`CORS Blocked: Origin ${origin} is not allowed.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Employer-Id', 'x-employer-id'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

if (NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

/* ====== REDIS CLIENT ====== */
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.connect().catch((err) => logger.error('Redis Connect Fail', { error: err }));

/* ====== SESSION SETUP ====== */
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) throw new Error('FATAL: SESSION_SECRET is not defined in .env');

app.use(
  session({
    store: new RedisStore({ client: redisClient, prefix: 'arkwork:' }),
    name: 'arkwork.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* --- RATE LIMITING --- */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  store: new (RateLimitRedisStore as any)({ sendCommand: (...args: string[]) => redisClient.sendCommand(args) }),
});

/* BigInt -> JSON Safe Middleware */
app.use((_req, res, next) => {
  const old = res.json.bind(res);
  function conv(x: any): any {
    if (x === null || x === undefined) return x;
    if (typeof x === 'bigint') return x.toString();
    if (x instanceof Date) return x;
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

/* ========= HEALTH ========= */
app.get('/', (_req, res) => res.send('ArkWork API Ready'));
app.get('/api/health', (_req, res) => res.json({ ok: true, status: 'healthy' }));

/* ================= ROUTES ================= */

// Auth
app.use('/auth', authRouter);
app.use('/auth', googleRouter);

// Employer APIs
app.use('/api/employers/auth', employerAuthRouter);
app.use('/api/employers', employerRouter);
app.use('/api/employers/applications', employerApplicationsRouter);

// --- BARIS PENTING: Pendaftaran Route Dashboard ---
app.use('/api/employers/dashboard', dashboardRouter);

// Admin APIs
app.use('/api/admin', adminRouter);
app.use('/api/admin/jobs', adminJobsRouter);
app.use('/api/admin/tenders', adminTendersRouter);
app.use('/api/admin/plans', adminPlansRouter);

// Public & Other Protected APIs
app.use('/api/reports', reportsRouter);
app.use('/api/news', newsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/rates', ratesRouter);
app.use('/api/tenders', tendersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api', jobsRouter);
app.use('/api', applicationsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/wilayah', wilayahRouter);

/* 404 Handler */
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

/* Global Error Handler */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = (typeof err?.status === 'number' && err.status) || 500;
  res.status(status).json({ error: err?.message || 'Internal server error' });
});

/* Start Server */
function startServer(port: number) {
  const server = http.createServer(app);
  server.listen(port, () => {
    logger.info(`🚀 Backend listening on http://localhost:${port}`);
  });
}

startServer(DEFAULT_PORT);