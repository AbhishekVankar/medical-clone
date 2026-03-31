import { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Edit, Plus, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000';

export default function DiseaseManager() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchDiseases(); }, []);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/diseases`);
      const data = await res.json();
      setDiseases(data);
    } catch (err) {
      console.error('Failed to fetch diseases:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = diseases.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.type || '').toLowerCase().includes(search.toLowerCase())
  );

  const getDoshaBadge = (dosha) => {
    if (!dosha) return 'badge-primary';
    if (dosha.includes('Pitta')) return 'badge-danger';
    if (dosha.includes('Vata')) return 'badge-primary';
    return 'badge-warning';
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Smart Disease Manager</h1>
          <p className="page-subtitle">Configure protocols, pathya-apathya, and auto-suggest medicines.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Add Protocol
        </button>
      </div>

      <div className="glass-panel">
        <div className="filter-bar">
          <div className="search-wrapper">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search diseases (e.g. Amlapitta, Asthma)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={16} /> Category Filter
          </button>
        </div>

        {loading ? (
          <div className="loader-container">
            <Loader2 className="loader-icon" size={36} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading disease protocols...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={40} />
            <p>No disease protocols found. Add your first protocol.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2">
            {filtered.map((d) => (
              <div key={d.id} className="disease-card">
                <div className="disease-card-header">
                  <div>
                    <h3 style={{ color: 'var(--primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <BookOpen size={16} /> {d.name}
                    </h3>
                    {d.type && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.type} System</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {d.mainDosha && (
                      <span className={`badge ${getDoshaBadge(d.mainDosha)}`}>{d.mainDosha}</span>
                    )}
                    <button className="btn btn-ghost btn-icon">
                      <Edit size={15} color="var(--text-muted)" />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Standard Protocol
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(Array.isArray(d.commonMedicines) ? d.commonMedicines : []).map((m, i) => (
                      <span key={i} className="med-pill">{m}</span>
                    ))}
                  </div>
                </div>

                {(d.pathya || d.apathya) && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {d.pathya && <div><strong style={{ color: 'var(--success)' }}>Pathya:</strong> {d.pathya}</div>}
                    {d.apathya && <div><strong style={{ color: 'var(--danger)' }}>Apathya:</strong> {d.apathya}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
