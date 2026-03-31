import { useState, useEffect } from 'react';
import { Clock, PhoneCall, Calendar as CalendarIcon, Search, User, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000';

export default function FollowUp() {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('7days');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFollowups();
  }, [filter]);

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/followups?filter=${filter}`);
      const data = await res.json();
      setFollowups(data);
    } catch (err) {
      console.error('Failed to fetch follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/api/followups/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setFollowups(prev => prev.map(f => f.id === id ? { ...f, status } : f));
      }
    } catch (err) {
      console.error('Failed to update follow-up:', err);
    }
  };

  const getBadgeClass = (status) => {
    const map = { Called: 'badge-success', Overdue: 'badge-danger', Scheduled: 'badge-primary', Pending: 'badge-warning' };
    return map[status] || 'badge-warning';
  };

  const filtered = followups.filter(f =>
    f.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (f.diagnosis || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Follow-up Management</h1>
          <p className="page-subtitle">Track returning patients and schedule reminder calls</p>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="input-field" style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-input)' }}>
            <Search size={20} color="var(--text-muted)" style={{ marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search upcoming follow-ups..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
            />
          </div>
          <div className="input-field" style={{ display: 'flex', alignItems: 'center', width: '250px', background: 'var(--bg-input)' }}>
            <CalendarIcon size={20} color="var(--text-muted)" style={{ marginRight: '10px' }} />
            <select
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="today" style={{ color: '#000' }}>Due Today</option>
              <option value="7days" style={{ color: '#000' }}>Next 7 Days</option>
              <option value="overdue" style={{ color: '#000' }}>Overdue</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loader-container">
            <Loader2 className="loader-icon" size={36} />
            <p style={{ color: 'var(--text-muted)' }}>Loading follow-ups...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No follow-ups found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Primary Diagnosis</th>
                <th>Due Date</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} />
                      </div>
                      <span style={{ fontWeight: '600' }}>{f.patient?.name}</span>
                    </div>
                  </td>
                  <td>{f.diagnosis || '—'}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: f.status === 'Overdue' ? 'var(--danger)' : 'inherit' }}>
                      <Clock size={14} /> {new Date(f.dueDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td>{f.patient?.contact || '—'}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(f.status)}`}>{f.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {f.status !== 'Called' && (
                        <button
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          onClick={() => updateStatus(f.id, 'Called')}
                        >
                          <PhoneCall size={14} style={{ marginRight: '6px' }} /> Mark Called
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
