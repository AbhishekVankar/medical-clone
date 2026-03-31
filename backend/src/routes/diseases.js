import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/diseases — all disease protocols
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const where = q
      ? { name: { contains: q, mode: 'insensitive' } }
      : {};

    const diseases = await prisma.diseaseProtocol.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    res.json(diseases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disease protocols' });
  }
});

// GET /api/diseases/:id — single disease protocol
router.get('/:id', async (req, res) => {
  try {
    const disease = await prisma.diseaseProtocol.findUnique({
      where: { id: req.params.id }
    });
    if (!disease) return res.status(404).json({ error: 'Protocol not found' });
    res.json(disease);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch protocol' });
  }
});

// POST /api/diseases — create disease protocol
router.post('/', async (req, res) => {
  try {
    const { name, type, mainDosha, commonMedicines, pathya, apathya } = req.body;

    if (!name || !commonMedicines) {
      return res.status(400).json({ error: 'Disease name and medicines are required' });
    }

    const protocol = await prisma.diseaseProtocol.create({
      data: { name, type, mainDosha, commonMedicines, pathya, apathya }
    });
    res.status(201).json(protocol);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A protocol for this disease already exists' });
    }
    res.status(500).json({ error: 'Failed to create protocol' });
  }
});

// PATCH /api/diseases/:id — update disease protocol
router.patch('/:id', async (req, res) => {
  try {
    const { type, mainDosha, commonMedicines, pathya, apathya } = req.body;
    const updated = await prisma.diseaseProtocol.update({
      where: { id: req.params.id },
      data: {
        ...(type !== undefined && { type }),
        ...(mainDosha !== undefined && { mainDosha }),
        ...(commonMedicines !== undefined && { commonMedicines }),
        ...(pathya !== undefined && { pathya }),
        ...(apathya !== undefined && { apathya })
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update protocol' });
  }
});

export default router;
