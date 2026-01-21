import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Cache simple in-memory (optional, emsifa is quite fast but Next.js usage had some caching)
// For simplicity and parity with frontend implementation, we fetch directly.

// GET /api/wilayah/provinces
router.get('/provinces', async (req, res) => {
    try {
        const response = await axios.get('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
        const items = (response.data || []).map((d: any) => ({
            id: String(d.id),
            name: d.name
        }));
        res.json({ items });
    } catch (error) {
        console.error('[Wilayah API] Provinces Error:', error);
        res.status(500).json({ items: [], error: 'Failed to fetch provinces' });
    }
});

// GET /api/wilayah/regencies/:provinceId
router.get('/regencies/:provinceId', async (req, res) => {
    const { provinceId } = req.params;
    try {
        const response = await axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
        const items = (response.data || []).map((d: any) => ({
            id: String(d.id),
            name: d.name
        }));
        res.json({ items });
    } catch (error) {
        console.error(`[Wilayah API] Regencies Error (${provinceId}):`, error);
        res.status(500).json({ items: [], error: 'Failed to fetch regencies' });
    }
});

// GET /api/wilayah/districts/:regencyId
router.get('/districts/:regencyId', async (req, res) => {
    const { regencyId } = req.params;
    try {
        const response = await axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyId}.json`);
        const items = (response.data || []).map((d: any) => ({
            id: String(d.id),
            name: d.name
        }));
        res.json({ items });
    } catch (error) {
        console.error(`[Wilayah API] Districts Error (${regencyId}):`, error);
        res.status(500).json({ items: [], error: 'Failed to fetch districts' });
    }
});

export default router;
