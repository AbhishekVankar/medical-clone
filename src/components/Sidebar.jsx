import { NavLink } from 'react-router-dom';
import { Activity, FileEdit, Users, X } from 'lucide-react';

const navItems = [
  { path: '/prescription', label: 'Prescriptions', icon: FileEdit },
  { path: '/patients',     label: 'Patients',      icon: Users },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Activity size={22} strokeWidth={2.5} />
        </div>
        <span className="sidebar-logo-text">AyurClinic</span>

        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <div className="nav-icon-container">
              <item.icon size={18} strokeWidth={2} />
            </div>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {/* <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">DA</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--sidebar-text)' }}>Dr. Dharmesh</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--sidebar-text-muted)' }}>Chief Practitioner</div>
          </div>
        </div>
      </div> */}
    </aside>
  );
}
