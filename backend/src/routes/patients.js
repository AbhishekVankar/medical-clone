import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/patients — all patients with their latest prescription
router.get('/', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        prescriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    res.json(patients);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET /api/patients/search?q= — search patients by name or contact
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { name: { contains: q || '', mode: 'insensitive' } },
          { contact: { contains: q || '', mode: 'insensitive' } }
        ]
      },
      take: 5
    });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/patients/:id — single patient with full prescription history
router.get('/:id', async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        prescriptions: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// POST /api/patients — create new patient
router.post('/', async (req, res) => {
  try {
    const { name, age, contact, address, gender, medicalHist } = req.body;

    if (!name || !age || !contact) {
      return res.status(400).json({ error: 'Name, age, and contact are required' });
    }

    const newPatient = await prisma.patient.create({
      data: {
        name,
        age: parseInt(age),
        contact,
        address,
        gender,
        medicalHist: medicalHist || {}
      }
    });
    res.status(201).json(newPatient);
  } catch (err) {
    console.error('Error creating patient:', err);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// PATCH /api/patients/:id — update patient details
router.patch('/:id', async (req, res) => {
  try {
    const { name, age, contact, address, gender, medicalHist } = req.body;
    const updated = await prisma.patient.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(age && { age: parseInt(age) }),
        ...(contact && { contact }),
        ...(address !== undefined && { address }),
        ...(gender && { gender }),
        ...(medicalHist && { medicalHist })
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

export default router;
