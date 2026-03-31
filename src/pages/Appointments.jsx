import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, UserCheck, PhoneCall, Plus, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAppointments(); }, []);

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
        body: JSON.stringify({ status }),
      });
      if (res.ok) setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const statusCounts = {
    complete: appointments.filter(a => a.status === 'Completed').length,
    consulting: appointments.filter(a => a.status === 'Consulting').length,
    waiting: appointments.filter(a => a.status === 'Waiting' || a.status === 'Scheduled').length,
  };

  const getBadgeClass = (status) => ({
    Waiting: 'badge-primary', Consulting: 'badge-warning',
    Scheduled: 'badge-green', Completed: 'badge-success',
    Cancelled: 'badge-danger', Rescheduled: 'badge-danger',
  }[status] || 'badge-primary');

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Manage today's schedule and queue system</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Book Appointment
        </button>
      </div>

      <div className="layout-cal-queue">
        {/* Left: Calendar sidebar */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="section-title">
            <CalendarIcon size={18} /> Schedule Calendar
          </h3>

          <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-main)' }}>
              {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
              ))}
              {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => (
                <div
                  key={i}
                  style={{
                    padding: '6px 2px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: i + 1 === today.getDate() ? 700 : 400,
                    background: i + 1 === today.getDate() ? 'var(--primary)' : 'transparent',
                    color: i + 1 === today.getDate() ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-outline" style={{ width: '100%' }}>
            <Clock size={16} /> Doctor Availability
          </button>
          <button className="btn btn-secondary" style={{ width: '100%' }}>
            <PhoneCall size={16} /> Auto-Reminders (WhatsApp)
          </button>
        </div>

        {/* Right: Queue table */}
        <div className="glass-panel">
          <div className="section-header">
            <h2 className="section-title">Today's Queue</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-success">{statusCounts.complete} Done</span>
              <span className="badge badge-warning">{statusCounts.consulting} Consulting</span>
              <span className="badge badge-primary">{statusCounts.waiting} Waiting</span>
            </div>
          </div>

          {loading ? (
            <div className="loader-container">
              <Loader2 className="loader-icon" size={36} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <CalendarIcon size={40} />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time & Token</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{apt.time || 'Walk-in'}</div>
                        <span className="badge badge-green" style={{ marginTop: '4px' }}>#{apt.token}</span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{apt.patient?.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{apt.type}</td>
                      <td><span className={`badge ${getBadgeClass(apt.status)}`}>{apt.status}</span></td>
                      <td>
                        {apt.status === 'Consulting' ? (
                          <button className="btn btn-primary btn-sm" onClick={() => updateStatus(apt.id, 'Completed')}>
                            <UserCheck size={14} /> Finish
                          </button>
                        ) : apt.status !== 'Completed' && apt.status !== 'Cancelled' ? (
                          <button className="btn btn-outline btn-sm" onClick={() => updateStatus(apt.id, 'Consulting')}>
                            Start
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
