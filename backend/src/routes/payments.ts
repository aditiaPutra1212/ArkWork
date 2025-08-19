// src/routes/payments.ts
import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { createSnapForPlan, handleMidtransNotification } from "../services/midtrans";

/* ================= Auth placeholder (ganti dgn punyamu) ================= */
function requireAuth(req: any, _res: Response, next: NextFunction) {
  // contoh: req.user = { id: 'user-123', employerId: 'emp-456' }
  return next();
}
function getMaybeUserId(req: Request): string | undefined {
  const anyReq = req as any;
  return anyReq?.user?.id ?? anyReq?.session?.user?.id ?? req.body?.userId;
}

const r = Router();

/* ================= LIST (admin inbox) ================= */
r.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const take = Math.min(Math.max(Number(req.query.take ?? 20), 1), 100);
    const cursor = (req.query.cursor as string | undefined) ?? undefined;
    const status = (req.query.status as string | undefined)?.trim();

    const where = status ? { status } : undefined;

    const items = await prisma.payment.findMany({
      where,
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderId: true,
        status: true,
        method: true,
        grossAmount: true,
        currency: true,
        createdAt: true,
        transactionId: true,
        redirectUrl: true,
        token: true,
        plan: { select: { id: true, slug: true, name: true, interval: true } },
        employer: { select: { id: true, displayName: true, legalName: true, slug: true } },
      },
    });

    const nextCursor = items.length === take ? items[items.length - 1].id : null;
    return res.json({ items, nextCursor });
  } catch (e) {
    return next(e);
  }
});

/* ================= PUBLIC PLANS (signup step) ================= */
r.get("/plans", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await prisma.plan.findMany({
      where: { active: true },
      orderBy: [{ amount: "asc" }, { id: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        amount: true,     // <- BigInt di DB
        currency: true,
        interval: true,
        active: true,
      },
    });

    // Cast BigInt -> Number agar aman untuk JSON dan FE
    const plans = rows.map((p) => ({
      ...p,
      amount: Number(p.amount),
    }));

    return res.json(plans);
  } catch (e) {
    return next(e);
  }
});

/* ================= CHECKOUT (buat transaksi Snap) ================= */
/**
 * Body:
 * { planId: string; employerId?: string; userId?: string; customer?: {...}; enabledPayments?: string[] }
 * userId BISA KOSONG (opsional) pada alur signup perusahaan.
 */
r.post("/checkout", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planId, employerId, customer, enabledPayments } = (req.body ?? {}) as any;
    if (!planId) return res.status(400).json({ error: "Invalid params: planId required" });

    const maybeUserId = getMaybeUserId(req);

    const tx = await createSnapForPlan({
      planId,
      userId: maybeUserId ?? null,
      employerId,
      customer,
      enabledPayments,
    });

    // Ambil nominal utk UI (cast ke Number)
    const plan = await prisma.plan.findFirst({
      where: { OR: [{ id: planId }, { slug: planId }] },
      select: { amount: true, currency: true },
    });

    return res.json({
      token: (tx as any).token,
      redirect_url: (tx as any).redirect_url,
      orderId: (tx as any).order_id,
      amount: plan ? Number(plan.amount as unknown as bigint) : undefined,
      currency: plan?.currency ?? "IDR",
    });
  } catch (e) {
    return next(e);
  }
});

/* ================= Webhook Midtrans ================= */
r.post("/midtrans/notify", async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const result = await handleMidtransNotification(req.body);
    if ((result as any)?.ok === false) {
      console.warn("Midtrans notify rejected:", result);
    }
    // Tetap 200 supaya Midtrans tidak banjir retry
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Midtrans notify error:", e);
    return res.status(200).json({ ok: false });
  }
});

/* ================= Detail by orderId (polling UI) ================= */
r.get("/:orderId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pay = await prisma.payment.findUnique({
      where: { orderId: req.params.orderId },
    });
    if (!pay) return res.status(404).json({ error: "Not found" });
    return res.json(pay);
  } catch (e) {
    return next(e);
  }
});

export default r;
