import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/billing — all invoices with patient info
router.get('/', async (req, res) => {
  try {
    const bills = await prisma.billing.findMany({
      orderBy: { createdAt: 'desc' },
      include: { patient: true }
    });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch billing records' });
  }
});

// GET /api/billing/stats — aggregate stats for the billing page
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allBills, monthBills] = await Promise.all([
      prisma.billing.findMany({ select: { totalAmount: true, paidStatus: true } }),
      prisma.billing.findMany({
        where: { createdAt: { gte: monthStart } },
        select: { totalAmount: true, paidStatus: true }
      })
    ]);

    const totalRevenue = monthBills
      .filter(b => b.paidStatus)
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const pendingAmount = allBills
      .filter(b => !b.paidStatus)
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const invoiceCount = allBills.length;

    res.json({ totalRevenue, pendingAmount, invoiceCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch billing stats' });
  }
});

// POST /api/billing — create invoice
router.post('/', async (req, res) => {
  try {
    const { patientId, totalAmount, billType, paidStatus } = req.body;

    if (!patientId || !totalAmount) {
      return res.status(400).json({ error: 'Patient and amount are required' });
    }

    // Generate invoice number: INV-XXXX
    const count = await prisma.billing.count();
    const invoiceNo = `INV-${String(count + 1001).padStart(4, '0')}`;

    const bill = await prisma.billing.create({
      data: {
        patientId,
        invoiceNo,
        totalAmount: parseFloat(totalAmount),
        billType,
        paidStatus: paidStatus || false
      },
      include: { patient: true }
    });
    res.status(201).json(bill);
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// PATCH /api/billing/:id/pay — mark invoice as paid
router.patch('/:id/pay', async (req, res) => {
  try {
    const updated = await prisma.billing.update({
      where: { id: req.params.id },
      data: { paidStatus: true },
      include: { patient: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as paid' });
  }
});

export default router;
