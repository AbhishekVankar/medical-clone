import { useState, useEffect } from 'react';
import { Save, Send, Pill, Plus, X, Loader2, Download, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import Modal from '../components/Modal';
import { getOrCreatePatient } from '../services/patientService';
import { createPrescription }  from '../services/prescriptionService';
import { getAllInventory }     from '../services/inventoryService';

export default function Prescription() {
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, title: '', message: '', type: 'info', onConfirm: null, showConfirm: false,
  });

  const [patientData, setPatientData] = useState({
    name: '', age: '', gender: 'Male', phone: '', address: '', diagnosis: '',
  });

  const [medicines, setMedicines]  = useState([{ id: 1, name: '', timing: '', anupan: '', days: 7 }]);
  const [pathya,    setPathya]     = useState('');
  const [apathya,   setApathya]   = useState('');
  const [notes,     setNotes]     = useState('');
  const [allMedicines, setAllMedicines] = useState([]);

  // Pre-load the full medicine list once so the native datalist is populated
  useEffect(() => {
    getAllInventory()
      .then(setAllMedicines)
      .catch(err => {
        console.error('Failed to load medicines for autocomplete:', err.message);
        if (err.code === 'permission-denied') {
          console.warn(
            'Firestore rules are blocking reads.\n' +
            'Go to Firebase Console → Firestore Database → Rules and set:\n' +
            'allow read, write: if true;'
          );
        }
      });
  }, []);

  // ── Modal helpers ────────────────────────────────────────────────────────
  const showAlert   = (title, message, type = 'info') =>
    setModalConfig({ isOpen: true, title, message, type, showConfirm: false, onConfirm: null });
  const showConfirm = (title, message, onConfirm, type = 'warning') =>
    setModalConfig({ isOpen: true, title, message, type, showConfirm: true, onConfirm });
  const closeModal  = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  // ── Medicine row helpers ──────────────────────────────────────────────────
  const addMedicineRow = () => {
    const newId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1;
    setMedicines(prev => [...prev, { id: newId, name: '', timing: '', anupan: '', days: 7 }]);
  };

  const removeMedicineRow = (id) => setMedicines(prev => prev.filter(m => m.id !== id));

  const updateMedicineField = (id, field, value) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!patientData.name.trim()) {
      showAlert('Missing Information', 'Please enter the patient name.', 'warning');
      return;
    }
    if (medicines.length === 0 || medicines.every(m => !m.name.trim())) {
      showAlert('Missing Information', 'Add at least one medicine.', 'warning');
      return;
    }

    showConfirm(
      'Save Prescription',
      `Save prescription for ${patientData.name}?`,
      async () => {
        closeModal();
        setLoading(true);
        try {
          // 1. Get existing patient or create a new one (dedup by exact name)
          const patient = await getOrCreatePatient({
            name:    patientData.name.trim(),
            age:     patientData.age,
            gender:  patientData.gender,
            contact: patientData.phone || 'Not provided',
            address: patientData.address,
          });

          // 2. Save prescription (atomic transaction: writes doc + updates patient)
          await createPrescription(patient.id, {
            diagnosis: patientData.diagnosis,
            medicines,
            pathya,
            apathya,
            notes,
          });

          showAlert('Saved', `Prescription saved for ${patient.name}`, 'success');
        } catch (err) {
          console.error(err);
          showAlert('Error', err.message || 'Failed to save prescription', 'danger');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // ── New ──────────────────────────────────────────────────────────────────
  const handleNew = () => {
    showConfirm('New Prescription', 'Start a new prescription? Current data will be lost.', () => {
      closeModal();
      setPatientData({ name: '', age: '', gender: 'Male', phone: '', address: '', diagnosis: '' });
      setMedicines([{ id: 1, name: '', timing: '', anupan: '', days: 7 }]);
      setPathya(''); setApathya(''); setNotes('');
    });
  };

  // ── Download PDF ─────────────────────────────────────────────────────────
  const handleDownload = () => {
    html2pdf().set({
      margin: 0,
      filename: `${patientData.name || 'Prescription'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2.5, useCORS: true, logging: false, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(document.getElementById('prescription-preview')).save();
  };

  // ── Modal icon map ────────────────────────────────────────────────────────
  const modalStyle = {
    success: { bg: 'rgba(5,150,105,0.1)',   color: '#059669', icon: <CheckCircle size={28} /> },
    danger:  { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626', icon: <AlertCircle  size={28} /> },
    warning: { bg: 'rgba(217,119,6,0.1)',   color: '#d97706', icon: <HelpCircle   size={28} /> },
    info:    { bg: 'rgba(14,165,233,0.1)',  color: '#0ea5e9', icon: <AlertCircle  size={28} /> },
  }[modalConfig.type] ?? {};

  const pd = patientData;

  return (
    <div className="layout-rx animate-fade-in">

      {/* ── Left: Builder ───────────────────────────────────────── */}
      <div className="layout-rx-form">
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <div>
            <h1 className="page-title">Digital Prescription</h1>
            <p className="page-subtitle">Generate smart Ayurvedic prescriptions</p>
          </div>
          <button className="btn btn-primary" onClick={handleNew}><Plus size={18} /> New</button>
        </div>

        <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Patient info – row 1 */}
          <div className="rx-patient-grid">
            {[
              { label: 'Patient Name',       key: 'name',     type: 'text',   placeholder: 'Full name' },
              { label: 'Age',                key: 'age',      type: 'number', placeholder: 'Years' },
              { label: 'Phone (WhatsApp)',   key: 'phone',    type: 'number', placeholder: '9876543210' },
            ].map(f => (
              <div key={f.key} className="input-group">
                <label className="input-label">{f.label}</label>
                <input type={f.type} className="input-field" placeholder={f.placeholder}
                  value={pd[f.key]} onChange={e => setPatientData({ ...pd, [f.key]: e.target.value })} />
              </div>
            ))}
            <div className="input-group">
              <label className="input-label">Gender</label>
              <select className="input-field" value={pd.gender}
                onChange={e => setPatientData({ ...pd, gender: e.target.value })}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>

          {/* Patient info – row 2 */}
          <div className="rx-two-col">
            <div className="input-group">
              <label className="input-label">Address</label>
              <input type="text" className="input-field" placeholder="Patient's address"
                value={pd.address} onChange={e => setPatientData({ ...pd, address: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">Disease / Diagnosis</label>
              <input type="text" className="input-field" placeholder="e.g. Amlapitta"
                value={pd.diagnosis} onChange={e => setPatientData({ ...pd, diagnosis: e.target.value })} />
            </div>
          </div>

          {/* Medicines table */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
            <div className="section-header">
              <h3 className="section-title"><Pill size={18} color="var(--primary)" /> Recommended Medicines</h3>
              <button className="btn btn-secondary btn-sm" onClick={addMedicineRow}>
                <Plus size={15} /> Add Row
              </button>
            </div>

            {/* Native datalist — not clipped by any overflow container */}
            <datalist id="med-suggestions">
              {allMedicines.map(m => (
                <option key={m.id} value={m.medicineName} />
              ))}
            </datalist>

            <div className="table-container">
              <table className="data-table med-table">
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Medicine</th>
                    <th>Timing</th>
                    <th>Anupan</th>
                    <th style={{ width: '70px' }}>Days</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map(med => (
                    <tr key={med.id}>
                      <td data-label="Medicine">
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Search medicine…"
                          list="med-suggestions"
                          value={med.name}
                          onChange={e => updateMedicineField(med.id, 'name', e.target.value)}
                        />
                      </td>
                      <td data-label="Timing">
                        <input type="text" className="input-field" placeholder="e.g. BD" value={med.timing}
                          onChange={e => updateMedicineField(med.id, 'timing', e.target.value)} />
                      </td>
                      <td data-label="Anupan">
                        <input type="text" className="input-field" placeholder="e.g. Honey" value={med.anupan}
                          onChange={e => updateMedicineField(med.id, 'anupan', e.target.value)} />
                      </td>
                      <td data-label="Days">
                        <input type="number" className="input-field" value={med.days}
                          onChange={e => updateMedicineField(med.id, 'days', e.target.value)} />
                      </td>
                      <td data-label="">
                        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }}
                          onClick={() => removeMedicineRow(med.id)}>
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pathya / Apathya */}
          <div className="rx-two-col">
            <div className="input-group">
              <label className="input-label">Pathya (Do's)</label>
              <textarea className="input-field" rows={3} placeholder="Dietary instructions…"
                value={pathya} onChange={e => setPathya(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Apathya (Don'ts)</label>
              <textarea className="input-field" rows={3} placeholder="Foods to avoid…"
                value={apathya} onChange={e => setApathya(e.target.value)} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Doctor Notes</label>
            <textarea className="input-field" rows={2} placeholder="Additional instructions…"
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ── Right: Live Preview ──────────────────────────────────── */}
      <div className="layout-rx-preview no-print">
        <div id="prescription-preview" className="glass-panel"
          style={{ flex: 1, background: '#fff', color: '#111', padding: '28px', overflowY: 'auto' }}>

          {/* Clinic header */}
          <div style={{ borderBottom: '2px solid #059669', paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ color: '#059669', margin: 0, fontSize: '1.1rem' }}>Sanjivani Clinic</h2>
              <div style={{ fontSize: '0.85rem', color: '#333', fontWeight: 'bold', marginTop: '2px' }}>Dr. Dharmesh C. Sapovadiya</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Qualification: B.A.M.S.</div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.85rem' }}>SC</div>
          </div>

          {/* Patient info */}
          <div style={{ fontSize: '0.82rem', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><strong>Name:</strong> {pd.name || '---'}</div>
              <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
            </div>
            <div><strong>Age / Gender:</strong> {pd.age || '--'} / {pd.gender}</div>
            {pd.phone    && <div><strong>Mobile:</strong> {pd.phone}</div>}
            <div><strong>Address:</strong> {pd.address || 'Not specified'}</div>
            {pd.diagnosis && <div style={{ marginTop: '6px', color: '#059669' }}><strong>Diagnosis:</strong> {pd.diagnosis}</div>}
          </div>

          {/* Medicines */}
          <div style={{ color: '#059669', borderBottom: '1px solid #059669', display: 'inline-block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
            Advised Medicines
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: '#333', lineHeight: 1.9 }}>
            {medicines.map(m => (
              <li key={m.id} style={{ marginBottom: '6px' }}>
                <strong>{m.name || 'Medicine Name'}</strong>
                <div style={{ fontSize: '0.78rem', color: '#666' }}>
                  {m.timing} {m.anupan ? `with ${m.anupan}` : ''} · {m.days} days
                </div>
              </li>
            ))}
          </ul>

          {/* Diet / Notes */}
          {(pathya || apathya || notes) && (
            <div style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '14px', fontSize: '0.82rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {pathya  && <div><strong>Pathya (Do's):</strong> {pathya}</div>}
              {apathya && <div><strong>Apathya (Don'ts):</strong> {apathya}</div>}
              {notes   && <div style={{ fontStyle: 'italic' }}><strong>Notes:</strong> {notes}</div>}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleSave} disabled={loading}>
            {loading ? <><Loader2 className="animate-spin" size={16} /> Saving…</> : <><Save size={16} /> Save</>}
          </button>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleDownload}>
            <Download size={16} /> PDF
          </button>
          <button className="btn btn-primary" style={{ gridColumn: 'span 2', background: '#25D366', width: '100%' }}>
            <Send size={16} /> Send via WhatsApp
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        footer={
          modalConfig.showConfirm ? (
            <>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className={`btn ${modalConfig.type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={modalConfig.onConfirm}>Confirm</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={closeModal}>Okay</button>
          )
        }
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: modalStyle.bg, color: modalStyle.color }}>
            {modalStyle.icon}
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>
            {modalConfig.message}
          </div>
        </div>
      </Modal>
    </div>
  );
}
