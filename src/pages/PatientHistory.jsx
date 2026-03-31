import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, History, Download, ArrowLeft, Loader2, Activity } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const API = 'http://localhost:5000';

export default function PatientHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/patients/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPatient(data);
      } else {
        setPatient(null);
      }
    } catch (err) {
      console.error('Failed to fetch patient history:', err);
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (prescription) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; color: #333; line-height: 1.6;">
        <div style="border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="color: #10b981; margin: 0;">Sanjivani Clinic</h2>
            <div style="font-size: 0.9rem; font-weight: bold; margin-top: 4px;">Dr. Dharmesh C. Sapovadiya</div>
            <div style="font-size: 0.8rem; color: #666; margin-top: 2px;">Qualification: B.A.M.S.</div>
          </div>
          <div style="width: 40px; height: 40px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">SC</div>
        </div>
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px;">
          <div><strong>Name:</strong> ${patient.name}</div>
          <div><strong>Date:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}</div>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="color: #10b981; border-bottom: 1px solid #10b981; display: inline-block;">Advised Medicines</h3>
          <ul style="padding-left: 20px;">
            ${(Array.isArray(prescription.medicines) ? prescription.medicines : []).map(m => `
              <li style="margin-bottom: 8px;">
                <strong>${m.name}</strong>
                <div style="font-size: 0.85rem; color: #666;">${m.timing || ''} ${m.anupan ? `with ${m.anupan}` : ''} • ${m.days} days</div>
              </li>
            `).join('')}
          </ul>
        </div>
        <div style="margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 16px; font-size: 0.9rem;">
          ${prescription.pathya ? `<div><strong>Pathya (Do's):</strong> ${prescription.pathya}</div>` : ''}
          ${prescription.apathya ? `<div style="margin-top: 4px;"><strong>Apathya (Don'ts):</strong> ${prescription.apathya}</div>` : ''}
          ${prescription.notes ? `<div style="margin-top: 8px; font-style: italic;"><strong>Notes:</strong> ${prescription.notes}</div>` : ''}
        </div>
      </div>
    `;

    const opt = {
      margin: 0,
      filename: `${patient.name}_Prescription_${new Date(prescription.createdAt).toLocaleDateString()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2.5, useCORS: true, logging: false, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="loader-container" style={{ height: '100vh' }}>
        <Loader2 className="loader-icon" size={50} />
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '500' }}>Opening Medical History...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-muted)' }}>Patient record not found.</h2>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/patients')}>
          <ArrowLeft size={18} /> Back to Patients
        </button>
      </div>
    );
  }

  const prescriptions = patient.prescriptions || [];

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary" style={{ padding: '10px' }} onClick={() => navigate('/patients')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{patient.name}</h1>
            <p className="page-subtitle">Detailed Medical History Timeline</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'start' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '4px solid var(--primary)' }}>
            <User size={50} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{patient.name}</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
            {patient.age} years • {patient.gender || 'N/A'}
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'left' }}>
            <div style={{ marginBottom: '8px' }}><strong>Phone:</strong> {patient.contact}</div>
            <div><strong>Total Visits:</strong> {prescriptions.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <History size={22} color="var(--primary)" /> Prescription Timeline
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {prescriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No past prescriptions found for this patient.
              </div>
            ) : (
              [...prescriptions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((record, index, arr) => (
                <div key={record.id} style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-muted)', border: '1px solid var(--border-color)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>
                      <Calendar size={18} /> Visit #{arr.length - index}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '4px' }}>Diagnosis:</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Activity size={14} color="var(--primary)" /> {record.diagnosis || 'General checkup'}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.9rem' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '4px' }}>Medicines:</div>
                        <ul style={{ paddingLeft: '16px', margin: 0 }}>
                          {(Array.isArray(record.medicines) ? record.medicines : []).map((m, i) => (
                            <li key={i}>{m.name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div style={{ borderLeft: '1px solid #ccc', paddingLeft: '24px' }}>
                      {record.pathya && <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}><strong>Pathya:</strong> {record.pathya}</div>}
                      {record.notes && <div style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}><strong>Dr. Notes:</strong> {record.notes}</div>}
                      <div style={{ marginTop: '16px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.85rem', width: '100%' }}
                          onClick={() => downloadPDF(record)}
                        >
                          <Download size={16} /> Download Prescription PDF
                        </button>
                      </div>
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
