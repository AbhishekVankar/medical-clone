import { useState } from 'react';
import { seedAllopathy } from '../firebase/seedAllopathy';
import { seedAyush } from '../firebase/seedAyush';
import { seedDiseases } from '../firebase/seedDiseases';
import { Loader2, Database, CheckCircle, AlertCircle, FlaskConical, RefreshCw, Stethoscope, Leaf } from 'lucide-react';

export default function Seed() {
  const [alloStatus, setAlloStatus]   = useState('idle');
  const [alloMessage, setAlloMessage] = useState('');
  const [ayurStatus, setAyurStatus]   = useState('idle');
  const [ayurMessage, setAyurMessage] = useState('');
  const [disStatus, setDisStatus]     = useState('idle');
  const [disMessage, setDisMessage]   = useState('');

  const runAllopathy = async (force = false) => {
    setAlloStatus('loading');
    setAlloMessage('');
    try {
      const result = await seedAllopathy(force);
      if (result.skipped) {
        setAlloStatus('skipped');
        setAlloMessage(`Inventory already has ${result.count} allopathy items — skipped. Use "Re-seed" to wipe and reload.`);
      } else {
        setAlloStatus('done');
        setAlloMessage(`Successfully seeded ${result.inserted} allopathy medicines into Firestore.`);
      }
    } catch (err) {
      setAlloStatus('error');
      setAlloMessage(err.message || 'Something went wrong. Check the console.');
      console.error(err);
    }
  };

  const runAyush = async (force = false) => {
    setAyurStatus('loading');
    setAyurMessage('');
    try {
      const result = await seedAyush(force);
      if (result.skipped) {
        setAyurStatus('skipped');
        setAyurMessage(`Inventory already has ${result.count} ayurvedic items — skipped. Use "Re-seed" to wipe and reload.`);
      } else {
        setAyurStatus('done');
        setAyurMessage(`Successfully seeded ${result.inserted} ayurvedic medicines into Firestore.`);
      }
    } catch (err) {
      setAyurStatus('error');
      setAyurMessage(err.message || 'Something went wrong. Check the console.');
      console.error(err);
    }
  };

  const runDiseaseSeed = async (force = false) => {
    setDisStatus('loading');
    setDisMessage('');
    try {
      const result = await seedDiseases(force);
      if (result.skipped) {
        setDisStatus('skipped');
        setDisMessage(`Diseases already has ${result.count} items — skipped. Use "Re-seed" to wipe and reload.`);
      } else {
        setDisStatus('done');
        setDisMessage(`Successfully seeded ${result.count} diseases into Firestore.`);
      }
    } catch (err) {
      setDisStatus('error');
      setDisMessage(err.message || 'Something went wrong. Check the console.');
      console.error(err);
    }
  };

  const getStatusConfig = (status) => ({
    done:    { icon: <CheckCircle size={40} />, color: 'var(--success)',  bg: 'var(--success-surface)',  border: 'var(--success-border)'  },
    skipped: { icon: <AlertCircle size={40} />, color: 'var(--warning)',  bg: 'var(--warning-surface)',  border: 'var(--warning-border)'  },
    error:   { icon: <AlertCircle size={40} />, color: 'var(--danger)',   bg: 'var(--danger-surface)',   border: 'var(--danger-border)'   },
  }[status]);

  const SeedCard = ({ icon, title, description, meta, status, message, onSeed, onReseed }) => (
    <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{
        width: '72px', height: '72px', borderRadius: 'var(--radius-lg)',
        background: 'var(--primary-surface)', border: '1.5px solid var(--primary-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
      }}>
        {icon}
      </div>

      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '360px' }}>
          {description}
        </p>
      </div>

      <div style={{
        width: '100%', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)',
        padding: '16px 20px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)',
        display: 'flex', flexDirection: 'column', gap: '6px',
      }}>
        {meta.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{label}</span><strong style={{ color: 'var(--text-main)' }}>{value}</strong>
          </div>
        ))}
      </div>

      {getStatusConfig(status) && (
        <div style={{
          width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-md)',
          background: getStatusConfig(status).bg, border: `1px solid ${getStatusConfig(status).border}`,
          color: getStatusConfig(status).color, display: 'flex', alignItems: 'center', gap: '12px',
          fontSize: '0.875rem', fontWeight: 500, textAlign: 'left',
        }}>
          {getStatusConfig(status).icon}
          <span>{message}</span>
        </div>
      )}

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}
          onClick={onSeed}
          disabled={status === 'loading' || status === 'done'}
        >
          {status === 'loading' ? (
            <><Loader2 className="animate-spin" size={18} /> Seeding…</>
          ) : status === 'done' ? (
            <><CheckCircle size={18} /> Seeded Successfully</>
          ) : (
            <><Database size={18} /> Seed Now</>
          )}
        </button>
        <button
          className="btn btn-outline"
          style={{ width: '100%', padding: '11px', fontSize: '0.875rem' }}
          onClick={onReseed}
          disabled={status === 'loading'}
        >
          {status === 'loading'
            ? <><Loader2 className="animate-spin" size={16} /> Working…</>
            : <><RefreshCw size={16} /> Re-seed (wipe &amp; reload)</>
          }
        </button>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <strong>Re-seed</strong> deletes existing docs of this type then re-inserts fresh.
      </p>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '520px', margin: '60px auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <SeedCard
        icon={<FlaskConical size={36} />}
        title="Seed Allopathy Medicines"
        description={<>Populates the <strong>inventory</strong> collection with 2,439 Janaushadhi allopathy medicines with drug codes, unit sizes, prices, and auto-derived side effects.</>}
        meta={[
          ['Collection', 'inventory'],
          ['Documents', '2,439 medicines'],
          ['Type', 'allopathy'],
          ['Side effects', 'Derived by drug class'],
        ]}
        status={alloStatus}
        message={alloMessage}
        onSeed={() => runAllopathy(false)}
        onReseed={() => runAllopathy(true)}
      />

      <SeedCard
        icon={<Leaf size={36} />}
        title="Seed Ayurvedic Medicines"
        description={<>Populates the <strong>inventory</strong> collection with 147 NLEAM Ayurvedic medicines including formulation category, indications, dose, and precautions.</>}
        meta={[
          ['Collection', 'inventory'],
          ['Documents', '147 medicines'],
          ['Type', 'ayurvedic'],
          ['Source', 'NLEAM 2022'],
        ]}
        status={ayurStatus}
        message={ayurMessage}
        onSeed={() => runAyush(false)}
        onReseed={() => runAyush(true)}
      />

      <SeedCard
        icon={<Stethoscope size={36} />}
        title="Seed Diseases"
        description={<>Populates the <strong>diseases</strong> collection used for the Diagnosis dropdown in the Prescription form. Run this <strong>once</strong> on a fresh database.</>}
        meta={[
          ['Collection', 'diseases'],
          ['Documents', '229 diseases'],
        ]}
        status={disStatus}
        message={disMessage}
        onSeed={() => runDiseaseSeed(false)}
        onReseed={() => runDiseaseSeed(true)}
      />

    </div>
  );
}
