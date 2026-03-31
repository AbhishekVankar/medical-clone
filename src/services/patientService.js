/**
 * patientService.js
 *
 * Business logic for the `patients` Firestore collection.
 *
 * Firestore schema
 * ────────────────
 * patients/{patientId}
 *   name              : string
 *   age               : string | number
 *   gender            : string
 *   contact           : string
 *   address           : string
 *   prescriptionCount : number          (denormalized counter)
 *   lastPrescription  : {               (denormalized for fast list view)
 *     diagnosis  : string
 *     createdAt  : Timestamp
 *   } | null
 *   createdAt         : Timestamp
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getPrescriptionsByPatient } from './prescriptionService';

const COL = 'patients';

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Convert a Firestore doc snapshot → plain JS object with serialised dates */
function toPatient(snap) {
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? null,
    lastPrescription: data.lastPrescription
      ? {
          ...data.lastPrescription,
          createdAt: data.lastPrescription.createdAt?.toDate?.() ?? null,
        }
      : null,
  };
}

// ─── Read operations ──────────────────────────────────────────────────────

/**
 * Fetch all patients sorted newest-first.
 * Each patient includes a denormalized `lastPrescription` so the list view
 * needs no extra queries.
 */
export async function getAllPatients() {
  const snap = await getDocs(
    query(collection(db, COL), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(toPatient);
}

/**
 * Client-side full-text search across name and contact fields.
 * Firestore doesn't support native substring search; we fetch all patients
 * once and filter in memory, which is fast for clinic-scale data (<10k records).
 */
export async function searchPatients(term) {
  if (!term) return getAllPatients();
  const all = await getAllPatients();
  const lower = term.toLowerCase();
  return all.filter(
    p =>
      p.name?.toLowerCase().includes(lower) ||
      p.contact?.toLowerCase().includes(lower)
  );
}

/**
 * Fetch a single patient with their complete prescription history.
 * Runs the patient doc fetch and the prescriptions query in parallel.
 */
export async function getPatientWithHistory(patientId) {
  const [patientSnap, prescriptions] = await Promise.all([
    getDoc(doc(db, COL, patientId)),
    getPrescriptionsByPatient(patientId),
  ]);

  if (!patientSnap.exists()) return null;

  return {
    ...toPatient(patientSnap),
    prescriptions, // already serialised by prescriptionService
  };
}

/**
 * Look up a patient by exact name (case-sensitive).
 * Used during prescription save to avoid duplicate patient records.
 */
export async function findPatientByName(name) {
  const snap = await getDocs(
    query(collection(db, COL), where('name', '==', name), limit(1))
  );
  if (snap.empty) return null;
  return toPatient(snap.docs[0]);
}

// ─── Write operations ─────────────────────────────────────────────────────

/**
 * Create a brand-new patient document.
 */
export async function createPatient(data) {
  const payload = {
    name: data.name ?? '',
    age: data.age ?? '',
    gender: data.gender ?? 'Male',
    contact: data.contact ?? data.phone ?? '',
    address: data.address ?? '',
    prescriptionCount: 0,
    lastPrescription: null,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COL), payload);
  return { id: ref.id, ...payload, createdAt: new Date() };
}

/**
 * Find an existing patient by name or create one if not found.
 * Core deduplication logic used in the prescription flow.
 */
export async function getOrCreatePatient(patientData) {
  const existing = await findPatientByName(patientData.name);
  if (existing) return existing;
  return createPatient(patientData);
}

/**
 * Update the denormalized `lastPrescription` snapshot and increment the
 * prescription counter.  Called inside the prescription creation transaction.
 */
export async function updatePatientAfterPrescription(patientId, diagnosisSnapshot) {
  await updateDoc(doc(db, COL, patientId), {
    lastPrescription: {
      diagnosis: diagnosisSnapshot ?? '',
      createdAt: new Date(),
    },
    prescriptionCount: (await (async () => {
      const snap = await getDoc(doc(db, COL, patientId));
      return (snap.data()?.prescriptionCount ?? 0) + 1;
    })()),
  });
}
