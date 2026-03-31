/**
 * prescriptionService.js
 *
 * Business logic for the `prescriptions` Firestore collection.
 *
 * Firestore schema
 * ────────────────
 * prescriptions/{prescriptionId}
 *   patientId   : string               (FK → patients)
 *   patientName : string               (denormalized for easy search/display)
 *   diagnosis   : string
 *   medicines   : Array<{
 *     name    : string
 *     timing  : string
 *     anupan  : string
 *     days    : number
 *   }>
 *   pathya      : string
 *   apathya     : string
 *   notes       : string
 *   createdAt   : Timestamp
 *
 * Key design decision
 * ───────────────────
 * Saving a prescription is a two-step Firestore transaction:
 *   1. Write the prescription document.
 *   2. Update the parent patient's denormalized `lastPrescription` field
 *      and increment `prescriptionCount`.
 * This keeps the patient list fast (single query, no joins) while the
 * history timeline stays accurate via the normalized prescriptions collection.
 */

import {
  collection,
  doc,
  getDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const PRESC_COL  = 'prescriptions';
const PATIENT_COL = 'patients';

// ─── Helpers ──────────────────────────────────────────────────────────────

function toPrescrition(snap) {
  const d = snap.data();
  return {
    id: snap.id,
    ...d,
    createdAt: d.createdAt?.toDate?.() ?? null,
  };
}

// ─── Read operations ──────────────────────────────────────────────────────

/**
 * Fetch all prescriptions for a given patient, sorted newest-first.
 */
export async function getPrescriptionsByPatient(patientId) {
  const snap = await getDocs(
    query(
      collection(db, PRESC_COL),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    )
  );
  return snap.docs.map(toPrescrition);
}

// ─── Write operations ─────────────────────────────────────────────────────

/**
 * Save a new prescription and atomically update the parent patient record.
 *
 * Transaction guarantees:
 *  - Prescription is only written if the patient document exists.
 *  - Patient's `lastPrescription` and `prescriptionCount` are updated in the
 *    same atomic operation — the list view never shows stale data.
 *
 * @param {string} patientId
 * @param {object} data  { diagnosis, medicines, pathya, apathya, notes }
 * @returns {string}     The new prescription document ID
 */
export async function createPrescription(patientId, data) {
  const patientRef = doc(db, PATIENT_COL, patientId);
  let newPrescriptionId;

  await runTransaction(db, async (tx) => {
    // 1. Read the patient doc inside the transaction (required by Firestore)
    const patientSnap = await tx.get(patientRef);
    if (!patientSnap.exists()) {
      throw new Error(`Patient ${patientId} not found`);
    }

    const patientData = patientSnap.data();
    const currentCount = patientData.prescriptionCount ?? 0;

    // 2. Build and write the prescription document
    const prescRef = doc(collection(db, PRESC_COL)); // auto-ID inside tx
    newPrescriptionId = prescRef.id;

    tx.set(prescRef, {
      patientId,
      patientName: patientData.name,
      diagnosis:   data.diagnosis   ?? '',
      medicines:   sanitiseMedicines(data.medicines),
      pathya:      data.pathya      ?? '',
      apathya:     data.apathya     ?? '',
      notes:       data.notes       ?? '',
      createdAt:   serverTimestamp(),
    });

    // 3. Denormalize into the patient document
    tx.update(patientRef, {
      lastPrescription: {
        diagnosis: data.diagnosis ?? '',
        createdAt: new Date(),          // serverTimestamp() not allowed in update inside tx, use JS Date
      },
      prescriptionCount: currentCount + 1,
    });
  });

  return newPrescriptionId;
}

// ─── Private helpers ──────────────────────────────────────────────────────

/**
 * Strip undefined / null fields from each medicine row so Firestore doesn't
 * reject the write.
 */
function sanitiseMedicines(medicines = []) {
  return medicines.map(m => ({
    name:   m.name   ?? '',
    timing: m.timing ?? '',
    anupan: m.anupan ?? '',
    days:   Number(m.days) || 0,
  }));
}
