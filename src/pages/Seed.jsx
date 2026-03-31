import { useState } from 'react';
import { seedMedicines } from '../firebase/seedMedicines';
import { Loader2, Database, CheckCircle, AlertCircle, FlaskConical } from 'lucide-react';

export default function Seed() {
  const [status, setStatus]   = useState('idle'); // idle | loading | done | error | skipped
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const result = await seedMedicines();
      if (result.skipped) {
        setStatus('skipped');
        setMessage(`Inventory already has ${result.count} items — skipped to avoid duplicates.`);
      } else {
        setStatus('done');
        setMessage(`Successfully added ${result.count} medicines to Firestore.`);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Check the console.');
      console.error(err);
    }
  };

  const statusConfig = {
    done:    { icon: <CheckCircle size={40} />, color: 'var(--success)',  bg: 'var(--success-surface)',  border: 'var(--success-border)'  },
    skipped: { icon: <CheckCircle size={40} />, color: 'var(--warning)',  bg: 'var(--warning-surface)',  border: 'var(--warning-border)'  },
    error:   { icon: <AlertCircle size={40} />, color: 'var(--danger)',   bg: 'var(--danger-surface)',   border: 'var(--danger-border)'   },
  }[status];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '520px', margin: '60px auto' }}>
      <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

        {/* Icon */}
        <div style={{
          width: '72px', height: '72px', borderRadius: 'var(--radius-lg)',
          background: 'var(--primary-surface)', border: '1.5px solid var(--primary-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--primary)',
        }}>
          <FlaskConical size={36} />
        </div>

        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Seed Database</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '360px' }}>
            Populates the <strong>inventory</strong> collection in Firestore with
            238 NHS Medicines A-Z. Run this <strong>once</strong> on a fresh database.
          </p>
        </div>

        {/* What gets seeded */}
        <div style={{
          width: '100%', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)',
          padding: '16px 20px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)',
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Collection</span><strong style={{ color: 'var(--text-main)' }}>inventory</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Documents</span><strong style={{ color: 'var(--text-main)' }}>238 medicines</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Stock / Price</span><strong style={{ color: 'var(--text-main)' }}>0 (update later)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Safe to re-run?</span><strong style={{ color: 'var(--success)' }}>Yes — skips if data exists</strong>
          </div>
        </div>

        {/* Result banner */}
        {statusConfig && (
          <div style={{
            width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-md)',
            background: statusConfig.bg, border: `1px solid ${statusConfig.border}`,
            color: statusConfig.color, display: 'flex', alignItems: 'center', gap: '12px',
            fontSize: '0.875rem', fontWeight: 500, textAlign: 'left',
          }}>
            {statusConfig.icon}
            <span>{message}</span>
          </div>
        )}

        {/* Seed button */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}
          onClick={handleSeed}
          disabled={status === 'loading' || status === 'done'}
        >
          {status === 'loading' ? (
            <><Loader2 className="animate-spin" size={18} /> Seeding…</>
          ) : status === 'done' ? (
            <><CheckCircle size={18} /> Seeded Successfully</>
          ) : (
            <><Database size={18} /> Seed Medicines Now</>
          )}
        </button>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          This page is only for initial setup. You can remove the <code>/seed</code> route from <code>App.jsx</code> afterwards.
        </p>
      </div>
    </div>
  );
}
