import { useState, useEffect } from 'react';
import { Pill, AlertTriangle, Search, PlusCircle, ArrowDown, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000';

export default function Inventory() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

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

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medicine Inventory</h1>
          <p className="page-subtitle">Track stock levels, expiries, and usage for in-clinic dispensing</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}><PlusCircle size={18} /> Add New Medicine</button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-info">
            <div className="stat-label">Total Items Tracked</div>
            <div className="stat-value">{totalItems}</div>
          </div>
          <Pill size={40} color="var(--primary)" style={{ position: 'absolute', right: '20px', opacity: 0.2 }} />
        </div>
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="stat-info">
            <div className="stat-label">Low Stock Alerts</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{lowStockCount}</div>
          </div>
          <AlertTriangle size={40} color="var(--danger)" style={{ position: 'absolute', right: '20px', opacity: 0.2 }} />
        </div>
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="stat-info">
            <div className="stat-label">Stock Value</div>
            <div className="stat-value">₹{stockValue.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="input-field" style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-input)' }}>
            <Search size={20} color="var(--text-muted)" style={{ marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search inventory..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loader-container">
            <Loader2 className="loader-icon" size={36} />
            <p style={{ color: 'var(--text-muted)' }}>Loading inventory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No medicines found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine Name & Brand</th>
                <th>Formulation</th>
                <th>Quantity Available</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{item.medicineName}</div>
                    {item.brand && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.brand}</div>}
                  </td>
                  <td>{item.formulation || '—'}</td>
                  <td>
                    <h3 style={{ margin: 0, color: item.status === 'Critical' ? 'var(--danger)' : item.status === 'Low Stock' ? 'var(--warning)' : 'inherit' }}>
                      {item.stockQuantity} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>{item.unit || 'units'}</span>
                    </h3>
                  </td>
                  <td>{item.expiryDate || '—'}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(item.status)}`}>{item.status}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => consumeItem(item.id)}
                    >
                      <ArrowDown size={14} style={{ marginRight: '4px' }} /> Consume
                    </button>
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
