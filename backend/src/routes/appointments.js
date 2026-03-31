import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/appointments?date=today — fetch appointments (default: today)
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;

    let where = {};
    if (date === 'today' || !date) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    } else if (date === 'upcoming') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      where.date = { gte: now };
      where.status = { notIn: ['Completed', 'Cancelled'] };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: [{ token: 'asc' }, { time: 'asc' }],
      include: { patient: true }
    });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST /api/appointments — book appointment (auto-assigns token for today)
router.post('/', async (req, res) => {
  try {
    const { patientId, date, time, type, notes } = req.body;

    if (!patientId || !date) {
      return res.status(400).json({ error: 'Patient and date are required' });
    }

    const appointmentDate = new Date(date);
    const dayStart = new Date(appointmentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Auto-assign next token for that day
    const todayCount = await prisma.appointment.count({
      where: { date: { gte: dayStart, lte: dayEnd } }
    });
    const token = todayCount + 1;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        date: appointmentDate,
        time,
        type: type || 'New Consult',
        status: 'Scheduled',
        token,
        notes
      },
      include: { patient: true }
    });
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// PATCH /api/appointments/:id/status — update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Scheduled', 'Waiting', 'Consulting', 'Completed', 'Cancelled', 'Rescheduled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
      include: { patient: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

// DELETE /api/appointments/:id — cancel appointment
router.delete('/:id', async (req, res) => {
  try {
    await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: 'Cancelled' }
    });
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

export default router;
