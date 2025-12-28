import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { startOfDay } from 'date-fns';

/**
 * Record a view for a job.
 * Logic:
 * - Simple: Create a new JobView record every time.
 * - Optional Improvement: Debounce by IP/Session (not implemented yet for simplicity as requested).
 */
export const recordJobView = async (req: Request, res: Response) => {
    try {
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({ ok: false, error: 'Job ID required' });
        }

        // Check if job exists
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            return res.status(404).json({ ok: false, error: 'Job not found' });
        }

        // Create View Record
        await prisma.jobView.create({
            data: {
                jobId: jobId,
            },
        });

        return res.json({ ok: true, message: 'View recorded' });
    } catch (error) {
        console.error('[JobView] Error recording view:', error);
        return res.status(500).json({ ok: false, error: 'Internal error' });
    }
};
