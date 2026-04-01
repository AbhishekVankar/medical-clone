/**
 * inventoryService.js
 *
 * Business logic for the `inventory` Firestore collection.
 *
 * Firestore schema
 * ────────────────
 * inventory/{medicineId}
 *   medicineName        : string
 *   brand               : string
 *   formulation         : string
 *   unit                : string
 *   stockQuantity       : number
 *   price               : number
 *   expiryDate          : string  (ISO date string or '' )
 *   lowStockThreshold   : number  (default 10)
 *   status              : string  (computed on write: 'In Stock' | 'Low Stock' | 'Critical')
 *   createdAt           : Timestamp
 *
 * Caching strategy
 * ────────────────
 * Medicine names are needed for autocomplete in the prescription form.
 * Fetching all medicines on every keystroke would be wasteful.  We keep an
 * in-memory cache (TTL = 5 minutes) so searches are instant after the first
 * load, while still picking up stock changes within the session.
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COL = 'inventory';

// ─── In-memory cache ──────────────────────────────────────────────────────

let _cache       = null;
let _cacheAt     = 0;
const CACHE_TTL  = 5 * 60 * 1000; // 5 minutes

function isCacheValid() {
  return _cache !== null && Date.now() - _cacheAt < CACHE_TTL;
}

function invalidateCache() {
  _cache = null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function toItem(snap) {
  const d = snap.data();
  return {
    id: snap.id,
    ...d,
    status: computeStatus(d.stockQuantity ?? 0, d.lowStockThreshold ?? 10),
    createdAt: d.createdAt?.toDate?.() ?? null,
  };
}

/**
 * Derive the stock status from quantity vs threshold.
 * Critical  → 0 units
 * Low Stock → > 0 but <= threshold
 * In Stock  → above threshold
 */
function computeStatus(qty, threshold = 10) {
  if (qty <= 0)         return 'Critical';
  if (qty <= threshold) return 'Low Stock';
  return 'In Stock';
}

// ─── Read operations ──────────────────────────────────────────────────────

/**
 * Fetch the full inventory, sorted alphabetically by medicine name.
 * Uses the in-memory cache when valid.
 * Sorting is done client-side to avoid Firestore index requirements.
 */
export async function getAllInventory() {
  if (isCacheValid()) return _cache;

  const snap = await getDocs(collection(db, COL));
  _cache = snap.docs
    .map(toItem)
    .sort((a, b) => a.medicineName.localeCompare(b.medicineName));
  _cacheAt = Date.now();
  return _cache;
}

/**
 * Autocomplete search — returns up to `maxResults` medicines whose names
 * contain the query string (case-insensitive).
 *
 * Firestore has no native substring search; we filter the in-memory cache
 * which is already loaded for the inventory page anyway.
 */
export async function searchMedicines(term, maxResults = 10) {
  if (!term || term.length < 2) return [];
  const all   = await getAllInventory();
  const lower = term.toLowerCase();
  return all
    .filter(m => m.medicineName.toLowerCase().includes(lower))
    .slice(0, maxResults);
}

/**
 * Return only items that are Low Stock or Critical.
 */
export async function getLowStockItems() {
  const all = await getAllInventory();
  return all.filter(m => m.status === 'Low Stock' || m.status === 'Critical');
}

// ─── Write operations ─────────────────────────────────────────────────────

/**
 * Add a new medicine to the inventory.
 * Automatically computes and stores the initial status.
 */
export async function addMedicine(data) {
  const qty       = Number(data.stockQuantity) || 0;
  const threshold = Number(data.lowStockThreshold) || 10;

  const payload = {
    medicineName:      data.medicineName      ?? '',
    brand:             data.brand             ?? '',
    formulation:       data.formulation       ?? '',
    unit:              data.unit              ?? 'units',
    stockQuantity:     qty,
    price:             Number(data.price)     || 0,
    expiryDate:        data.expiryDate        ?? '',
    lowStockThreshold: threshold,
    status:            computeStatus(qty, threshold),
    createdAt:         serverTimestamp(),
  };

  invalidateCache();
  const ref = await addDoc(collection(db, COL), payload);
  return { id: ref.id, ...payload };
}

/**
 * Update stock quantity by a delta (positive = restock, negative = consume).
 * Recalculates and persists the status field atomically.
 *
 * NOTE: For production, wrap this in a Firestore transaction to avoid
 * race conditions when multiple clients consume stock simultaneously.
 */
export async function adjustStock(medicineId, delta) {
  const all    = await getAllInventory();
  const item   = all.find(m => m.id === medicineId);
  if (!item) throw new Error(`Medicine ${medicineId} not found`);

  const newQty    = Math.max(0, (item.stockQuantity ?? 0) + delta);
  const threshold = item.lowStockThreshold ?? 10;
  const newStatus = computeStatus(newQty, threshold);

  await updateDoc(doc(db, COL, medicineId), {
    stockQuantity: newQty,
    status:        newStatus,
  });

  invalidateCache();
  return { ...item, stockQuantity: newQty, status: newStatus };
}

/**
 * Convenience wrapper: decrement stock by 1 (used by the Consume button).
 */
export async function consumeOne(medicineId) {
  return adjustStock(medicineId, -1);
}

/**
 * Quick-add a medicine by name + type directly from the prescription form.
 * Creates a minimal inventory record and updates the cache immediately.
 */
export async function quickAddMedicine(medicineName, type = 'allopathy') {
  const payload = {
    medicineName:      medicineName.trim(),
    type,
    brand:             '',
    formulation:       'Other',
    category:          'Other',
    unit:              'units',
    unitSize:          '',
    stockQuantity:     0,
    price:             0,
    expiryDate:        '',
    lowStockThreshold: 10,
    sideEffects:       [],
    indications:       [],
    dose:              '',
    precautions:       '',
    drugCode:          '',
    status:            'Critical',
    createdAt:         serverTimestamp(),
  };

  invalidateCache();
  const ref   = await addDoc(collection(db, COL), payload);
  const entry = { id: ref.id, ...payload };

  // Reload cache with the new entry appended
  const all = await getAllInventory();
  return entry;
}
