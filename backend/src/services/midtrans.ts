// src/services/midtrans.ts
import midtransClient from "midtrans-client";
import { prisma } from "../lib/prisma";

/* ===================== ENV ===================== */
const IS_PRODUCTION =
  String(process.env.MIDTRANS_IS_PROD ?? process.env.MIDTRANS_PROD ?? "false") === "true";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY!;
const FRONTEND_ORIGIN = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000")
  .split(",")[0]
  .trim()
  .replace(/\/+$/, ""); // buang trailing slash

if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
  throw new Error("MIDTRANS_SERVER_KEY / MIDTRANS_CLIENT_KEY belum di-set");
}

/* ===================== SNAP CLIENT ===================== */
const snap = new midtransClient.Snap({
  isProduction: IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

/* ===================== TYPES ===================== */
export type CreateSnapForPlanParams = {
  planId: string;            // uuid atau slug
  userId?: string | null;    // opsional
  employerId?: string;       // opsional
  enabledPayments?: string[];
  customer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
};

export type MidtransNotificationPayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status:
    | "capture" | "settlement" | "pending" | "deny" | "cancel" | "expire" | "failure" | "refund" | "chargeback";
  payment_type?: string;
  fraud_status?: "accept" | "challenge" | "deny";
  transaction_id?: string;
  [k: string]: any;
};

/* ===================== HELPERS ===================== */
async function getPlanByIdOrSlug(planId: string) {
  const byId = await prisma.plan.findFirst({ where: { id: planId } });
  if (byId) return byId;
  return prisma.plan.findFirst({ where: { slug: planId } });
}

// Midtrans batas order_id <= 50 chars
function newOrderId(prefix: string, id: string) {
  const clean = String(id).replace(/[^a-zA-Z0-9]/g, ""); // buang '-' dll
  const short = clean.slice(0, 12);                      // potong biar pendek
  const ts = Date.now().toString(36);                   // base36 → ringkas
  const rnd = Math.random().toString(36).slice(2, 5);   // 3 char random
  // contoh: plan-10bcf8f70f24-kx1z3p (± 26 char)
  return `${prefix}-${short}-${ts}${rnd}`;
}

function verifySignature(p: MidtransNotificationPayload) {
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const raw = `${p.order_id}${p.status_code}${p.gross_amount}${MIDTRANS_SERVER_KEY}`;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
  return expected === p.signature_key;
}

function mapStatus(p: MidtransNotificationPayload) {
  const ts = p.transaction_status;
  const fraud = p.fraud_status;
  if (ts === "capture") {
    if (fraud === "accept") return "settlement";
    if (fraud === "challenge") return "challenge";
    return "rejected";
  }
  if (ts === "settlement") return "settlement";
  if (ts === "pending") return "pending";
  if (ts === "deny") return "deny";
  if (ts === "cancel") return "cancel";
  if (ts === "expire") return "expire";
  if (ts === "failure") return "failure";
  if (ts === "refund") return "refund";
  if (ts === "chargeback") return "chargeback";
  return ts;
}

/* ===================== PUBLIC ===================== */
export async function createSnapForPlan(params: CreateSnapForPlanParams) {
  const { planId, userId, employerId, enabledPayments, customer } = params;

  const plan = await getPlanByIdOrSlug(planId);
  if (!plan) throw new Error("Plan not found");

  const grossAmount = Number(plan.amount);
  if (!Number.isInteger(grossAmount) || grossAmount <= 0) {
    throw new Error("Invalid plan amount");
  }

  const orderId = newOrderId("plan", String(planId));

  const payload: any = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    item_details: [
      {
        id: String(planId),
        price: grossAmount,
        quantity: 1,
        name: plan.name ?? `Plan ${planId}`,
      },
    ],
    customer_details: {
      first_name: customer?.first_name ?? "User",
      last_name: customer?.last_name ?? (userId ?? "guest"),
      email: customer?.email, // boleh kosong di sandbox
      phone: customer?.phone,
    },
    credit_card: { secure: true },
    callbacks: {
      finish: `${FRONTEND_ORIGIN}/payments/finish`,
      pending: `${FRONTEND_ORIGIN}/payments/pending`,
      error: `${FRONTEND_ORIGIN}/payments/error`,
    },
  };

  if (Array.isArray(enabledPayments) && enabledPayments.length > 0) {
    payload.enabled_payments = enabledPayments;
  }

  // panggil Midtrans
  let res: { token: string; redirect_url: string };
  try {
    res = await snap.createTransaction(payload);
  } catch (err: any) {
    // munculkan pesan 400 dari Midtrans agar mudah debug
    const apiMsgs: string[] =
      err?.ApiResponse?.error_messages ??
      err?.rawHttpClientData?.data?.error_messages ??
      [];
    const detail = apiMsgs.join("; ");
    throw new Error(detail || "Midtrans createTransaction failed");
  }

  // simpan ke DB
  await prisma.payment.create({
    data: {
      orderId,
      planId: plan.id,
      employerId: employerId ?? null,
      userId: userId ?? null,
      currency: "IDR",
      grossAmount,
      status: "pending",
      token: res.token,
      redirectUrl: res.redirect_url,
      meta: { provider: "midtrans", createdAt: new Date().toISOString() },
    },
  });

  return {
    token: res.token,
    redirect_url: res.redirect_url,
    order_id: orderId,
  };
}

export async function handleMidtransNotification(raw: any) {
  const p = raw as MidtransNotificationPayload;

  // validasi minimal
  for (const k of ["order_id", "status_code", "gross_amount", "signature_key"]) {
    if (!p || typeof (p as any)[k] !== "string" || !(p as any)[k]) {
      return { ok: false, reason: "BAD_PAYLOAD", k };
    }
  }
  if (!verifySignature(p)) return { ok: false, reason: "INVALID_SIGNATURE" };

  const status = mapStatus(p);

  await prisma.payment.updateMany({
    where: { orderId: p.order_id },
    data: {
      status,
      method: p.payment_type ?? undefined,
      transactionId: p.transaction_id ?? undefined,
      fraudStatus: p.fraud_status ?? undefined,
      // simpan raw payload untuk audit
      meta: {
        set: {
          ...(p as any),
          updatedAt: new Date().toISOString(),
        },
      },
    },
  });

  return { ok: true, order_id: p.order_id, status, payload: p };
}
