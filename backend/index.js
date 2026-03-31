import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './src/routes/auth.js';
import patientRoutes from './src/routes/patients.js';
import prescriptionRoutes from './src/routes/prescriptions.js';
import appointmentRoutes from './src/routes/appointments.js';
import billingRoutes from './src/routes/billing.js';
import inventoryRoutes from './src/routes/inventory.js';
import followupRoutes from './src/routes/followups.js';
import diseaseRoutes from './src/routes/diseases.js';
import dashboardRoutes from './src/routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AyurClinic backend is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AyurClinic backend running on http://localhost:${PORT}`);
});
