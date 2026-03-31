import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Prescription from './pages/Prescription';
import Patients from './pages/Patients';
import PatientHistory from './pages/PatientHistory';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import DiseaseManager from './pages/DiseaseManager';
import FollowUp from './pages/FollowUp';
import Seed from './pages/Seed';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/prescription" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prescription" element={<Prescription />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id/history" element={<PatientHistory />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/diseases" element={<DiseaseManager />} />
          <Route path="/followup" element={<FollowUp />} />
          <Route path="/seed" element={<Seed />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
