import { useState, useEffect } from 'react';
import { Clock, PhoneCall, Calendar as CalendarIcon, Search, User, Loader2, CalendarClock } from 'lucide-react';

const API = 'http://localhost:5000';

export default function FollowUp() {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('7days');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchFollowups(); }, [filter]);

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
        body: JSON.stringify({ status }),
      });
      if (res.ok) setFollowups(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    } catch (err) {
      console.error('Failed to update follow-up:', err);
    }
  };

  const getBadgeClass = (status) => ({
    Called: 'badge-success', Overdue: 'badge-danger',
    Scheduled: 'badge-green', Pending: 'badge-warning',
  }[status] || 'badge-warning');

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

      <div className="glass-panel">
        <div className="filter-bar">
          <div className="search-wrapper">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search patient or diagnosis..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="search-wrapper search-wrapper--fixed">
            <CalendarIcon size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="today">Due Today</option>
              <option value="7days">Next 7 Days</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loader-container">
            <Loader2 className="loader-icon" size={36} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading follow-ups...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <CalendarClock size={40} />
            <p>No follow-ups found for this period</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Due Date</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="followup-avatar">
                          <User size={14} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{f.patient?.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{f.diagnosis || '—'}</td>
                    <td>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem',
                        color: f.status === 'Overdue' ? 'var(--danger)' : 'var(--text-secondary)',
                        fontWeight: f.status === 'Overdue' ? 600 : 400,
                      }}>
                        <Clock size={13} /> {new Date(f.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{f.patient?.contact || '—'}</td>
                    <td><span className={`badge ${getBadgeClass(f.status)}`}>{f.status}</span></td>
                    <td>
                      {f.status !== 'Called' && (
                        <button className="btn btn-outline btn-sm" onClick={() => updateStatus(f.id, 'Called')}>
                          <PhoneCall size={13} /> Mark Called
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
