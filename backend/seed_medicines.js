import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ------------------------------------------------------------
// NHS MEDICINES A–Z (238 items)
// stockQuantity: 0 = not yet stocked (update via Inventory page)
// price: 0 = price not set yet
// ------------------------------------------------------------
const medicines = [
  // A
  { medicineName: 'Aciclovir (Zovirax)', stockQuantity: 0, price: 0 },
  { medicineName: 'Acrivastine', stockQuantity: 0, price: 0 },
  { medicineName: 'Adalimumab', stockQuantity: 0, price: 0 },
  { medicineName: 'Alendronic acid', stockQuantity: 0, price: 0 },
  { medicineName: 'Allopurinol', stockQuantity: 0, price: 0 },
  { medicineName: 'Alogliptin', stockQuantity: 0, price: 0 },
  { medicineName: 'Amitriptyline (for depression)', stockQuantity: 0, price: 0 },
  { medicineName: 'Amitriptyline (for pain and migraine)', stockQuantity: 0, price: 0 },
  { medicineName: 'Amlodipine', stockQuantity: 0, price: 0 },
  { medicineName: 'Amoxicillin', stockQuantity: 0, price: 0 },
  { medicineName: 'Anastrozole', stockQuantity: 0, price: 0 },
  { medicineName: 'Antacids', stockQuantity: 0, price: 0 },
  { medicineName: 'Antibiotics', stockQuantity: 0, price: 0 },
  { medicineName: 'Anticoagulant medicines', stockQuantity: 0, price: 0 },
  { medicineName: 'Antidepressants', stockQuantity: 0, price: 0 },
  { medicineName: 'Antifungal medicines', stockQuantity: 0, price: 0 },
  { medicineName: 'Antihistamines', stockQuantity: 0, price: 0 },
  { medicineName: 'Apixaban', stockQuantity: 0, price: 0 },
  { medicineName: 'Aripiprazole', stockQuantity: 0, price: 0 },
  { medicineName: 'Aspirin (for pain relief)', stockQuantity: 0, price: 0 },
  { medicineName: 'Aspirin (low-dose)', stockQuantity: 0, price: 0 },
  { medicineName: 'Atenolol', stockQuantity: 0, price: 0 },
  { medicineName: 'Atorvastatin', stockQuantity: 0, price: 0 },
  { medicineName: 'Azathioprine', stockQuantity: 0, price: 0 },
  { medicineName: 'Azithromycin', stockQuantity: 0, price: 0 },

  // B
  { medicineName: 'Baclofen', stockQuantity: 0, price: 0 },
  { medicineName: 'Beclometasone inhalers', stockQuantity: 0, price: 0 },
  { medicineName: 'Beclometasone nasal spray', stockQuantity: 0, price: 0 },
  { medicineName: 'Beclometasone skin cream', stockQuantity: 0, price: 0 },
  { medicineName: 'Bendroflumethiazide', stockQuantity: 0, price: 0 },
  { medicineName: 'Benzoyl peroxide', stockQuantity: 0, price: 0 },
  { medicineName: 'Benzydamine', stockQuantity: 0, price: 0 },
  { medicineName: 'Beta blockers', stockQuantity: 0, price: 0 },
  { medicineName: 'Betahistine', stockQuantity: 0, price: 0 },
  { medicineName: 'Betamethasone (eyes, ears, nose)', stockQuantity: 0, price: 0 },
  { medicineName: 'Betamethasone (skin)', stockQuantity: 0, price: 0 },
  { medicineName: 'Bimatoprost (Lumigan)', stockQuantity: 0, price: 0 },
  { medicineName: 'Bisacodyl', stockQuantity: 0, price: 0 },
  { medicineName: 'Bismuth subsalicylate', stockQuantity: 0, price: 0 },
  { medicineName: 'Bisoprolol', stockQuantity: 0, price: 0 },
  { medicineName: 'Brinzolamide', stockQuantity: 0, price: 0 },
  { medicineName: 'Budesonide inhalers', stockQuantity: 0, price: 0 },
  { medicineName: 'Budesonide nasal spray', stockQuantity: 0, price: 0 },
  { medicineName: 'Budesonide rectal foam', stockQuantity: 0, price: 0 },
  { medicineName: 'Bumetanide', stockQuantity: 0, price: 0 },
  { medicineName: 'Buprenorphine (pain)', stockQuantity: 0, price: 0 },
  { medicineName: 'Buscopan (hyoscine butylbromide)', stockQuantity: 0, price: 0 },

  // C
  { medicineName: 'Calcipotriol', stockQuantity: 0, price: 0 },
  { medicineName: 'Calpol (Paracetamol for children)', stockQuantity: 0, price: 0 },
  { medicineName: 'Candesartan', stockQuantity: 0, price: 0 },
  { medicineName: 'Canesten (Clotrimazole)', stockQuantity: 0, price: 0 },
  { medicineName: 'Cannabis oil (medical)', stockQuantity: 0, price: 0 },
  { medicineName: 'Carbamazepine', stockQuantity: 0, price: 0 },
  { medicineName: 'Carbimazole', stockQuantity: 0, price: 0 },
  { medicineName: 'Carbocisteine', stockQuantity: 0, price: 0 },
  { medicineName: 'Carmellose sodium eye drops', stockQuantity: 0, price: 0 },
  { medicineName: 'Carvedilol', stockQuantity: 0, price: 0 },
  { medicineName: 'Cefalexin', stockQuantity: 0, price: 0 },
  { medicineName: 'Cetirizine', stockQuantity: 0, price: 0 },
  { medicineName: 'Chloramphenicol', stockQuantity: 0, price: 0 },
  { medicineName: 'Chlorhexidine', stockQuantity: 0, price: 0 },
  { medicineName: 'Chlorphenamine (Piriton)', stockQuantity: 0, price: 0 },
  { medicineName: 'Cinnarizine', stockQuantity: 0, price: 0 },
  { medicineName: 'Ciprofloxacin', stockQuantity: 0, price: 0 },
  { medicineName: 'Citalopram', stockQuantity: 0, price: 0 },
  { medicineName: 'Clarithromycin', stockQuantity: 0, price: 0 },
  { medicineName: 'Clarityn (Loratadine)', stockQuantity: 0, price: 0 },
  { medicineName: 'Clobetasol', stockQuantity: 0, price: 0 },
  { medicineName: 'Clobetasone', stockQuantity: 0, price: 0 },
  { medicineName: 'Clonazepam', stockQuantity: 0, price: 0 },
  { medicineName: 'Clonidine', stockQuantity: 0, price: 0 },
  { medicineName: 'Clopidogrel', stockQuantity: 0, price: 0 },
  { medicineName: 'Clotrimazole', stockQuantity: 0, price: 0 },
  { medicineName: 'Co-amoxiclav', stockQuantity: 0, price: 0 },
  { medicineName: 'Co-beneldopa', stockQuantity: 0, price: 0 },
  { medicineName: 'Co-careldopa', stockQuantity: 0, price: 0 },
  { medicineName: 'Co-codamol', stockQuantity: 0, price: 0 },
  { medicineName: 'Co-dydramol', stockQuantity: 0, price: 0 },
  { medicineName: 'Codeine', stockQuantity: 0, price: 0 },
  { medicineName: 'Colchicine', stockQuantity: 0, price: 0 },
  { medicineName: 'Colecalciferol', stockQuantity: 0, price: 0 },
  { medicineName: 'Cyanocobalamin', stockQuantity: 0, price: 0 },
  { medicineName: 'Cyclizine', stockQuantity: 0, price: 0 },

  // D
  { medicineName: 'Dapagliflozin', stockQuantity: 0, price: 0 },
  { medicineName: 'Decongestants', stockQuantity: 0, price: 0 },
  { medicineName: 'Dexamethasone (eye drops)', stockQuantity: 0, price: 0 },
  { medicineName: 'Dexamethasone (tablets/liquid)', stockQuantity: 0, price: 0 },
  { medicineName: 'Diazepam', stockQuantity: 0, price: 0 },
  { medicineName: 'Diclofenac', stockQuantity: 0, price: 0 },
  { medicineName: 'Digoxin', stockQuantity: 0, price: 0 },
  { medicineName: 'Dihydrocodeine', stockQuantity: 0, price: 0 },
  { medicineName: 'Diltiazem', stockQuantity: 0, price: 0 },
  { medicineName: 'Diphenhydramine', stockQuantity: 0, price: 0 },
  { medicineName: 'Dipyridamole', stockQuantity: 0, price: 0 },
  { medicineName: 'Docusate', stockQuantity: 0, price: 0 },
  { medicineName: 'Domperidone', stockQuantity: 0, price: 0 },
  { medicineName: 'Donepezil', stockQuantity: 0, price: 0 },
  { medicineName: 'Doxazosin', stockQuantity: 0, price: 0 },
  { medicineName: 'Doxycycline', stockQuantity: 0, price: 0 },
  { medicineName: 'Duloxetine', stockQuantity: 0, price: 0 },

  // E
  { medicineName: 'Edoxaban', stockQuantity: 0, price: 0 },
  { medicineName: 'Empagliflozin', stockQuantity: 0, price: 0 },
  { medicineName: 'Enalapril', stockQuantity: 0, price: 0 },
  { medicineName: 'Eplerenone', stockQuantity: 0, price: 0 },
  { medicineName: 'Erythromycin', stockQuantity: 0, price: 0 },
  { medicineName: 'Escitalopram', stockQuantity: 0, price: 0 },
  { medicineName: 'Esomeprazole', stockQuantity: 0, price: 0 },
  { medicineName: 'Ezetimibe', stockQuantity: 0, price: 0 },

  // F
  { medicineName: 'Felodipine', stockQuantity: 0, price: 0 },
  { medicineName: 'Fentanyl', stockQuantity: 0, price: 0 },
  { medicineName: 'Ferrous fumarate', stockQuantity: 0, price: 0 },
  { medicineName: 'Ferrous sulfate', stockQuantity: 0, price: 0 },
  { medicineName: 'Fexofenadine', stockQuantity: 0, price: 0 },
  { medicineName: 'Finasteride', stockQuantity: 0, price: 0 },
  { medicineName: 'Flucloxacillin', stockQuantity: 0, price: 0 },
  { medicineName: 'Fluconazole', stockQuantity: 0, price: 0 },
  { medicineName: 'Fluoxetine (Prozac)', stockQuantity: 0, price: 0 },
  { medicineName: 'Fluticasone', stockQuantity: 0, price: 0 },
  { medicineName: 'Folic acid', stockQuantity: 0, price: 0 },
  { medicineName: 'Furosemide', stockQuantity: 0, price: 0 },
  { medicineName: 'Fusidic acid', stockQuantity: 0, price: 0 },
  { medicineName: 'Fybogel', stockQuantity: 0, price: 0 },

  // G
  { medicineName: 'Gabapentin', stockQuantity: 0, price: 0 },
  { medicineName: 'Gaviscon', stockQuantity: 0, price: 0 },
  { medicineName: 'Gliclazide', stockQuantity: 0, price: 0 },
  { medicineName: 'Glyceryl trinitrate (GTN)', stockQuantity: 0, price: 0 },

  // H
  { medicineName: 'Haloperidol', stockQuantity: 0, price: 0 },
  { medicineName: 'Hydrocortisone', stockQuantity: 0, price: 0 },
  { medicineName: 'Hydroxocobalamin', stockQuantity: 0, price: 0 },
  { medicineName: 'Hydroxychloroquine', stockQuantity: 0, price: 0 },

  // I
  { medicineName: 'Ibuprofen', stockQuantity: 0, price: 0 },
  { medicineName: 'Indapamide', stockQuantity: 0, price: 0 },
  { medicineName: 'Insulin', stockQuantity: 0, price: 0 },
  { medicineName: 'Irbesartan', stockQuantity: 0, price: 0 },
  { medicineName: 'Isotretinoin', stockQuantity: 0, price: 0 },

  // J
  { medicineName: 'Joy-Rides', stockQuantity: 0, price: 0 },

  // K
  { medicineName: 'Ketoconazole', stockQuantity: 0, price: 0 },

  // L
  { medicineName: 'Lactulose', stockQuantity: 0, price: 0 },
  { medicineName: 'Lamotrigine', stockQuantity: 0, price: 0 },
  { medicineName: 'Lansoprazole', stockQuantity: 0, price: 0 },
  { medicineName: 'Latanoprost', stockQuantity: 0, price: 0 },
  { medicineName: 'Lercanidipine', stockQuantity: 0, price: 0 },
  { medicineName: 'Letrozole', stockQuantity: 0, price: 0 },
  { medicineName: 'Levetiracetam', stockQuantity: 0, price: 0 },
  { medicineName: 'Levothyroxine', stockQuantity: 0, price: 0 },
  { medicineName: 'Lidocaine', stockQuantity: 0, price: 0 },
  { medicineName: 'Linagliptin', stockQuantity: 0, price: 0 },
  { medicineName: 'Lisinopril', stockQuantity: 0, price: 0 },
  { medicineName: 'Lithium', stockQuantity: 0, price: 0 },
  { medicineName: 'Loperamide', stockQuantity: 0, price: 0 },
  { medicineName: 'Loratadine', stockQuantity: 0, price: 0 },
  { medicineName: 'Lorazepam', stockQuantity: 0, price: 0 },
  { medicineName: 'Losartan', stockQuantity: 0, price: 0 },
  { medicineName: 'Low-dose aspirin', stockQuantity: 0, price: 0 },
  { medicineName: 'Lymecycline', stockQuantity: 0, price: 0 },

  // M
  { medicineName: 'Macrogol', stockQuantity: 0, price: 0 },
  { medicineName: 'Mebendazole', stockQuantity: 0, price: 0 },
  { medicineName: 'Mebeverine', stockQuantity: 0, price: 0 },
  { medicineName: 'Melatonin', stockQuantity: 0, price: 0 },
  { medicineName: 'Memantine', stockQuantity: 0, price: 0 },
  { medicineName: 'Mesalazine', stockQuantity: 0, price: 0 },
  { medicineName: 'Metformin', stockQuantity: 0, price: 0 },
  { medicineName: 'Methadone', stockQuantity: 0, price: 0 },
  { medicineName: 'Methotrexate', stockQuantity: 0, price: 0 },
  { medicineName: 'Metoclopramide', stockQuantity: 0, price: 0 },
  { medicineName: 'Metoprolol', stockQuantity: 0, price: 0 },
  { medicineName: 'Metronidazole', stockQuantity: 0, price: 0 },
  { medicineName: 'Mirabegron', stockQuantity: 0, price: 0 },
  { medicineName: 'Mirtazapine', stockQuantity: 0, price: 0 },
  { medicineName: 'Montelukast', stockQuantity: 0, price: 0 },
  { medicineName: 'Morphine', stockQuantity: 0, price: 0 },

  // N
  { medicineName: 'Naproxen', stockQuantity: 0, price: 0 },
  { medicineName: 'Nefopam', stockQuantity: 0, price: 0 },
  { medicineName: 'Nicorandil', stockQuantity: 0, price: 0 },
  { medicineName: 'Nifedipine', stockQuantity: 0, price: 0 },
  { medicineName: 'Nitrofurantoin', stockQuantity: 0, price: 0 },
  { medicineName: 'Nortriptyline', stockQuantity: 0, price: 0 },
  { medicineName: 'Nystatin', stockQuantity: 0, price: 0 },

  // O
  { medicineName: 'Oestrogen', stockQuantity: 0, price: 0 },
  { medicineName: 'Olanzapine', stockQuantity: 0, price: 0 },
  { medicineName: 'Omeprazole', stockQuantity: 0, price: 0 },
  { medicineName: 'Oxybutynin', stockQuantity: 0, price: 0 },
  { medicineName: 'Oxycodone', stockQuantity: 0, price: 0 },

  // P
  { medicineName: 'Pantoprazole', stockQuantity: 0, price: 0 },
  { medicineName: 'Paracetamol', stockQuantity: 0, price: 0 },
  { medicineName: 'Paroxetine', stockQuantity: 0, price: 0 },
  { medicineName: 'Peppermint oil', stockQuantity: 0, price: 0 },
  { medicineName: 'Perindopril', stockQuantity: 0, price: 0 },
  { medicineName: 'Phenoxymethylpenicillin', stockQuantity: 0, price: 0 },
  { medicineName: 'Pravastatin', stockQuantity: 0, price: 0 },
  { medicineName: 'Prednisolone', stockQuantity: 0, price: 0 },
  { medicineName: 'Pregabalin', stockQuantity: 0, price: 0 },
  { medicineName: 'Prochlorperazine', stockQuantity: 0, price: 0 },
  { medicineName: 'Promethazine', stockQuantity: 0, price: 0 },
  { medicineName: 'Propranolol', stockQuantity: 0, price: 0 },
  { medicineName: 'Pseudoephedrine', stockQuantity: 0, price: 0 },

  // Q
  { medicineName: 'Quetiapine', stockQuantity: 0, price: 0 },

  // R
  { medicineName: 'Ramipril', stockQuantity: 0, price: 0 },
  { medicineName: 'Ranitidine', stockQuantity: 0, price: 0 },
  { medicineName: 'Risperidone', stockQuantity: 0, price: 0 },
  { medicineName: 'Rivaroxaban', stockQuantity: 0, price: 0 },
  { medicineName: 'Ropinirole', stockQuantity: 0, price: 0 },
  { medicineName: 'Rosuvastatin', stockQuantity: 0, price: 0 },

  // S
  { medicineName: 'Salbutamol', stockQuantity: 0, price: 0 },
  { medicineName: 'Senna', stockQuantity: 0, price: 0 },
  { medicineName: 'Sertraline', stockQuantity: 0, price: 0 },
  { medicineName: 'Sildenafil', stockQuantity: 0, price: 0 },
  { medicineName: 'Simeticone', stockQuantity: 0, price: 0 },
  { medicineName: 'Simvastatin', stockQuantity: 0, price: 0 },
  { medicineName: 'Sitagliptin', stockQuantity: 0, price: 0 },
  { medicineName: 'Sodium valproate', stockQuantity: 0, price: 0 },
  { medicineName: 'Solifenacin', stockQuantity: 0, price: 0 },
  { medicineName: 'Sotalol', stockQuantity: 0, price: 0 },
  { medicineName: 'Spironolactone', stockQuantity: 0, price: 0 },
  { medicineName: 'Sulfasalazine', stockQuantity: 0, price: 0 },
  { medicineName: 'Sumatriptan', stockQuantity: 0, price: 0 },

  // T
  { medicineName: 'Tadalafil', stockQuantity: 0, price: 0 },
  { medicineName: 'Tamsulosin', stockQuantity: 0, price: 0 },
  { medicineName: 'Terbinafine', stockQuantity: 0, price: 0 },
  { medicineName: 'Thiamine', stockQuantity: 0, price: 0 },
  { medicineName: 'Ticagrelor', stockQuantity: 0, price: 0 },
  { medicineName: 'Timolol', stockQuantity: 0, price: 0 },
  { medicineName: 'Tiotropium', stockQuantity: 0, price: 0 },
  { medicineName: 'Tolterodine', stockQuantity: 0, price: 0 },
  { medicineName: 'Topiramate', stockQuantity: 0, price: 0 },
  { medicineName: 'Tramadol', stockQuantity: 0, price: 0 },
  { medicineName: 'Tranexamic acid', stockQuantity: 0, price: 0 },
  { medicineName: 'Trazodone', stockQuantity: 0, price: 0 },
  { medicineName: 'Trimethoprim', stockQuantity: 0, price: 0 },

  // U
  { medicineName: 'Utrogestan', stockQuantity: 0, price: 0 },

  // V
  { medicineName: 'Valproic acid', stockQuantity: 0, price: 0 },
  { medicineName: 'Valsartan', stockQuantity: 0, price: 0 },
  { medicineName: 'Varenicline', stockQuantity: 0, price: 0 },
  { medicineName: 'Venlafaxine', stockQuantity: 0, price: 0 },
  { medicineName: 'Verapamil', stockQuantity: 0, price: 0 },

  // W
  { medicineName: 'Warfarin', stockQuantity: 0, price: 0 },

  // Z
  { medicineName: 'Zolpidem', stockQuantity: 0, price: 0 },
  { medicineName: 'Zopiclone', stockQuantity: 0, price: 0 },
];

// ------------------------------------------------------------
// DISEASE PROTOCOLS (Ayurvedic)
// ------------------------------------------------------------
const diseases = [
  {
    name: 'Amlapitta',
    type: 'Digestive',
    mainDosha: 'Pitta',
    commonMedicines: ['Avipattikar Churna', 'Kamdudha Ras', 'Sutshekhar Ras', 'Shatavari Kalpa'],
    pathya: 'Light digestible food, Moong dal, Buttermilk, Coconut water',
    apathya: 'Spicy food, Sour items, Fermented food, Alcohol, Coffee'
  },
  {
    name: 'Sandhigata Vata',
    type: 'Musculoskeletal',
    mainDosha: 'Vata',
    commonMedicines: ['Yograj Guggulu', 'Maharasnadi Kwath', 'Ashwagandha', 'Mahanarayan Taila'],
    pathya: 'Warm food, Sesame oil massage, Light exercise, Warm water',
    apathya: 'Cold exposure, Heavy exercise, Dry food, Fasting'
  },
  {
    name: 'Madhumeha',
    type: 'Metabolic',
    mainDosha: 'Kapha',
    commonMedicines: ['Vasant Kusumakar Ras', 'Chandraprabha Vati', 'Nishamalaki', 'Metformin 500mg'],
    pathya: 'Bitter vegetables, Barley, Whole grains, Regular exercise',
    apathya: 'Sugar, Sweet fruits, White rice, Sedentary lifestyle'
  },
  {
    name: 'Tamaka Shwasa',
    type: 'Respiratory',
    mainDosha: 'Kapha-Vata',
    commonMedicines: ['Sitopaladi Churna', 'Kanakasava', 'Talisadi Churna', 'Salbutamol Inhaler'],
    pathya: 'Warm food, Ginger tea, Steam inhalation, Pranayama',
    apathya: 'Cold food, Dust exposure, Heavy meals, Cold beverages'
  },
  {
    name: 'Agnimandya',
    type: 'Digestive',
    mainDosha: 'Kapha',
    commonMedicines: ['Hingwashtak Churna', 'Trikatu Churna', 'Chitrakadi Vati', 'Lavan Bhaskar Churna'],
    pathya: 'Light meals, Warm water, Ginger, Rock salt',
    apathya: 'Heavy food, Cold items, Overeating, Late night meals'
  },
  {
    name: 'Pratishyaya',
    type: 'Respiratory',
    mainDosha: 'Kapha',
    commonMedicines: ['Sitopaladi Churna', 'Talisadi Churna', 'Tribhuvan Kirti Rasa', 'Anu Taila'],
    pathya: 'Warm soup, Ginger with honey, Steam inhalation, Rest',
    apathya: 'Cold water, Ice cream, AC exposure, Dust'
  },
  {
    name: 'PCOS (Artava Kshaya)',
    type: 'Gynaecological',
    mainDosha: 'Kapha-Vata',
    commonMedicines: ['Shatavari Kalpa', 'Chandraprabha Vati', 'Kanchanar Guggulu', 'Dashmularishta'],
    pathya: 'Fruits, Vegetables, Regular yoga, Stress management',
    apathya: 'Junk food, Sedentary lifestyle, Stress, Hormonal disruptors'
  }
];

// ------------------------------------------------------------
// DEFAULT ADMIN USER
// ------------------------------------------------------------
const adminUser = {
  name: 'Admin',
  email: 'admin@ayurclinic.com',
  password: 'Admin@123',  // Change this after first login!
  role: 'Admin'
};

// ------------------------------------------------------------
// SEED FUNCTION
// ------------------------------------------------------------
async function main() {
  console.log('Starting seed...\n');

  // 1. Seed medicines
  console.log('Seeding medicines...');
  let medicineCount = 0;
  for (const med of medicines) {
    const existing = await prisma.inventory.findFirst({ where: { medicineName: med.medicineName } });
    if (!existing) {
      await prisma.inventory.create({ data: med });
      medicineCount++;
    }
  }
  console.log(`  ✓ ${medicineCount} NHS medicines added (${medicines.length - medicineCount} already existed)\n`);

  // 2. Seed disease protocols
  console.log('Seeding disease protocols...');
  let diseaseCount = 0;
  for (const disease of diseases) {
    const existing = await prisma.diseaseProtocol.findFirst({ where: { name: disease.name } });
    if (!existing) {
      await prisma.diseaseProtocol.create({ data: disease });
      diseaseCount++;
    }
  }
  console.log(`  ✓ ${diseaseCount} new protocols added (${diseases.length - diseaseCount} already existed)\n`);

  // 3. Seed admin user
  console.log('Seeding admin user...');
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminUser.email } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    await prisma.user.create({
      data: { ...adminUser, password: hashedPassword }
    });
    console.log(`  ✓ Admin user created: ${adminUser.email} / ${adminUser.password}`);
    console.log('  ⚠  Change the admin password after first login!\n');
  } else {
    console.log('  ✓ Admin user already exists\n');
  }

  console.log('Seed complete!');
}

main()
  .catch(e => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
