import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, User, History, Download, ArrowLeft, Loader2,
  Activity, Phone, MapPin, FlaskConical, Leaf, FileText,
  ClipboardList, Utensils, StickyNote,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { getPatientWithHistory } from '../services/patientService';

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function PatientHistory() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [patient,  setPatient]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true); setError(null);
    try { setPatient(await getPatientWithHistory(id)); }
    catch (err) { console.error(err); setError(err.message); }
    finally { setLoading(false); }
  };

  const downloadPDF = (record) => {
    const el = document.createElement('div');
    el.innerHTML = `
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
          ${(record.medicines ?? []).map(m => `
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
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2.5, useCORS: true, logging: false, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(el).save();
  };

  if (loading) return (
    <div className="loader-container" style={{ height: '60vh' }}>
      <Loader2 className="loader-icon" size={46} />
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Loading Medical History…</p>
    </div>
  );

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

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button className="btn btn-secondary btn-icon" onClick={() => navigate('/patients')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">{patient.name}</h1>
            <p className="page-subtitle">Medical History · {sorted.length} visit{sorted.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="layout-profile">

        {/* ── Profile Sidebar ──────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Avatar card */}
          <div className="glass-panel ph-profile-card">
            <div className="ph-profile-banner" />
            <div className="ph-avatar-wrap">
              <div className="ph-avatar">{initials(patient.name)}</div>
            </div>
            <div className="ph-profile-body">
              <h2 className="ph-patient-name">{patient.name}</h2>
              <p className="ph-patient-meta">
                {patient.age ? `${patient.age} yrs` : '—'} &nbsp;·&nbsp; {patient.gender || 'N/A'}
              </p>
              <span className="badge badge-green" style={{ marginTop: '4px' }}>
                {sorted.length} Visit{sorted.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Patient details card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
              Patient Details
            </p>
            <div className="ph-detail-list">
              <div className="ph-detail-row">
                <span className="ph-detail-icon"><Phone size={13} /></span>
                <span className="ph-detail-label">Phone</span>
                <span className="ph-detail-value">{patient.contact || '—'}</span>
              </div>
              <div className="ph-detail-row">
                <span className="ph-detail-icon"><ClipboardList size={13} /></span>
                <span className="ph-detail-label">Total Visits</span>
                <span className="ph-detail-value">{patient.prescriptionCount ?? sorted.length}</span>
              </div>
              {patient.address && (
                <div className="ph-detail-row">
                  <span className="ph-detail-icon"><MapPin size={13} /></span>
                  <span className="ph-detail-label">Address</span>
                  <span className="ph-detail-value">{patient.address}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Timeline ─────────────────────────────────────────── */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 className="section-title" style={{ marginBottom: '28px' }}>
            <History size={18} color="var(--primary)" /> Prescription Timeline
          </h3>

          {sorted.length === 0 ? (
            <div className="empty-state">
              <History size={40} />
              <p>No past prescriptions found for this patient.</p>
            </div>
          ) : (
            <div className="ph-timeline">
              {sorted.map((record, index) => {
                const medicines = Array.isArray(record.medicines) ? record.medicines : [];
                const labReports = Array.isArray(record.labReports) ? record.labReports : [];
                const visitNum = sorted.length - index;
                const dateStr = record.createdAt
                  ? new Date(record.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—';

                return (
                  <div key={record.id} className="ph-entry">
                    {/* Timeline spine */}
                    <div className="ph-spine">
                      <div className="ph-dot" />
                      {index < sorted.length - 1 && <div className="ph-line" />}
                    </div>

                    {/* Card */}
                    <div className="ph-card">
                      {/* Card header */}
                      <div className="ph-card-header">
                        <div className="ph-visit-badge">
                          <Calendar size={13} /> Visit #{visitNum}
                        </div>
                        <span className="ph-date-chip">{dateStr}</span>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ marginLeft: 'auto' }}
                          onClick={() => downloadPDF(record)}
                        >
                          <Download size={13} /> PDF
                        </button>
                      </div>

                      {/* Diagnosis */}
                      {record.diagnosis && (
                        <div className="ph-diagnosis">
                          <Activity size={13} />
                          <span>{record.diagnosis}</span>
                        </div>
                      )}

                      {/* Card body */}
                      <div className="ph-card-body">

                        {/* Medicines */}
                        {medicines.length > 0 && (
                          <div className="ph-section">
                            <p className="ph-section-label">Medicines</p>
                            <div className="ph-med-list">
                              {medicines.map((m, i) => (
                                <div key={i} className="ph-med-item">
                                  <div className="ph-med-top">
                                    {m.medType === 'ayurvedic'
                                      ? <span className="ph-type-badge ph-type-ayur"><Leaf size={9} /> Ayurvedic</span>
                                      : <span className="ph-type-badge ph-type-allo"><FlaskConical size={9} /> Allopathy</span>
                                    }
                                    <span className="ph-med-name">{m.name}</span>
                                  </div>
                                  {(m.timing || m.days || m.dose) && (
                                    <p className="ph-med-detail">
                                      {[
                                        m.timing,
                                        m.anupan ? `with ${m.anupan}` : '',
                                        m.days   ? `${m.days} days` : '',
                                        m.dose   ? `${m.dose} ${m.doseUnit || ''}` : '',
                                      ].filter(Boolean).join(' · ')}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Right column: notes + lab reports */}
                        <div className="ph-side-col">

                          {/* Lab reports */}
                          {labReports.length > 0 && (
                            <div className="ph-section">
                              <p className="ph-section-label"><FlaskConical size={11} /> Investigations</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {labReports.map((r, i) => (
                                  <div key={i} className="ph-lab-item">
                                    <span className="ph-lab-type">{r.type}</span>
                                    {r.remarks && <span className="ph-lab-remarks">{r.remarks}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pathya / Apathya */}
                          {(record.pathya || record.apathya) && (
                            <div className="ph-section">
                              <p className="ph-section-label"><Utensils size={11} /> Diet</p>
                              {record.pathya  && <p className="ph-note-text"><strong>Do's:</strong> {record.pathya}</p>}
                              {record.apathya && <p className="ph-note-text"><strong>Don'ts:</strong> {record.apathya}</p>}
                            </div>
                          )}

                          {/* Notes */}
                          {record.notes && (
                            <div className="ph-section">
                              <p className="ph-section-label"><StickyNote size={11} /> Dr. Notes</p>
                              <p className="ph-note-text ph-note-italic">{record.notes}</p>
                            </div>
                          )}

                          {/* Empty right col fallback */}
                          {!labReports.length && !record.pathya && !record.apathya && !record.notes && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No additional notes</p>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
