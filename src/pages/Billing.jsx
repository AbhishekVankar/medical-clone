import { useState, useEffect } from 'react';
import { IndianRupee, FileText, CheckCircle, Search, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, pendingAmount: 0, invoiceCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [billsRes, statsRes] = await Promise.all([
        fetch(`${API}/api/billing`),
        fetch(`${API}/api/billing/stats`)
      ]);
      const [billsData, statsData] = await Promise.all([billsRes.json(), statsRes.json()]);
      setBills(billsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id) => {
    try {
      const res = await fetch(`${API}/api/billing/${id}/pay`, { method: 'PATCH' });
      if (res.ok) {
        setBills(prev => prev.map(b => b.id === id ? { ...b, paidStatus: true } : b));
        setStats(prev => {
          const bill = bills.find(b => b.id === id);
          return {
            ...prev,
            pendingAmount: prev.pendingAmount - (bill?.totalAmount || 0),
            totalRevenue: prev.totalRevenue + (bill?.totalAmount || 0)
          };
        });
      }
    } catch (err) {
      console.error('Failed to mark as paid:', err);
    }
  };

  const filtered = bills.filter(b =>
    b.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
    b.patient?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Payments</h1>
          <p className="page-subtitle">Manage invoices, collect payments, and track revenue</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
          <IndianRupee size={18} /> Generate Invoice
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Revenue (This Month)</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
          </div>
          <IndianRupee size={40} color="var(--success)" style={{ position: 'absolute', right: '20px', opacity: 0.2 }} />
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <div className="stat-label">Pending Payments</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>₹{stats.pendingAmount.toLocaleString('en-IN')}</div>
          </div>
          <FileText size={40} color="var(--warning)" style={{ position: 'absolute', right: '20px', opacity: 0.2 }} />
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <div className="stat-label">Invoices Generated</div>
            <div className="stat-value">{stats.invoiceCount}</div>
          </div>
          <CheckCircle size={40} color="var(--text-main)" style={{ position: 'absolute', right: '20px', opacity: 0.1 }} />
        </div>
      </div>

      <div className="glass-panel">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="input-field" style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-input)' }}>
            <Search size={20} color="var(--text-muted)" style={{ marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search by Invoice ID or Patient Name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loader-container">
            <Loader2 className="loader-icon" size={36} />
            <p style={{ color: 'var(--text-muted)' }}>Loading invoices...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No invoices found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Patient Name</th>
                <th>Date</th>
                <th>Bill Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bill) => (
                <tr key={bill.id}>
                  <td><span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{bill.invoiceNo}</span></td>
                  <td>{bill.patient?.name}</td>
                  <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                  <td>{bill.billType || 'Consultation'}</td>
                  <td style={{ fontWeight: '600' }}>₹{bill.totalAmount.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge ${bill.paidStatus ? 'badge-success' : 'badge-warning'}`}>
                      {bill.paidStatus ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    {!bill.paidStatus && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                        onClick={() => markAsPaid(bill.id)}
                      >
                        Mark Paid
                      </button>
                    )}
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
