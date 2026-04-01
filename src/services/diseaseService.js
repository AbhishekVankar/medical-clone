import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const COL = 'diseases';

let _cache   = null;
let _cacheAt = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function getAllDiseases() {
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache;

  const snap = await getDocs(collection(db, COL));
  _cache = snap.docs
    .map(d => ({ id: d.id, name: d.data().name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  _cacheAt = Date.now();
  return _cache;
}

export async function addDisease(name) {
  const ref = await addDoc(collection(db, COL), { name: name.trim(), createdAt: serverTimestamp() });
  const entry = { id: ref.id, name: name.trim() };
  // Bust cache and append so the new item is available immediately
  if (_cache) {
    _cache = [..._cache, entry].sort((a, b) => a.name.localeCompare(b.name));
    _cacheAt = Date.now();
  }
  return entry;
}
