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

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, weeklyRes, queueRes] = await Promise.all([
        fetch(`${API}/api/dashboard/stats`),
        fetch(`${API}/api/dashboard/weekly`),
        fetch(`${API}/api/dashboard/queue`)
      ]);
      const [statsData, weeklyRaw, queueData] = await Promise.all([
        statsRes.json(), weeklyRes.json(), queueRes.json()
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
          <p className="page-subtitle">Good morning, Dr. Ayurveda! Here is today's summary.</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} /> Today, {new Date().toLocaleDateString()}
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
            <Users size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Patients Today</div>
            <div className="stat-value">{loading ? '...' : stats.patientsToday}</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(14, 165, 233, 0.2)', color: 'var(--secondary)' }}>
            <Calendar size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Upcoming Appointments</div>
            <div className="stat-value">{loading ? '...' : stats.upcomingAppointments}</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
            <TrendingUp size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Revenue (Today)</div>
            <div className="stat-value">{loading ? '...' : `₹${stats.revenueToday.toLocaleString('en-IN')}`}</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
            <AlertCircle size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Low Stock Alerts</div>
            <div className="stat-value">{loading ? '...' : stats.lowStockCount}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="glass-panel">
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Patient Visits & Revenue Overview</h2>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--glass-border)', color: 'var(--text-main)' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="patients" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPatients)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2>Today's Queue</h2>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Loading queue...</div>
            ) : queue.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No appointments today</div>
            ) : (
              queue.map((apt, index) => (
                <div key={apt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-muted)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      #{apt.token || index + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{apt.patient?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{apt.time || '--'} • {apt.type}</div>
                    </div>
                  </div>
                  <span className="badge badge-primary">{apt.status}</span>
                </div>
              ))
            )}
          </div>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/appointments')}>View All Appointments</button>
        </div>
      </div>
    </div>
  );
}
