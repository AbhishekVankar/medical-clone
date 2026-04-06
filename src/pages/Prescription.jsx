import { useState, useEffect, useMemo } from 'react';
import { Save, Send, Pill, Plus, X, Loader2, Download, AlertCircle, CheckCircle, HelpCircle, FlaskConical, Zap, Leaf } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import html2pdf from 'html2pdf.js';
import Modal from '../components/Modal';
import { getOrCreatePatient } from '../services/patientService';
import { createPrescription }  from '../services/prescriptionService';
import { getAllInventory, quickAddMedicine } from '../services/inventoryService';
import { getAllDiseases, addDisease }        from '../services/diseaseService';

// Shared react-select styles that match .input-field
const rxSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '42px',
    background: state.isDisabled ? '#f8fafc' : '#ffffff',
    border: `1.5px solid ${state.isFocused ? '#059669' : '#cbd5e1'}`,
    borderRadius: '8px',
    boxShadow: state.isFocused
      ? '0 0 0 3px rgba(5,150,105,0.12), 0 1px 2px rgba(0,0,0,0.04)'
      : '0 1px 2px rgba(0,0,0,0.04)',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    cursor: 'pointer',
    '&:hover': { borderColor: state.isFocused ? '#059669' : '#94a3b8' },
  }),
  valueContainer: (base) => ({ ...base, padding: '2px 14px' }),
  singleValue: (base) => ({ ...base, color: '#0f172a', fontSize: '0.9rem' }),
  placeholder: (base) => ({ ...base, color: '#94a3b8', fontSize: '0.9rem' }),
  input: (base) => ({ ...base, color: '#0f172a', fontSize: '0.9rem', margin: 0, padding: 0 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: '#64748b', padding: '0 10px' }),
  clearIndicator: (base) => ({ ...base, color: '#64748b', padding: '0 6px' }),
  menu: (base) => ({
    ...base,
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
    zIndex: 9999,
    overflow: 'hidden',
  }),
  menuList: (base) => ({ ...base, padding: '4px' }),
  option: (base, state) => ({
    ...base,
    borderRadius: '6px',
    fontSize: '0.875rem',
    padding: '8px 12px',
    background: state.isSelected
      ? '#059669'
      : state.isFocused
      ? '#ecfdf5'
      : 'transparent',
    color: state.isSelected ? '#fff' : '#0f172a',
    cursor: 'pointer',
  }),
  noOptionsMessage: (base) => ({ ...base, fontSize: '0.875rem', color: '#64748b' }),
};

const LAB_REPORT_TYPES = [
  'Blood Test',
  'Urine Test',
  'Stool Test',
  'Sonography',
  'X-Ray',
  'ECG',
  'Echo',
  'CT Scan',
  'MRI',
  'Biopsy',
  'Allergy Test',
  'Mammography',
  'CA (Carcinoma Antigen)',
  'PET CT Scan',
  'EEG',
  'Other',
];

export default function Prescription() {
  const [loading, setLoading]           = useState(false);
  const [whatsappLoading, setWaLoading] = useState(false);
  const [saved, setSaved]               = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, title: '', message: '', type: 'info', onConfirm: null, showConfirm: false,
  });

  const [patientData, setPatientData] = useState({
    name: '', age: '', gender: 'Male', phone: '', address: '', diagnosis: '', symptoms: '',
  });
  const [vitals, setVitals] = useState({ bp: '', pulse: '', o2: '', weight: '', sugar: '', temperature: '' });

  const [medicines, setMedicines]      = useState([{ id: 1, name: '', medType: 'allopathy', timing: '', anupan: '', days: 7, dose: '', doseUnit: 'mg', selectedReactions: [], customReactions: [] }]);
  const [customReactionInputs, setCustomReactionInputs] = useState({});
  const [pathya,    setPathya]         = useState('');
  const [apathya,   setApathya]       = useState('');
  const [notes,     setNotes]         = useState('');
  const [allMedicines, setAllMedicines] = useState([]);
  const [allDiseases,  setAllDiseases]  = useState([]);

  // Lab Reports state
  const [labReports, setLabReports]       = useState([]);
  const [selectedLabType, setSelectedLabType] = useState('');
  const [labNote, setLabNote]             = useState('');

  // Pre-load medicines and diseases once
  useEffect(() => {
    getAllInventory()
      .then(setAllMedicines)
      .catch(err => {
        console.error('Failed to load medicines:', err.message);
        if (err.code === 'permission-denied') {
          console.warn('Firestore rules blocking reads. Set: allow read, write: if true;');
        }
      });
    getAllDiseases()
      .then(setAllDiseases)
      .catch(err => console.error('Failed to load diseases:', err.message));
  }, []);

  // Map medicineName → sideEffects for O(1) lookup
  const medicineEffectsMap = useMemo(() => {
    const map = new Map();
    for (const m of allMedicines) {
      if (m.sideEffects?.length) map.set(m.medicineName.toLowerCase(), m.sideEffects);
    }
    return map;
  }, [allMedicines]);

  const getSideEffects = (name) => medicineEffectsMap.get(name.toLowerCase()) ?? [];

  const allopathyOptions = useMemo(
    () => allMedicines.filter(m => m.type === 'allopathy').map(m => ({ value: m.medicineName, label: m.medicineName })),
    [allMedicines]
  );
  const ayurvedicOptions = useMemo(
    () => allMedicines.filter(m => m.type === 'ayurvedic').map(m => ({ value: m.medicineName, label: m.medicineName })),
    [allMedicines]
  );
  const diseaseOptions = useMemo(
    () => allDiseases.map(d => ({ value: d.name, label: d.name })),
    [allDiseases]
  );
  const labTypeOptions  = LAB_REPORT_TYPES.map(t => ({ value: t, label: t }));
  const doseUnitOptions = [{ value: 'mg', label: 'mg' }, { value: 'ml', label: 'ml' }];

  // Limit medicine suggestions to 40 to stay snappy with large lists
  const medFilterOption = (option, inputValue) => {
    if (!inputValue) return false;
    return option.label.toLowerCase().includes(inputValue.toLowerCase());
  };

  // ── Modal helpers ────────────────────────────────────────────────────────
  const showAlert   = (title, message, type = 'info') =>
    setModalConfig({ isOpen: true, title, message, type, showConfirm: false, onConfirm: null });
  const showConfirm = (title, message, onConfirm, type = 'warning') =>
    setModalConfig({ isOpen: true, title, message, type, showConfirm: true, onConfirm });
  const closeModal  = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  // ── Medicine row helpers ──────────────────────────────────────────────────
  const addMedicineRow = (medType = 'allopathy') => {
    const newId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1;
    setMedicines(prev => [...prev, { id: newId, name: '', medType, timing: '', anupan: '', days: 7, dose: '', doseUnit: 'mg', selectedReactions: [], customReactions: [] }]);
  };

  const removeMedicineRow = (id) => setMedicines(prev => prev.filter(m => m.id !== id));

  const updateMedicineField = (id, field, value) => {
    setMedicines(prev => prev.map(m => {
      if (m.id !== id) return m;
      const updated = { ...m, [field]: value };
      // Clear selected reactions when medicine name changes
      if (field === 'name') updated.selectedReactions = [];
      return updated;
    }));
  };

  const toggleReaction = (medId, reaction) => {
    setMedicines(prev => prev.map(m => {
      if (m.id !== medId) return m;
      const sel = m.selectedReactions ?? [];
      return {
        ...m,
        selectedReactions: sel.includes(reaction)
          ? sel.filter(r => r !== reaction)
          : [...sel, reaction],
      };
    }));
  };

  const addCustomReaction = (medId) => {
    const text = (customReactionInputs[medId] || '').trim();
    if (!text) return;
    setMedicines(prev => prev.map(m => {
      if (m.id !== medId) return m;
      const alreadyExists = [...(m.customReactions ?? []), ...(getSideEffects(m.name))].some(
        r => r.toLowerCase() === text.toLowerCase()
      );
      if (alreadyExists) return m;
      return {
        ...m,
        customReactions: [...(m.customReactions ?? []), text],
        selectedReactions: [...(m.selectedReactions ?? []), text],
      };
    }));
    setCustomReactionInputs(prev => ({ ...prev, [medId]: '' }));
  };

  // ── Lab report helpers ───────────────────────────────────────────────────
  const addLabReport = () => {
    if (!selectedLabType) return;
    setLabReports(prev => [...prev, { id: Date.now(), type: selectedLabType, remarks: '' }]);
    setSelectedLabType('');
  };
  const removeLabReport  = (id)          => setLabReports(prev => prev.filter(r => r.id !== id));
  const updateLabRemarks = (id, remarks) => setLabReports(prev => prev.map(r => r.id === id ? { ...r, remarks } : r));

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
          const patient = await getOrCreatePatient({
            name:    patientData.name.trim(),
            age:     patientData.age,
            gender:  patientData.gender,
            contact: patientData.phone || 'Not provided',
            address: patientData.address,
          });

          await createPrescription(patient.id, {
            diagnosis: patientData.diagnosis,
            medicines,
            pathya,
            apathya,
            notes,
            labReports,
          });

          setSaved(true);
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
      setPatientData({ name: '', age: '', gender: 'Male', phone: '', address: '', diagnosis: '', symptoms: '' });
      setVitals({ bp: '', pulse: '', o2: '', weight: '', sugar: '', temperature: '' });
      setMedicines([{ id: 1, name: '', medType: 'allopathy', timing: '', anupan: '', days: 7, dose: '', doseUnit: 'mg', selectedReactions: [], customReactions: [] }]);
      setCustomReactionInputs({});
      setPathya(''); setApathya(''); setNotes('');
      setLabReports([]); setSelectedLabType(''); setLabNote('');
      setSaved(false);
    });
  };

  // ── Shared PDF options ───────────────────────────────────────────────────
  const pdfOptions = {
    margin: 0,
    filename: `${patientData.name || 'Prescription'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true, logging: false, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  // ── Download PDF ─────────────────────────────────────────────────────────
  const handleDownload = () => {
    html2pdf().set(pdfOptions).from(document.getElementById('prescription-preview')).save();
  };

  // ── Send via WhatsApp ────────────────────────────────────────────────────
  const handleWhatsApp = async () => {
    const digits = (patientData.phone || '').replace(/\D/g, '');
    if (digits.length < 10) {
      showAlert('Phone Number Required', 'Please fill in the patient\'s phone number before sending via WhatsApp.', 'warning');
      return;
    }

    setWaLoading(true);
    try {
      const filename = `${patientData.name || 'Prescription'}.pdf`;

      const blob = await html2pdf()
        .set(pdfOptions)
        .from(document.getElementById('prescription-preview'))
        .outputPdf('blob');

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      // Open patient's WhatsApp chat
      const phone = digits.startsWith('91') ? digits : `91${digits}`;
      const text  = encodeURIComponent(`Prescription for ${patientData.name || 'patient'}`);
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    } catch (err) {
      console.error(err);
      showAlert('Error', err.message || 'Failed to generate PDF.', 'danger');
    } finally {
      setWaLoading(false);
    }
  };

  // ── Modal icon map ────────────────────────────────────────────────────────
  const modalStyle = {
    success: { bg: 'rgba(5,150,105,0.1)',   color: '#059669', icon: <CheckCircle size={28} /> },
    danger:  { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626', icon: <AlertCircle  size={28} /> },
    warning: { bg: 'rgba(217,119,6,0.1)',   color: '#d97706', icon: <HelpCircle   size={28} /> },
    info:    { bg: 'rgba(14,165,233,0.1)',  color: '#0ea5e9', icon: <AlertCircle  size={28} /> },
  }[modalConfig.type] ?? {};

  const pd = patientData;

  // All medicines that have a name — doctor can always add custom reactions
  const medicinesWithEffects = medicines.filter(m => m.name.trim());

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
              <CreatableSelect
                styles={rxSelectStyles}
                options={diseaseOptions}
                value={pd.diagnosis ? { value: pd.diagnosis, label: pd.diagnosis } : null}
                onChange={opt => setPatientData({ ...pd, diagnosis: opt ? opt.value : '' })}
                onCreateOption={async (name) => {
                  const entry = await addDisease(name);
                  setAllDiseases(prev => [...prev, entry].sort((a, b) => a.name.localeCompare(b.name)));
                  setPatientData({ ...pd, diagnosis: entry.name });
                }}
                formatCreateLabel={(val) => `Add "${val}" as new disease`}
                placeholder="e.g. Amlapitta"
                isClearable
                isSearchable
              />
            </div>
          </div>

          {/* Symptoms */}
          <div className="input-group">
            <label className="input-label">Symptoms</label>
            <textarea className="input-field" rows={2} placeholder="e.g. Headache, fever, nausea, stomach pain…"
              value={pd.symptoms} onChange={e => setPatientData({ ...pd, symptoms: e.target.value })} />
          </div>

          {/* ── Vitals ──────────────────────────────────────────── */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div className="section-header" style={{ marginBottom: '10px' }}>
              <h3 className="section-title" style={{ fontSize: '0.9rem' }}>Vitals</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { label: 'BP',          key: 'bp',          placeholder: '120/80',  unit: 'mmHg' },
                { label: 'Pulse',       key: 'pulse',       placeholder: '72',      unit: 'bpm'  },
                { label: 'O₂ Sat',      key: 'o2',          placeholder: '98',      unit: '%'    },
                { label: 'Weight',      key: 'weight',      placeholder: '65',      unit: 'kg'   },
                { label: 'Sugar',       key: 'sugar',       placeholder: '110',     unit: 'mg/dL'},
                { label: 'Temperature', key: 'temperature', placeholder: '98.6',    unit: '°F'   },
              ].map(v => (
                <div key={v.key} className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">
                    {v.label} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({v.unit})</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={v.placeholder}
                    value={vitals[v.key]}
                    onChange={e => setVitals(prev => ({ ...prev, [v.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Medicines table ─────────────────────────────────── */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
            <div className="section-header">
              <h3 className="section-title"><Pill size={18} color="var(--primary)" /> Recommended Medicines</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => addMedicineRow('allopathy')}>
                  <Plus size={15} /> Allopathy
                </button>
                <button className="btn btn-secondary btn-sm" style={{ color: 'var(--success, #059669)', borderColor: 'var(--success, #059669)' }} onClick={() => addMedicineRow('ayurvedic')}>
                  <Leaf size={15} /> Ayurvedic
                </button>
              </div>
            </div>


            <div className="table-container">
              <table className="data-table med-table">
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Medicine</th>
                    <th>Timing</th>
                    <th>Anupan</th>
                    <th style={{ width: '70px' }}>Days</th>
                    <th style={{ width: '110px' }}>Dose</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map(med => (
                    <tr key={med.id} style={{ verticalAlign: 'bottom' }}>
                      <td data-label="Medicine">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {med.medType === 'ayurvedic'
                              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 600, color: '#059669', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: '4px', padding: '1px 6px', whiteSpace: 'nowrap' }}><Leaf size={10} /> Ayurvedic</span>
                              : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-surface)', border: '1px solid var(--primary-border)', borderRadius: '4px', padding: '1px 6px', whiteSpace: 'nowrap' }}><FlaskConical size={10} /> Allopathy</span>
                            }
                          </div>
                          <CreatableSelect
                            styles={rxSelectStyles}
                            options={med.medType === 'ayurvedic' ? ayurvedicOptions : allopathyOptions}
                            value={med.name ? { value: med.name, label: med.name } : null}
                            onChange={opt => updateMedicineField(med.id, 'name', opt ? opt.value : '')}
                            onCreateOption={async (name) => {
                              const entry = await quickAddMedicine(name, med.medType);
                              setAllMedicines(prev => [...prev, entry].sort((a, b) => a.medicineName.localeCompare(b.medicineName)));
                              updateMedicineField(med.id, 'name', entry.medicineName);
                            }}
                            filterOption={medFilterOption}
                            formatCreateLabel={(val) => `Add "${val}" as new ${med.medType} medicine`}
                            noOptionsMessage={({ inputValue }) => inputValue.length < 2 ? 'Type at least 2 characters…' : 'No medicines found'}
                            placeholder="Search medicine…"
                            isClearable
                            isSearchable
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                          />
                        </div>
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
                          onChange={e => updateMedicineField(med.id, 'days', e.target.value)}
                          style={{ minWidth: '64px', width: '64px' }} />
                      </td>
                      <td data-label="Dose">
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input
                            type="number"
                            className="input-field"
                            placeholder="0"
                            value={med.dose}
                            onChange={e => updateMedicineField(med.id, 'dose', e.target.value)}
                            style={{ width: '55px' }}
                          />
                          <CreatableSelect
                            styles={{
                              ...rxSelectStyles,
                              control: (base, state) => ({
                                ...rxSelectStyles.control(base, state),
                                minWidth: '80px',
                                minHeight: '42px',
                              }),
                              valueContainer: (base) => ({ ...base, padding: '2px 8px' }),
                              dropdownIndicator: (base) => ({ ...base, padding: '0 6px' }),
                            }}
                            options={doseUnitOptions}
                            value={{ value: med.doseUnit, label: med.doseUnit }}
                            onChange={opt => updateMedicineField(med.id, 'doseUnit', opt.value)}
                            isSearchable={false}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                          />
                        </div>
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

          {/* ── Drug Reactions / Side Effects ───────────────────── */}
          {medicinesWithEffects.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
              <div className="section-header" style={{ marginBottom: '12px' }}>
                <h3 className="section-title">
                  <Zap size={18} color="var(--warning, #d97706)" />
                  <span style={{ color: 'var(--warning, #d97706)' }}>Drug Reactions / Side Effects</span>
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Select or add reactions observed</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {medicinesWithEffects.map(med => {
                  const presetEffects = getSideEffects(med.name);
                  const customEffects = med.customReactions ?? [];
                  const allEffects = [...presetEffects, ...customEffects.filter(c => !presetEffects.includes(c))];
                  return (
                    <div key={med.id} className="drug-reaction-card">
                      <div className="drug-reaction-header">
                        <span className="drug-reaction-medicine">{med.name}</span>
                        {med.selectedReactions.length > 0 && (
                          <span className="drug-reaction-count">{med.selectedReactions.length} selected</span>
                        )}
                      </div>

                      {allEffects.length > 0 && (
                        <div className="reaction-chips">
                          {allEffects.map(effect => (
                            <button
                              key={effect}
                              type="button"
                              className={`reaction-chip${med.selectedReactions.includes(effect) ? ' selected' : ''}${customEffects.includes(effect) ? ' custom' : ''}`}
                              onClick={() => toggleReaction(med.id, effect)}
                            >
                              {effect}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* ── Add custom reaction ── */}
                      <div className="reaction-add-row">
                        <input
                          type="text"
                          className="input-field reaction-add-input"
                          placeholder="Add a reaction…"
                          value={customReactionInputs[med.id] || ''}
                          onChange={e => setCustomReactionInputs(prev => ({ ...prev, [med.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomReaction(med.id); }}}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => addCustomReaction(med.id)}
                          disabled={!(customReactionInputs[med.id] || '').trim()}
                        >
                          <Plus size={14} /> Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Lab Reports / Investigations ────────────────────── */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
            <div className="section-header" style={{ marginBottom: '12px' }}>
              <h3 className="section-title">
                <FlaskConical size={18} color="var(--primary)" /> Lab Reports / Investigations
              </h3>
            </div>

            {/* Add report row */}
            <div className="lab-add-row">
              <CreatableSelect
                styles={rxSelectStyles}
                options={labTypeOptions}
                value={selectedLabType ? { value: selectedLabType, label: selectedLabType } : null}
                onChange={opt => setSelectedLabType(opt ? opt.value : '')}
                placeholder="— Select investigation —"
                isClearable
                isSearchable={false}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addLabReport}
                disabled={!selectedLabType}
              >
                <Plus size={15} /> Add
              </button>
            </div>
            <div className="input-group" style={{ marginTop: '10px' }}>
              <label className="input-label">Lab Note</label>
              <input type="text" className="input-field" placeholder="e.g. Fasting required, STAT, repeat after 2 weeks…"
                value={labNote} onChange={e => setLabNote(e.target.value)} />
            </div>

            {/* Selected lab reports list */}
            {labReports.length > 0 && (
              <div className="lab-reports-list">
                {labReports.map((report, idx) => (
                  <div key={report.id} className="lab-report-card">
                    <div className="lab-report-header">
                      <div className="lab-report-index">{idx + 1}</div>
                      <span className="lab-report-type">{report.type}</span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        style={{ color: 'var(--danger)', marginLeft: 'auto' }}
                        onClick={() => removeLabReport(report.id)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <input
                      type="text"
                      className="input-field lab-report-remarks"
                      placeholder="Remarks (e.g. Fasting required, Urgent)"
                      value={report.remarks}
                      onChange={e => updateLabRemarks(report.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
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
          <div style={{ borderBottom: '2px solid #059669', paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ color: '#059669', margin: 0, fontSize: '1.1rem' }}>Sanjivani Clinic</h2>
              <div style={{ fontSize: '0.85rem', color: '#333', fontWeight: 'bold', marginTop: '2px' }}>Dr. Dharmesh C. Sapovadiya</div>
              <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '1px' }}>BAMS</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#555', lineHeight: 1.7 }}>
              <div>9426932694</div>
              <div>9:30 AM – 1:30 PM</div>
              <div>5:00 PM – 9:30 PM</div>
            </div>
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
            {pd.symptoms  && <div style={{ marginTop: '4px' }}><strong>Symptoms:</strong> {pd.symptoms}</div>}
          </div>

          {/* Vitals in preview */}
          {Object.values(vitals).some(v => v.trim()) && (() => {
            const vitalLabels = { bp: 'BP', pulse: 'Pulse', o2: 'O₂ Sat', weight: 'Weight', sugar: 'Sugar', temperature: 'Temp' };
            const vitalUnits  = { bp: 'mmHg', pulse: 'bpm', o2: '%', weight: 'kg', sugar: 'mg/dL', temperature: '°F' };
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                {Object.entries(vitals).filter(([, v]) => v.trim()).map(([key, val]) => (
                  <div key={key} style={{ fontSize: '0.78rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '3px 10px', color: '#065f46' }}>
                    <span style={{ fontWeight: 600 }}>{vitalLabels[key]}:</span> {val} {vitalUnits[key]}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Medicines */}
          <div style={{ color: '#059669', borderBottom: '1px solid #059669', display: 'inline-block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
            Advised Medicines
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: '#333', lineHeight: 1.9 }}>
            {medicines.map(m => (
              <li key={m.id} style={{ marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <strong>{m.name || 'Medicine Name'}</strong>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: m.medType === 'ayurvedic' ? '#059669' : '#6366f1', background: m.medType === 'ayurvedic' ? 'rgba(5,150,105,0.08)' : 'rgba(99,102,241,0.08)', border: `1px solid ${m.medType === 'ayurvedic' ? 'rgba(5,150,105,0.25)' : 'rgba(99,102,241,0.25)'}`, borderRadius: '4px', padding: '0px 5px' }}>
                    {m.medType === 'ayurvedic' ? 'Ayurvedic' : 'Allopathy'}
                  </span>
                </span>
                <div style={{ fontSize: '0.78rem', color: '#666' }}>
                  {m.timing} {m.anupan ? `with ${m.anupan}` : ''} · {m.days} days{m.dose ? ` · ${m.dose} ${m.doseUnit}` : ''}
                </div>
                {m.selectedReactions.length > 0 && (
                  <div style={{ fontSize: '0.74rem', color: '#b45309', marginTop: '2px' }}>
                    Reactions: {m.selectedReactions.join(', ')}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Lab Reports in preview */}
          {labReports.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ color: '#059669', borderBottom: '1px solid #059669', display: 'inline-block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                Investigations Advised
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#333', lineHeight: 1.8 }}>
                {labReports.map((r, i) => (
                  <li key={r.id}>
                    {r.type}
                    {r.remarks && <span style={{ color: '#666', fontStyle: 'italic' }}> — {r.remarks}</span>}
                  </li>
                ))}
              </ul>
              {labNote && <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#555', fontStyle: 'italic' }}><strong>Note:</strong> {labNote}</div>}
            </div>
          )}

          {/* Diet / Notes */}
          {(pathya || apathya || notes) && (
            <div style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '14px', fontSize: '0.82rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {pathya  && <div><strong>Pathya (Do's):</strong> {pathya}</div>}
              {apathya && <div><strong>Apathya (Don'ts):</strong> {apathya}</div>}
              {notes   && <div style={{ fontStyle: 'italic' }}><strong>Notes:</strong> {notes}</div>}
            </div>
          )}

          {/* Signature block */}
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'center', minWidth: '160px' }}>
              <div style={{ borderTop: '1px solid #333', paddingTop: '6px', fontSize: '0.78rem', color: '#333', fontWeight: 600 }}>
                Dr. Dharmesh C. Sapovadiya
              </div>
              <div style={{ fontSize: '0.7rem', color: '#666' }}>BAMS</div>
            </div>
          </div>
        </div>

        {/* Saved banner */}
        {saved && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            padding: '12px 16px',
            background: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#15803d',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} /> Prescription saved — download your PDF now
            </span>
            <button
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              onClick={handleDownload}
            >
              <Download size={14} /> Download PDF
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleSave} disabled={loading}>
            {loading ? <><Loader2 className="animate-spin" size={16} /> Saving…</> : <><Save size={16} /> Save</>}
          </button>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleDownload}>
            <Download size={16} /> PDF
          </button>
          <button
            className="btn btn-primary"
            style={{ gridColumn: 'span 2', background: '#25D366', border: 'none', width: '100%' }}
            onClick={handleWhatsApp}
            disabled={whatsappLoading}
          >
            {whatsappLoading
              ? <><Loader2 className="animate-spin" size={16} /> Preparing…</>
              : <><Send size={16} /> Send via WhatsApp</>
            }
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
