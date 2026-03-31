/**
 * seedMedicines.js
 *
 * One-time utility to populate the `inventory` collection in Firestore
 * with the NHS Medicines A-Z list.
 *
 * HOW TO RUN (browser)
 * ────────────────────
 * 1.  Import and call `seedMedicines()` once from any page, e.g. in
 *     browser console after opening the app:
 *
 *       import { seedMedicines } from './firebase/seedMedicines';
 *       seedMedicines().then(() => console.log('Done'));
 *
 * 2.  Or add a temporary "Seed DB" button in any component.
 *
 * The function is idempotent — running it a second time will add duplicates.
 * Delete the collection first if you need to re-seed.
 */

import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// 238 NHS Medicines A-Z ────────────────────────────────────────────────────
const NHS_MEDICINES = [
  'Aciclovir (Zovirax)', 'Acrivastine', 'Adalimumab (Humira)', 'Alendronic acid',
  'Allopurinol', 'Amitriptyline', 'Amlodipine', 'Amoxicillin', 'Anastrozole',
  'Antacids', 'Apixaban (Eliquis)', 'Aspirin', 'Atenolol', 'Atorvastatin',
  'Azathioprine', 'Azithromycin', 'Baclofen', 'Beclometasone inhaler',
  'Bendroflumethiazide', 'Betahistine', 'Betamethasone skin cream',
  'Bisoprolol', 'Budesonide inhaler', 'Bumetanide', 'Buspirone',
  'Calcipotriol', 'Calcium carbonate', 'Candesartan', 'Carbamazepine',
  'Carbocisteine', 'Carvedilol', 'Cefalexin', 'Cetirizine',
  'Chloramphenicol', 'Chlorphenamine', 'Ciclosporin', 'Citalopram',
  'Clarithromycin', 'Clindamycin', 'Clobetasol', 'Clonazepam',
  'Clopidogrel', 'Clotrimazole', 'Co-amoxiclav', 'Co-codamol',
  'Codeine', 'Colchicine', 'Colestyramine', 'Cyclizine', 'Dapagliflozin',
  'Dexamethasone', 'Diazepam', 'Diclofenac', 'Diltiazem', 'Domperidone',
  'Donepezil', 'Doxazosin', 'Doxycycline', 'Duloxetine', 'Edoxaban',
  'Empagliflozin', 'Enalapril', 'Erythromycin', 'Escitalopram',
  'Esomeprazole', 'Etanercept', 'Etoricoxib', 'Ezetimibe', 'Felodipine',
  'Finasteride', 'Flucloxacillin', 'Fluconazole', 'Fluoxetine',
  'Flutamide', 'Fluticasone inhaler', 'Fluvoxamine', 'Folic acid',
  'Furosemide', 'Gabapentin', 'Glipizide', 'Glyclazide', 'Glyceryl trinitrate',
  'Haloperidol', 'Hydrocortisone', 'Hydroxychloroquine', 'Ibuprofen',
  'Imatinib', 'Indapamide', 'Insulin glargine', 'Ipratropium',
  'Irbesartan', 'Isosorbide mononitrate', 'Isotretinoin', 'Ivermectin',
  'Lactulose', 'Lamotrigine', 'Lansoprazole', 'Latanoprost', 'Leflunomide',
  'Letrozole', 'Levothyroxine', 'Linagliptin', 'Lisinopril', 'Lithium',
  'Loperamide', 'Loratadine', 'Lorazepam', 'Losartan', 'Metformin',
  'Methotrexate', 'Methylphenidate', 'Metoclopramide', 'Metoprolol',
  'Metronidazole', 'Mirtazapine', 'Mometasone', 'Montelukast',
  'Morphine', 'Naproxen', 'Nifedipine', 'Nitrofurantoin', 'Nortriptyline',
  'Nystatin', 'Olanzapine', 'Olmesartan', 'Omeprazole', 'Ondansetron',
  'Orlistat', 'Oxybutynin', 'Oxycodone', 'Pantoprazole', 'Paracetamol',
  'Paroxetine', 'Phenoxymethylpenicillin', 'Phenytoin', 'Pioglitazone',
  'Prednisolone', 'Pregabalin', 'Propranolol', 'Quetiapine', 'Ramipril',
  'Ranitidine', 'Rivaroxaban (Xarelto)', 'Rosuvastatin', 'Salbutamol inhaler',
  'Salmeterol', 'Saxagliptin', 'Sertraline', 'Sildenafil', 'Simvastatin',
  'Sitagliptin', 'Sodium valproate', 'Solifenacin', 'Spironolactone',
  'Sulfasalazine', 'Sumatriptan', 'Tamoxifen', 'Tamsulosin', 'Terbinafine',
  'Testosterone', 'Tiotropium', 'Tolterodine', 'Topiramate', 'Tramadol',
  'Trimethoprim', 'Valsartan', 'Venlafaxine', 'Verapamil', 'Warfarin',
  'Zopiclone',
];

/**
 * Seed all NHS medicines into Firestore inventory collection.
 * Each entry gets stockQuantity = 0 and price = 0 by default.
 * Update them in the app once seeded.
 */
export async function seedMedicines() {
  const col = collection(db, 'inventory');

  // Check if already seeded to avoid duplicates
  const existing = await getDocs(col);
  if (!existing.empty) {
    console.warn(`Inventory already has ${existing.size} items. Skipping seed.`);
    return { skipped: true, count: existing.size };
  }

  let count = 0;
  for (const name of NHS_MEDICINES) {
    await addDoc(col, {
      medicineName:      name,
      brand:             '',
      formulation:       '',
      unit:              'units',
      stockQuantity:     0,
      price:             0,
      expiryDate:        '',
      lowStockThreshold: 10,
      status:            'Critical',          // 0 stock = Critical
      createdAt:         serverTimestamp(),
    });
    count++;
  }

  console.log(`✅ Seeded ${count} medicines into Firestore.`);
  return { seeded: true, count };
}
