import { Router, Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma"; // ✅ Gunakan Singleton Prisma yang aman
import { adminRequired } from "../middleware/role"; // ✅ Cukup adminRequired untuk route admin

const router = Router();

/* -------------------------------------------------------------------------- */
/* MIDDLEWARE                                  */
/* -------------------------------------------------------------------------- */

// ✅ Pasang "Satpam Admin" di gerbang utama router ini
// Ini akan memperbaiki error 401 karena admin sekarang dicek pakai token admin
router.use(adminRequired);

/* -------------------------------------------------------------------------- */
/* HELPERS                                   */
/* -------------------------------------------------------------------------- */

function toInt(v: unknown, def = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : def;
}

function toDocs(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

// Konversi Input Budget (String/Number) ke BigInt
const parseToBigInt = (v: unknown): bigint => {
  if (v === undefined || v === null) return BigInt(0);
  if (typeof v === "bigint") return v;
  if (typeof v === "number") return BigInt(Math.max(0, Math.round(v)));
  if (typeof v === "string") {
    const clean = v.replace(/[^\d-]/g, ""); // Hapus 'Rp', titik, dll
    const n = Number(clean || 0);
    return BigInt(Math.max(0, Math.round(isNaN(n) ? 0 : n)));
  }
  return BigInt(0);
};

/* -------------------------------------------------------------------------- */
/* ROUTES                                   */
/* -------------------------------------------------------------------------- */

/**
 * GET /
 * List Tenders (dengan Pagination & Search)
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, page, limit, sector, status } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20; // Default 20 item per page
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.TenderWhereInput = {};

    if (q) {
      where.title = { contains: String(q), mode: 'insensitive' };
    }
    if (sector) {
      where.sector = String(sector) as any;
    }
    if (status) {
      where.status = String(status) as any;
    }

    // Gunakan Promise.all untuk performa (Query paralel)
    const [items, total] = await Promise.all([
      prisma.tender.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.tender.count({ where }),
    ]);

    // Format output date
    const sanitizedItems = items.map((t) => ({
      ...t,
      deadline: t.deadline ? t.deadline.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      // BigInt akan dihandle oleh global middleware di index.ts
    }));

    return res.json({
      ok: true,
      data: sanitizedItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });

  } catch (err: any) {
    console.error("[ADMIN][TENDERS] List error:", err);
    next(err);
  }
});

/**
 * GET /:id
 * Detail Tender
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toInt(req.params.id, NaN);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const item = await prisma.tender.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ message: "Not found" });

    // Sanitize dates
    const sanitized = {
      ...item,
      deadline: item.deadline ? item.deadline.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };

    return res.json(sanitized);
  } catch (err: any) {
    console.error("[ADMIN][TENDERS] Get detail error:", err);
    next(err);
  }
});

/**
 * POST /
 * Create Tender
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = (req as any).admin; // Dari middleware adminRequired
    const adminId = admin?.id ?? "unknown";
    const adminUsername = admin?.username ?? "unknown";
    const adminIp = req.ip || (req.headers["x-forwarded-for"] as string) || "unknown";

    const {
      title,
      buyer,
      sector,
      location,
      status,
      contract,
      budgetUSD,
      description,
      documents,
      deadline,
    } = req.body ?? {};

    // Validasi Wajib
    if (!title || !buyer || !sector || !status || !contract || !deadline) {
      return res.status(400).json({ 
        message: "Field wajib diisi: title, buyer, sector, status, contract, deadline" 
      });
    }

    const created = await prisma.tender.create({
      data: {
        title: String(title),
        buyer: String(buyer),
        sector: sector as any,
        location: String(location ?? ""),
        status: status as any,
        contract: contract as any,
        budgetUSD: parseToBigInt(budgetUSD),
        description: description !== undefined ? String(description ?? "") : undefined,
        documents: documents !== undefined ? toDocs(documents) : undefined,
        deadline: new Date(deadline),
      },
    });

    console.info(`[ADMIN][TENDER][CREATE] By: ${adminUsername} (${adminId}) | IP: ${adminIp} | ID: ${created.id}`);

    return res.status(201).json(created);
  } catch (err: any) {
    console.error("[ADMIN][TENDERS] Create error:", err);
    next(err);
  }
});

/**
 * PUT /:id
 * Update Tender
 */
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = (req as any).admin;
    const adminId = admin?.id ?? "unknown";
    const adminUsername = admin?.username ?? "unknown";

    const id = toInt(req.params.id, NaN);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const {
      title,
      buyer,
      sector,
      location,
      status,
      contract,
      budgetUSD,
      description,
      documents,
      deadline,
    } = req.body ?? {};

    const data: Prisma.TenderUpdateInput = {
      title: String(title),
      buyer: String(buyer),
      sector: sector as any,
      location: String(location),
      status: status as any,
      contract: contract as any,
      description: String(description ?? ""),
      documents: toDocs(documents),
      deadline: deadline ? new Date(deadline) : undefined,
      budgetUSD: parseToBigInt(budgetUSD),
    };

    const updated = await prisma.tender.update({ where: { id }, data });

    console.info(`[ADMIN][TENDER][UPDATE] By: ${adminUsername} | ID: ${updated.id}`);

    return res.json(updated);
  } catch (err: any) {
    console.error("[ADMIN][TENDERS] Update error:", err);
    if (err?.code === "P2025") return res.status(404).json({ message: "Not found" });
    next(err);
  }
});

/**
 * DELETE /:id
 * Delete Tender
 */
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = (req as any).admin;
    const adminUsername = admin?.username ?? "unknown";

    const id = toInt(req.params.id, NaN);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    // Cek exist dulu agar error lebih rapi
    const existing = await prisma.tender.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Not found" });

    await prisma.tender.delete({ where: { id } });

    console.info(`[ADMIN][TENDER][DELETE] By: ${adminUsername} | ID: ${id}`);

    return res.status(204).end();
  } catch (err: any) {
    console.error("[ADMIN][TENDERS] Delete error:", err);
    next(err);
  }
});

export default router;