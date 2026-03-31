import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/prescriptions — all prescriptions with patient info
router.get('/', async (req, res) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      orderBy: { createdAt: 'desc' },
      include: { patient: true }
    });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// GET /api/prescriptions/:id — single prescription
router.get('/:id', async (req, res) => {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: req.params.id },
      include: { patient: true }
    });
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// POST /api/prescriptions — create prescription
router.post('/', async (req, res) => {
  try {
    const { patientId, diagnosis, medicines, pathya, apathya, notes } = req.body;

    if (!patientId || !medicines) {
      return res.status(400).json({ error: 'Patient and medicines are required' });
    }

    const newPrescription = await prisma.prescription.create({
      data: { patientId, diagnosis, medicines, pathya, apathya, notes }
    });
    res.status(201).json(newPrescription);
  } catch (err) {
    console.error('Error creating prescription:', err);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

export default router;
