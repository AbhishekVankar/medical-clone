import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, History, Download, ArrowLeft, Loader2, Activity } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { getPatientWithHistory } from '../services/patientService';

export default function PatientHistory() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [patient,   setPatient]  = useState(null);
  const [loading,   setLoading]  = useState(true);
  const [error,     setError]    = useState(null);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Single call: fetches patient doc + prescriptions query in parallel
      const data = await getPatientWithHistory(id);
      setPatient(data);
    } catch (err) {
      console.error('Failed to load patient history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (record) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding:40px;font-family:sans-serif;color:#333;line-height:1.6">
        <div style="border-bottom:2px solid #059669;padding-bottom:16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <h2 style="color:#059669;margin:0">Sanjivani Clinic</h2>
            <div style="font-size:.9rem;font-weight:bold;margin-top:4px">Dr. Dharmesh C. Sapovadiya</div>
            <div style="font-size:.8rem;color:#666;margin-top:2px">Qualification: B.A.M.S.</div>
          </div>
          <div style="width:40px;height:40px;border-radius:50%;background:#059669;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:20px">SC</div>
        </div>
        <div style="margin-bottom:20px;display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding-bottom:10px">
          <div><strong>Name:</strong> ${patient.name}</div>
          <div><strong>Date:</strong> ${new Date(record.createdAt).toLocaleDateString()}</div>
        </div>
        <h3 style="color:#059669;border-bottom:1px solid #059669;display:inline-block">Advised Medicines</h3>
        <ul style="padding-left:20px">
          ${(Array.isArray(record.medicines) ? record.medicines : []).map(m => `
            <li style="margin-bottom:8px">
              <strong>${m.name}</strong>
              <div style="font-size:.85rem;color:#666">${m.timing || ''} ${m.anupan ? `with ${m.anupan}` : ''} · ${m.days} days</div>
            </li>`).join('')}
        </ul>
        <div style="margin-top:30px;border-top:1px dashed #ccc;padding-top:16px;font-size:.9rem">
          ${record.pathya  ? `<div><strong>Pathya:</strong> ${record.pathya}</div>` : ''}
          ${record.apathya ? `<div style="margin-top:4px"><strong>Apathya:</strong> ${record.apathya}</div>` : ''}
          ${record.notes   ? `<div style="margin-top:8px;font-style:italic"><strong>Notes:</strong> ${record.notes}</div>` : ''}
        </div>
      </div>`;

    html2pdf().set({
      margin: 0,
      filename: `${patient.name}_${new Date(record.createdAt).toLocaleDateString()}.pdf`,
      image:    { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2.5, useCORS: true, logging: false, backgroundColor: '#ffffff' },
      jsPDF:    { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(element).save();
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="loader-container" style={{ height: '60vh' }}>
      <Loader2 className="loader-icon" size={46} />
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Opening Medical History…</p>
    </div>
  );

  // ── Not found ────────────────────────────────────────────────────────────
  if (!patient || error) return (
    <div className="animate-fade-in empty-state" style={{ height: '60vh' }}>
      <User size={48} />
      <p>{error || 'Patient record not found.'}</p>
      <button className="btn btn-primary" style={{ marginTop: '8px' }} onClick={() => navigate('/patients')}>
        <ArrowLeft size={16} /> Back to Patients
      </button>
    </div>
  );

  const sorted = [...(patient.prescriptions ?? [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button className="btn btn-secondary btn-icon" onClick={() => navigate('/patients')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">{patient.name}</h1>
            <p className="page-subtitle">Medical History Timeline</p>
          </div>
        </div>
      </div>

      <div className="layout-profile">

        {/* ── Profile card ─────────────────────────────────────────── */}
        <div className="glass-panel patient-profile-card">
          <div className="patient-avatar-lg">
            <User size={44} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{patient.name}</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>
            {patient.age ? `${patient.age} years` : '—'} · {patient.gender || 'N/A'}
          </div>
          <span className="badge badge-green">
            {sorted.length} Visit{sorted.length !== 1 ? 's' : ''}
          </span>

          <div className="info-block">
            <div className="info-block-row">
              <span>Phone</span>
              <span>{patient.contact || '—'}</span>
            </div>
            <div className="info-block-row">
              <span>Total Visits</span>
              <span>{patient.prescriptionCount ?? sorted.length}</span>
            </div>
            {patient.address && (
              <div className="info-block-row">
                <span>Address</span>
                <span>{patient.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Prescription timeline ─────────────────────────────────── */}
        <div className="glass-panel">
          <h3 className="section-title" style={{ marginBottom: '20px' }}>
            <History size={18} color="var(--primary)" /> Prescription Timeline
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sorted.length === 0 ? (
              <div className="empty-state">
                <History size={40} />
                <p>No past prescriptions found for this patient.</p>
              </div>
            ) : (
              sorted.map((record, index) => (
                <div key={record.id} className="rx-record">
                  <div className="rx-record-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary)' }}>
                      <Calendar size={16} /> Visit #{sorted.length - index}
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {record.createdAt
                        ? new Date(record.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </div>

                  <div className="rx-record-body">
                    {/* Left column */}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Diagnosis</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', marginBottom: '14px' }}>
                        <Activity size={13} color="var(--primary)" /> {record.diagnosis || 'General checkup'}
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Medicines</div>
                      <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.9 }}>
                        {(Array.isArray(record.medicines) ? record.medicines : []).map((m, i) => (
                          <li key={i}>{m.name}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Right column */}
                    <div className="rx-record-notes">
                      {record.pathya && (
                        <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '0.78rem', color: 'var(--success)', textTransform: 'uppercase' }}>Pathya</strong>
                          <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{record.pathya}</div>
                        </div>
                      )}
                      {record.notes && (
                        <div style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                          <strong style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dr. Notes</strong>
                          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>{record.notes}</div>
                        </div>
                      )}
                      <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => downloadPDF(record)}>
                        <Download size={13} /> Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
