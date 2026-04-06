import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
        fontSize: '0.95rem',
        color: '#6b7280',
      }}>
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
        fontSize: '0.95rem',
        color: '#6b7280',
      }}>
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/prescription" replace /> : <Login />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
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
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
