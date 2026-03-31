import { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ patientsToday: 0, upcomingAppointments: 0, revenueToday: 0, lowStockCount: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, weeklyRes, queueRes] = await Promise.all([
        fetch(`${API}/api/dashboard/stats`),
        fetch(`${API}/api/dashboard/weekly`),
        fetch(`${API}/api/dashboard/queue`),
      ]);
      const [statsData, weeklyRaw, queueData] = await Promise.all([
        statsRes.json(), weeklyRes.json(), queueRes.json(),
      ]);
      setStats(statsData);
      setWeeklyData(weeklyRaw);
      setQueue(queueData);
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic Overview</h1>
          <p className="page-subtitle">Good morning, Dr. Dharmesh! Here is today's summary.</p>
        </div>
        <button className="btn btn-primary">
          <Calendar size={18} /> Today, {new Date().toLocaleDateString()}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>
            <Users size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Patients Today</div>
            <div className="stat-value">{loading ? '—' : stats.patientsToday}</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(14,165,233,0.15)', color: 'var(--secondary)' }}>
            <Calendar size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Upcoming Appointments</div>
            <div className="stat-value">{loading ? '—' : stats.upcomingAppointments}</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>
            <TrendingUp size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Revenue (Today)</div>
            <div className="stat-value">{loading ? '—' : `₹${stats.revenueToday.toLocaleString('en-IN')}`}</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>
            <AlertCircle size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Low Stock Alerts</div>
            <div className="stat-value">{loading ? '—' : stats.lowStockCount}</div>
          </div>
        </div>
      </div>

      {/* Chart + Queue */}
      <div className="layout-2-1">
        <div className="glass-panel">
          <div className="section-header">
            <h2 className="section-title">Patient Visits & Revenue</h2>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="patients" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorPatients)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="section-header">
            <h2 className="section-title">Today's Queue</h2>
            <span className="badge badge-green">{queue.length} patients</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px', fontSize: '0.875rem' }}>Loading queue...</div>
            ) : queue.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px', fontSize: '0.875rem' }}>No appointments today</div>
            ) : (
              queue.map((apt, index) => (
                <div key={apt.id} className="queue-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="token-avatar">#{apt.token || index + 1}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{apt.patient?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.time || 'Walk-in'} · {apt.type}</div>
                    </div>
                  </div>
                  <span className="badge badge-primary">{apt.status}</span>
                </div>
              ))
            )}
          </div>

          <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/appointments')}>
            View All Appointments
          </button>
        </div>
      </div>
    </div>
  );
}
