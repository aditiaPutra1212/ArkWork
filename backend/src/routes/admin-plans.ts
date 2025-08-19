// src/routes/admin-plans.ts
import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

/** TODO: ganti dengan middleware admin milikmu */
function requireAdmin(_req: Request, _res: Response, next: NextFunction) {
  next();
}

const r = Router();

/* ====================== Helpers ====================== */
// Kirim ke FE sebagai number (JSON tidak support BigInt)
function serializePlan(p: any) {
  return { ...p, amount: p?.amount != null ? Number(p.amount) : 0 };
}
function serializePlans(items: any[]) {
  return items.map(serializePlan);
}
function toBigIntAmount(v: unknown): bigint {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new Error('amount must be a non-negative number');
  // kalau mau batasin nominal, bisa tambahkan cek di sini.
  return BigInt(Math.trunc(n));
}

/**
 * GET /admin/plans
 * - Kembalikan array langsung (kompatibel dengan UI)
 * - Support pencarian ?q= pada name/slug (case-insensitive)
 */
r.get('/', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string | undefined)?.trim();

    const where: Prisma.PlanWhereInput | undefined = q
      ? {
          OR: [
            { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { slug: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const items = await prisma.plan.findMany({
      where,
      orderBy: { id: 'desc' }, // schema Plan tidak punya createdAt
    });

    res.json(serializePlans(items));
  } catch (e) {
    next(e);
  }
});

/**
 * GET /admin/plans/:id
 */
r.get('/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await prisma.plan.findUnique({ where: { id: req.params.id } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(serializePlan(plan));
  } catch (e) {
    next(e);
  }
});

/**
 * POST /admin/plans
 * body: { slug, name, description?, amount, currency?, interval?, active?, priceId? }
 */
r.post('/', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      slug,
      name,
      description,
      amount,
      currency = 'IDR',
      interval = 'month',
      active = true,
      priceId,
    } = req.body || {};

    if (!slug || !name) return res.status(400).json({ error: 'slug and name are required' });

    let amountBig: bigint;
    try {
      amountBig = toBigIntAmount(amount);
    } catch (err: any) {
      return res.status(400).json({ error: err?.message || 'Invalid amount' });
    }

    const plan = await prisma.plan.create({
      data: {
        slug: String(slug).trim(),
        name: String(name).trim(),
        description: description ?? null,
        amount: amountBig,                 
        currency: String(currency).trim(),
        interval: String(interval).trim(), // 'month' | 'year'
        active: !!active,
        priceId: priceId ?? null,
      },
    });

    res.status(201).json(serializePlan(plan));
  } catch (e: any) {
    if (e?.code === 'P2002') {
      // unique constraint (slug)
      return res.status(409).json({ error: 'Slug already exists' });
    }
    next(e);
  }
});

/**
 * PUT /admin/plans/:id
 * body opsional: { slug?, name?, description?, amount?, currency?, interval?, active?, priceId? }
 */
r.put('/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { slug, name, description, amount, currency, interval, active, priceId } = req.body || {};

    const data: Prisma.PlanUpdateInput = {};
    if (slug !== undefined) data.slug = String(slug).trim();
    if (name !== undefined) data.name = String(name).trim();
    if (description !== undefined) data.description = description ?? null;

    if (amount !== undefined) {
      try {
        // Prisma type untuk BigInt expects bigint → cast via any agar kompatibel
        (data as any).amount = toBigIntAmount(amount);
      } catch (err: any) {
        return res.status(400).json({ error: err?.message || 'Invalid amount' });
      }
    }

    if (currency !== undefined) data.currency = String(currency).trim();
    if (interval !== undefined) data.interval = String(interval).trim();
    if (active !== undefined) data.active = !!active;
    if (priceId !== undefined) data.priceId = priceId ?? null;

    const plan = await prisma.plan.update({ where: { id }, data });
    res.json(serializePlan(plan));
  } catch (e: any) {
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Slug already exists' });
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Plan not found' });
    next(e);
  }
});

/**
 * DELETE /admin/plans/:id
 */
r.delete('/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.plan.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e: any) {
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Plan not found' });
    if (e?.code === 'P2003') {
      // FK constraint: masih dipakai di payments/subscriptions
      return res.status(409).json({
        error: 'Plan is referenced by other records (payments/subscriptions). Deactivate it instead of deleting.',
      });
    }
    next(e);
  }
});

export default r;
