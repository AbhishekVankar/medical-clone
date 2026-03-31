import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/dashboard/stats — today's key metrics
router.get('/stats', async (req, res) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [patientsToday, upcomingAppointments, revenueData, allInventory] = await Promise.all([
      // Patients seen today = prescriptions written today
      prisma.prescription.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } }
      }),
      // Upcoming appointments (today onwards, not completed/cancelled)
      prisma.appointment.count({
        where: {
          date: { gte: todayStart },
          status: { notIn: ['Completed', 'Cancelled'] }
        }
      }),
      // Revenue today (paid bills)
      prisma.billing.aggregate({
        where: { createdAt: { gte: todayStart, lte: todayEnd }, paidStatus: true },
        _sum: { totalAmount: true }
      }),
      // All inventory to compute low stock count
      prisma.inventory.findMany({ select: { stockQuantity: true, lowStockThreshold: true } })
    ]);

    const revenueToday = revenueData._sum.totalAmount || 0;
    const lowStockCount = allInventory.filter(i => i.stockQuantity <= i.lowStockThreshold).length;

    res.json({ patientsToday, upcomingAppointments, revenueToday, lowStockCount });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/dashboard/weekly — last 7 days patient & revenue chart data
router.get('/weekly', async (req, res) => {
  try {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const [patients, revenueData] = await Promise.all([
        prisma.prescription.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.billing.aggregate({
          where: { createdAt: { gte: start, lte: end }, paidStatus: true },
          _sum: { totalAmount: true }
        })
      ]);

      days.push({
        name: dayNames[date.getDay()],
        patients,
        revenue: revenueData._sum.totalAmount || 0
      });
    }

    res.json(days);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weekly data' });
  }
});

// GET /api/dashboard/queue — today's appointment queue
router.get('/queue', async (req, res) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const queue = await prisma.appointment.findMany({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        status: { notIn: ['Completed', 'Cancelled'] }
      },
      orderBy: [{ token: 'asc' }, { time: 'asc' }],
      include: { patient: true },
      take: 10
    });
    res.json(queue);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch today's queue" });
  }
});

export default router;
