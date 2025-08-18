import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/hash';

export async function checkAvailability(params: { slug?: string; email?: string; }) {
  const { slug, email } = params;
  const checks: Record<string, boolean> = {};
  if (slug) checks.slugTaken = !!(await prisma.employer.findUnique({ where: { slug } }));
  if (email) checks.emailTaken = !!(await prisma.employerAdminUser.findUnique({ where: { email } }));
  return checks;
}

export async function createAccount(input: {
  companyName: string; displayName: string; email: string; website?: string; password: string;
}) {
  const base = input.displayName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'company';
  let slug = base, i = 1;
  while (await prisma.employer.findUnique({ where: { slug } })) slug = `${base}-${i++}`;

  const passwordHash = await hashPassword(input.password);

  const result = await prisma.$transaction(async (tx) => {
    const employer = await tx.employer.create({
      data: { slug, legalName: input.companyName, displayName: input.displayName, website: input.website, status: 'draft' }
    });
    const admin = await tx.employerAdminUser.create({
      data: { employerId: employer.id, email: input.email, passwordHash, isOwner: true, agreedTosAt: new Date() }
    });
    return { employer, admin };
  });

  return { employerId: result.employer.id, slug };
}

export async function upsertProfile(employerId: string, profile: any) {
  await prisma.employerProfile.upsert({
    where: { employerId },
    update: profile,
    create: { employerId, ...profile },
  });
  await prisma.employer.update({ where: { id: employerId }, data: { onboardingStep: 'PACKAGE' } }).catch(() => {});
  return { ok: true };
}

export async function choosePlan(employerId: string, planSlug: string) {
  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan) throw { status: 404, message: 'Plan not found' };

  await prisma.subscription.create({ data: { employerId, planId: plan.id, status: 'active' } });
  await prisma.employer.update({ where: { id: employerId }, data: { onboardingStep: 'JOB' } }).catch(() => {});
  return { ok: true };
}

export async function createDraftJob(employerId: string, data: { title: string; description?: string; location?: string; employment?: string; }) {
  const job = await prisma.job.create({ data: { employerId, ...data, isDraft: true, isActive: false } });
  await prisma.employer.update({ where: { id: employerId }, data: { onboardingStep: 'VERIFY' } }).catch(() => {});
  return { ok: true, jobId: job.id };
}

export async function submitVerification(employerId: string, note?: string, files?: { url: string; type?: string }[]) {
  const vr = await prisma.$transaction(async (tx) => {
    const req = await tx.verificationRequest.create({ data: { employerId, status: 'pending', note } });
    if (files?.length) {
      await tx.verificationFile.createMany({
        data: files.map(f => ({ verificationId: req.id, fileUrl: f.url, fileType: f.type }))
      });
    }
    await tx.employer.update({ where: { id: employerId }, data: { onboardingStep: 'DONE' } });
    return req;
  });
  return { ok: true, verificationId: vr.id };
}
