import { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Edit, Plus, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000';

export default function DiseaseManager() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDiseases();
  }, []);

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
          <p className="page-subtitle">Configure protocols, pathya-apathya, and auto-suggest medicines for diseases.</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
          <Plus size={18} /> Add Disease Protocol
        </button>
      </div>

      <div className="glass-panel">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="input-field" style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-input)' }}>
            <Search size={20} color="var(--text-muted)" style={{ marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search diseases (e.g. Amlapitta, Asthma)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
            />
          </div>
          <button className="btn btn-secondary"><Filter size={18} /> Category Filter</button>
        </div>

        {loading ? (
          <div className="loader-container">
            <Loader2 className="loader-icon" size={36} />
            <p style={{ color: 'var(--text-muted)' }}>Loading disease protocols...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No disease protocols found. Add your first protocol.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((d) => (
              <div key={d.id} style={{ padding: '20px', background: 'var(--bg-card-hover)', borderRadius: '12px', border: 'var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '4px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={20} /> {d.name}
                    </h3>
                    {d.type && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.type} System</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {d.mainDosha && (
                      <span className={`badge ${getDoshaBadge(d.mainDosha)}`}>{d.mainDosha} Predominant</span>
                    )}
                    <button className="btn" style={{ padding: '4px' }}><Edit size={16} color="var(--text-muted)"/></button>
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Standard Protocol (Auto-suggests in Rx):</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {(Array.isArray(d.commonMedicines) ? d.commonMedicines : []).map((m, i) => (
                      <span key={i} style={{ padding: '4px 10px', background: 'var(--bg-input)', borderRadius: '20px', fontSize: '0.85rem' }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {(d.pathya || d.apathya) && (
                  <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {d.pathya && <div><strong>Pathya:</strong> {d.pathya}</div>}
                    {d.apathya && <div><strong>Apathya:</strong> {d.apathya}</div>}
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
