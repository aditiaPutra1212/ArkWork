import { Router } from 'express';
import { z } from 'zod';
import { Step1Schema, Step2Schema, Step3Schema, Step4Schema, Step5Schema } from '../validators/employer';
import { checkAvailability, createAccount, upsertProfile, choosePlan, createDraftJob, submitVerification } from '../services/employer';

export const employerRouter = Router();

// GET /api/employers/availability?slug=...&email=...
employerRouter.get('/availability', async (req, res, next) => {
  try {
    const data = await checkAvailability({ slug: req.query.slug as string, email: req.query.email as string });
    res.json(data);
  } catch (e) { next(e); }
});

// POST /api/employers/step1
employerRouter.post('/step1', async (req, res, next) => {
  try {
    const parsed = Step1Schema.parse(req.body);
    const result = await createAccount(parsed);
    res.json({ ok: true, ...result });
  } catch (e: any) {
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Email already used' });
    if (e?.issues) return res.status(400).json({ error: 'Validation error', details: e.issues });
    next(e);
  }
});

// POST /api/employers/step2
employerRouter.post('/step2', async (req, res, next) => {
  try {
    const parsed = Step2Schema.parse(req.body);
    const { employerId, ...profile } = parsed;
    const data = await upsertProfile(employerId, profile);
    res.json(data);
  } catch (e: any) {
    if (e?.issues) return res.status(400).json({ error: 'Validation error', details: e.issues });
    next(e);
  }
});

// POST /api/employers/step3
employerRouter.post('/step3', async (req, res, next) => {
  try {
    const parsed = Step3Schema.parse(req.body);
    const data = await choosePlan(parsed.employerId, parsed.planSlug);
    res.json(data);
  } catch (e: any) {
    if (e?.issues) return res.status(400).json({ error: 'Validation error', details: e.issues });
    next(e);
  }
});

// POST /api/employers/step4
employerRouter.post('/step4', async (req, res, next) => {
  try {
    const parsed = Step4Schema.parse(req.body);
    const { employerId, ...rest } = parsed;
    const data = await createDraftJob(employerId, rest);
    res.json(data);
  } catch (e: any) {
    if (e?.issues) return res.status(400).json({ error: 'Validation error', details: e.issues });
    next(e);
  }
});

// POST /api/employers/step5
employerRouter.post('/step5', async (req, res, next) => {
  try {
    const parsed = Step5Schema.parse(req.body);
    const data = await submitVerification(parsed.employerId, parsed.note, parsed.files);
    res.json(data);
  } catch (e: any) {
    if (e?.issues) return res.status(400).json({ error: 'Validation error', details: e.issues });
    next(e);
  }
});
