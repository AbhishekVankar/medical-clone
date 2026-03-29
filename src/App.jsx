import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Patients from './pages/Patients';
import Prescription from './pages/Prescription';
import PatientHistory from './pages/PatientHistory';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/prescription" replace />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/prescription" element={<Prescription />} />
          <Route path="/patients/:id/history" element={<PatientHistory />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
