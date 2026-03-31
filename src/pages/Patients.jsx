import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Phone, History, Loader2, Users } from 'lucide-react';
import { getAllPatients, searchPatients } from '../services/patientService';

export default function Patients() {
  const navigate = useNavigate();
  const [patients,    setPatients]    = useState([]);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (err) {
      console.error('Failed to fetch patients', err);
      setError('Could not load patient records. Check your Firebase configuration.');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filter (searchPatients does the same thing but against Firestore;
  // we already have the data in memory so filter locally for instant response).
  const filtered = patients.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.contact?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Records</h1>
          <p className="page-subtitle">Manage patient records and medical histories</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/prescription')}>
          <Plus size={18} /> Register New Patient
        </button>
      </div>

      <div className="glass-panel">
        <div className="filter-bar">
          <div className="search-wrapper">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search patients by name or phone…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ padding: '14px 16px', background: 'var(--danger-surface)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Info</th>
                <th>Contact</th>
                <th>Last Prescription</th>
                <th>Visits</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">
                    <div className="loader-container">
                      <Loader2 className="loader-icon" size={36} />
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Opening Patient Records…</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <Users size={40} />
                      <p>{searchTerm ? 'No patients match your search.' : 'No patients registered yet.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {p.age ? `${p.age} yrs` : '—'} · {p.gender || '—'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <Phone size={13} color="var(--text-muted)" /> {p.contact || '—'}
                      </div>
                    </td>
                    <td>
                      {p.lastPrescription ? (
                        <>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                            {p.lastPrescription.createdAt
                              ? new Date(p.lastPrescription.createdAt).toLocaleDateString()
                              : '—'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {p.lastPrescription.diagnosis || '—'}
                          </div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No history</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-green">{p.prescriptionCount ?? 0}</span>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/patients/${p.id}/history`)}>
                        <History size={14} /> View History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
