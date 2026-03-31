import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/followups?filter=7days|today|overdue — fetch follow-ups with patient info
router.get('/', async (req, res) => {
  try {
    const { filter } = req.query;
    const now = new Date();

    let where = {};
    if (filter === 'today') {
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      const end = new Date(now); end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    } else if (filter === 'overdue') {
      where.dueDate = { lt: now };
      where.status = { notIn: ['Called'] };
    } else {
      // Default: next 7 days
      const sevenDays = new Date(now);
      sevenDays.setDate(sevenDays.getDate() + 7);
      where.dueDate = { gte: now, lte: sevenDays };
    }

    const followups = await prisma.followUp.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: { patient: true }
    });
    res.json(followups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// POST /api/followups — schedule a follow-up
router.post('/', async (req, res) => {
  try {
    const { patientId, diagnosis, dueDate, notes } = req.body;

    if (!patientId || !dueDate) {
      return res.status(400).json({ error: 'Patient and due date are required' });
    }

    const followUp = await prisma.followUp.create({
      data: {
        patientId,
        diagnosis,
        dueDate: new Date(dueDate),
        status: 'Scheduled',
        notes
      },
      include: { patient: true }
    });
    res.status(201).json(followUp);
  } catch (err) {
    res.status(500).json({ error: 'Failed to schedule follow-up' });
  }
});

// PATCH /api/followups/:id/status — update follow-up status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Scheduled', 'Pending', 'Called', 'Overdue'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await prisma.followUp.update({
      where: { id: req.params.id },
      data: { status },
      include: { patient: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update follow-up status' });
  }
});

export default router;
