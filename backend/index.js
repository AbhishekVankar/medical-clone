import express from 'express';
import cors from 'cors';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------------------------
// SINGLE CLINIC API ENDPOINTS
// No complex multi-tenant filters needed. All data belongs to you!
// ----------------------------------------------------------------------

// 1. Fetch all Patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// 2. Add a New Patient
app.post('/api/patients', async (req, res) => {
  try {
    const { name, age, contact, address, gender, medicalHist } = req.body;
    
    // Basic validation
    if (!name || !age || !contact) {
      return res.status(400).json({ error: "Name, age, and contact are required" });
    }

    const newPatient = await prisma.patient.create({
      data: {
        name,
        age: parseInt(age),
        contact,
        address, // New field Added
        gender,  // New field Added
        medicalHist: medicalHist || {}, // Flexible JSON data
      },
    });
    
    res.status(201).json(newPatient);
  } catch (err) {
    console.error("Error creating patient:", err);
    res.status(500).json({ error: "Failed to create patient" });
  }
});

// 2.1 Fetch a single patient by name (helper for autofill)
app.get('/api/patients/search', async (req, res) => {
  try {
    const { q } = req.query;
    const patients = await prisma.patient.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' }
      },
      take: 5
    });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// 3.0 Add Prescription
app.post('/api/prescriptions', async (req, res) => {
    try {
        const { patientId, diagnosis, medicines, pathya, apathya, notes } = req.body;
        
        if (!patientId || !medicines) {
            return res.status(400).json({ error: "Patient and medicines are required" });
        }

        const newPrescription = await prisma.prescription.create({
            data: {
                patientId,
                diagnosis,
                medicines, // JSON
                pathya,
                apathya,
                notes
            }
        });

        res.status(201).json(newPrescription);
    } catch (err) {
        console.error("Error creating prescription:", err);
        res.status(500).json({ error: "Failed to create prescription" });
    }
});

// 3.1 Get all Prescriptions
app.get('/api/prescriptions', async (req, res) => {
  try {
      const prescriptions = await prisma.prescription.findMany({
          orderBy: { createdAt: 'desc' },
          include: { patient: true }
      });
      res.json(prescriptions);
  } catch (err) {
      res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});

// 4. Get all Inventory (Medicines)
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: { medicineName: 'asc' }
    });
    res.json(inventory);
  } catch (err) {
    console.error("Error fetching inventory:", err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// 4.1 Search Inventory (Medicines) for Autocomplete
app.get('/api/inventory/search', async (req, res) => {
  try {
    const { q } = req.query;
    const medicines = await prisma.inventory.findMany({
      where: {
        medicineName: { contains: q, mode: 'insensitive' }
      },
      take: 10
    });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: "Medicine search failed" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Single Clinic Backend running on port ${PORT}`);
});
