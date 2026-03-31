import { useState, useEffect } from 'react';
import { IndianRupee, FileText, CheckCircle, Search, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, pendingAmount: 0, invoiceCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [billsRes, statsRes] = await Promise.all([
        fetch(`${API}/api/billing`),
        fetch(`${API}/api/billing/stats`),
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
        const bill = bills.find(b => b.id === id);
        setBills(prev => prev.map(b => b.id === id ? { ...b, paidStatus: true } : b));
        setStats(prev => ({
          ...prev,
          pendingAmount: prev.pendingAmount - (bill?.totalAmount || 0),
          totalRevenue: prev.totalRevenue + (bill?.totalAmount || 0),
        }));
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
        <button className="btn btn-primary">
          <IndianRupee size={18} /> Generate Invoice
        </button>
      </div>

      {/* Stat cards */}
      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(5,150,105,0.12)', color: 'var(--success)' }}>
            <IndianRupee size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Revenue (Month)</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(217,119,6,0.12)', color: 'var(--warning)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Pending Payments</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>₹{stats.pendingAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(15,23,42,0.08)', color: 'var(--text-main)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Invoices Generated</div>
            <div className="stat-value">{stats.invoiceCount}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        {/* Filter bar */}
        <div className="filter-bar">
          <div className="search-wrapper">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by Invoice ID or Patient Name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loader-container">
            <Loader2 className="loader-icon" size={36} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading invoices...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} />
            <p>No invoices found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bill) => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{bill.invoiceNo}</td>
                    <td style={{ fontWeight: 500 }}>{bill.patient?.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(bill.createdAt).toLocaleDateString()}</td>
                    <td>{bill.billType || 'Consultation'}</td>
                    <td style={{ fontWeight: 600 }}>₹{bill.totalAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${bill.paidStatus ? 'badge-success' : 'badge-warning'}`}>
                        {bill.paidStatus ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!bill.paidStatus && (
                        <button className="btn btn-primary btn-sm" onClick={() => markAsPaid(bill.id)}>
                          Mark Paid
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
