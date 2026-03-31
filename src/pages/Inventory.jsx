import { useState, useEffect } from 'react';
import { Pill, AlertTriangle, Search, PlusCircle, ArrowDown, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000';

export default function Inventory() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/inventory`);
      const data = await res.json();
      setStock(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const consumeItem = async (id) => {
    try {
      const res = await fetch(`${API}/api/inventory/${id}/consume`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setStock(prev => prev.map(i => i.id === id ? updated : i));
      }
    } catch (err) {
      console.error('Failed to consume stock:', err);
    }
  };

  const filtered = stock.filter(i =>
    i.medicineName.toLowerCase().includes(search.toLowerCase()) ||
    (i.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = stock.length;
  const lowStockCount = stock.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length;
  const stockValue = stock.reduce((sum, i) => sum + i.stockQuantity * i.price, 0);

  const getBadgeClass = (status) => {
    if (status === 'In Stock') return 'badge-success';
    if (status === 'Low Stock') return 'badge-warning';
    return 'badge-danger';
  };

  const getQtyColor = (status) => {
    if (status === 'Critical') return 'var(--danger)';
    if (status === 'Low Stock') return 'var(--warning)';
    return 'var(--text-main)';
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medicine Inventory</h1>
          <p className="page-subtitle">Track stock levels, expiries, and usage for in-clinic dispensing</p>
        </div>
        <button className="btn btn-primary">
          <PlusCircle size={18} /> Add Medicine
        </button>
      </div>

      {/* Stat cards */}
      <div className="dashboard-grid">
        <div className="glass-panel stat-card" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div className="stat-icon" style={{ background: 'rgba(5,150,105,0.12)', color: 'var(--primary)' }}>
            <Pill size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Items Tracked</div>
            <div className="stat-value">{totalItems}</div>
          </div>
        </div>
        <div className="glass-panel stat-card" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div className="stat-icon" style={{ background: 'rgba(220,38,38,0.12)', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Low Stock Alerts</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{lowStockCount}</div>
          </div>
        </div>
        <div className="glass-panel stat-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="stat-icon" style={{ background: 'rgba(217,119,6,0.12)', color: 'var(--warning)' }}>
            <Pill size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Stock Value</div>
            <div className="stat-value">₹{stockValue.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <div className="filter-bar">
          <div className="search-wrapper">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by medicine name or brand..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loader-container">
            <Loader2 className="loader-icon" size={36} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading inventory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Pill size={40} />
            <p>No medicines found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine Name & Brand</th>
                  <th>Formulation</th>
                  <th>Quantity</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.medicineName}</div>
                      {item.brand && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.brand}</div>}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.formulation || '—'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: getQtyColor(item.status) }}>
                        {item.stockQuantity}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                        {item.unit || 'units'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.expiryDate || '—'}</td>
                    <td><span className={`badge ${getBadgeClass(item.status)}`}>{item.status}</span></td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => consumeItem(item.id)}>
                        <ArrowDown size={13} /> Consume
                      </button>
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
