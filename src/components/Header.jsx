import { Bell, Search, User, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeLabels = {
  '/dashboard': 'Dashboard',
  '/prescription': 'Prescriptions',
  '/patients': 'Patients',
  '/appointments': 'Appointments',
  '/followup': 'Follow-Ups',
  '/billing': 'Billing',
  '/inventory': 'Inventory',
  '/diseases': 'Disease Manager',
};

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New patient registered: Ramesh Kumar', time: '5m ago' },
    { id: 2, text: 'Appointment scheduled for 10:30 AM', time: '20m ago' },
    { id: 3, text: 'Low stock alert: Triphala Churna', time: '1h ago' },
  ]);

  const pageTitle = (() => {
    const path = location.pathname;
    if (routeLabels[path]) return routeLabels[path];
    if (path.includes('/patients/') && path.includes('/history')) return 'Patient History';
    return 'AyurClinic';
  })();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  return (
    <header className="top-header">
      {/* Left: Hamburger + Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="hamburger-btn"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>
            {pageTitle}
          </h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right: Search + Notifications + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search bar — hidden on small mobile via CSS */}
        {/* <div className="search-bar">
          <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search patients, records..."
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              width: '200px',
            }}
          />
        </div> */}

        {/* Notifications */}
        {/* <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="header-icon-btn"
            onClick={() => setShowNotifications(prev => !prev)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--danger)',
                border: '2px solid var(--bg-main)',
              }} />
            )}
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Notifications</h3>
                {notifications.length > 0 && (
                  <span style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '999px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}>
                    {notifications.length} new
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '10px 12px',
                    background: 'var(--bg-muted)',
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--primary)',
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '2px' }}>{n.text}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{n.time}</div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    All caught up!
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <button
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', marginTop: '12px' }}
                  onClick={markAllRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
          )}
        </div> */}

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="header-user-info" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Dr. Dharmesh</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Chief Practitioner</div>
          </div>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: '#fff',
            flexShrink: 0,
            cursor: 'pointer',
          }}>
            DA
          </div>
        </div>
      </div>
    </header>
  );
}
