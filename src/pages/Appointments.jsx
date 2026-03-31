import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, UserCheck, PhoneCall, Plus, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/appointments?date=today`);
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAppointments(prev =>
          prev.map(a => a.id === id ? { ...a, status } : a)
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const statusCounts = {
    complete: appointments.filter(a => a.status === 'Completed').length,
    consulting: appointments.filter(a => a.status === 'Consulting').length,
    waiting: appointments.filter(a => a.status === 'Waiting' || a.status === 'Scheduled').length
  };

  const getBadgeClass = (status) => {
    const map = {
      Waiting: 'badge-primary', Consulting: 'badge-warning',
      Scheduled: 'badge-success', Completed: 'badge-success',
      Cancelled: 'badge-danger', Rescheduled: 'badge-danger'
    };
    return map[status] || 'badge-primary';
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Manage today's schedule and queue system</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
          <Plus size={18} /> Book Appointment
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3><CalendarIcon size={20} style={{ display: 'inline', marginRight: '8px' }} /> Schedule Calendar</h3>
          <div style={{ background: 'var(--bg-muted)', padding: '20px', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginTop: '16px' }}>
              {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} style={{ fontWeight: 'bold' }}>{d}</div>)}
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} style={{ padding: '8px', background: i + 1 === new Date().getDate() ? 'var(--primary)' : 'rgba(255,255,255,0.05)', borderRadius: '4px', cursor: 'pointer' }}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-outline" style={{ width: '100%', marginBottom: '12px' }}><Clock size={18} style={{ marginRight: '8px' }} /> Doctor Availability</button>
            <button className="btn btn-secondary" style={{ width: '100%' }}><PhoneCall size={18} style={{ marginRight: '8px' }} /> Auto-Reminders (WhatsApp)</button>
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Today's Queue (Tokens)</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span className="badge badge-success">{statusCounts.complete} Complete</span>
              <span className="badge badge-warning">{statusCounts.consulting} Consulting</span>
              <span className="badge badge-primary">{statusCounts.waiting} Waiting</span>
            </div>
          </div>

          {loading ? (
            <div className="loader-container">
              <Loader2 className="loader-icon" size={36} />
              <p style={{ color: 'var(--text-muted)' }}>Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No appointments scheduled for today
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time & Token</th>
                  <th>Patient Name</th>
                  <th>Consultation Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{apt.time || 'Walk-in'}</div>
                      <div className="badge" style={{ display: 'inline-block', marginTop: '4px', background: 'var(--bg-card-alt)' }}>Token #{apt.token}</div>
                    </td>
                    <td>{apt.patient?.name}</td>
                    <td>{apt.type}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(apt.status)}`}>{apt.status}</span>
                    </td>
                    <td>
                      {apt.status === 'Consulting' ? (
                        <button className="btn btn-primary" style={{ padding: '6px 16px' }} onClick={() => updateStatus(apt.id, 'Completed')}>
                          <UserCheck size={16} /> Finish
                        </button>
                      ) : apt.status !== 'Completed' && apt.status !== 'Cancelled' ? (
                        <button className="btn btn-outline" style={{ padding: '6px 16px' }} onClick={() => updateStatus(apt.id, 'Consulting')}>
                          Start
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
