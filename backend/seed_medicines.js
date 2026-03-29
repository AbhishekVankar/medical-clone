import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ayurvedicMedicines = [
  { medicineName: 'Triphala Churna', stockQuantity: 100, price: 150 },
  { medicineName: 'Avipattikar Churna', stockQuantity: 80, price: 200 },
  { medicineName: 'Ashwagandha Arishta', stockQuantity: 50, price: 350 },
  { medicineName: 'Chandraprabha Vati', stockQuantity: 120, price: 180 },
  { medicineName: 'Gokshuradi Guggulu', stockQuantity: 90, price: 220 },
  { medicineName: 'Kaishore Guggulu', stockQuantity: 70, price: 240 },
  { medicineName: 'Mahasudarshan Ghan Vati', stockQuantity: 60, price: 190 },
  { medicineName: 'Brahmi Vati', stockQuantity: 40, price: 300 },
  { medicineName: 'Shatavari Kalpa', stockQuantity: 110, price: 280 },
  { medicineName: 'Sitopaladi Churna', stockQuantity: 150, price: 120 },
  { medicineName: 'Talisadi Churna', stockQuantity: 85, price: 130 },
  { medicineName: 'Lavan Bhaskar Churna', stockQuantity: 100, price: 110 },
  { medicineName: 'Hingwashtak Churna', stockQuantity: 95, price: 140 },
  { medicineName: 'Trikatu Churna', stockQuantity: 120, price: 100 },
  { medicineName: 'Arjuna Arishta', stockQuantity: 55, price: 320 },
  { medicineName: 'Dashmularishta', stockQuantity: 45, price: 400 },
  { medicineName: 'Kumaryasava', stockQuantity: 50, price: 280 },
  { medicineName: 'Arvindasava', stockQuantity: 40, price: 350 },
  { medicineName: 'Kutajarishta', stockQuantity: 65, price: 300 },
  { medicineName: 'Lohasava', stockQuantity: 75, price: 260 },
  { medicineName: 'Punarnavasava', stockQuantity: 80, price: 290 },
  { medicineName: 'Abhayarishta', stockQuantity: 70, price: 270 },
  { medicineName: 'Saraswatarishta', stockQuantity: 35, price: 450 },
  { medicineName: 'Khadirarishta', stockQuantity: 60, price: 330 },
  { medicineName: 'Balarishta', stockQuantity: 50, price: 310 },
  { medicineName: 'Chyawanprash', stockQuantity: 200, price: 550 },
  { medicineName: 'Brahma Rasayan', stockQuantity: 40, price: 480 },
  { medicineName: 'Agastya Hareetaki', stockQuantity: 50, price: 320 },
  { medicineName: 'Triphala Guggulu', stockQuantity: 100, price: 210 },
  { medicineName: 'Yograj Guggulu', stockQuantity: 90, price: 250 },
  { medicineName: 'Amritarishta', stockQuantity: 50, price: 330 },
  { medicineName: 'Vasarishta', stockQuantity: 45, price: 290 },
  { medicineName: 'Vidangarishta', stockQuantity: 40, price: 310 },
  { medicineName: 'Kanchanar Guggulu', stockQuantity: 85, price: 230 },
  { medicineName: 'Punarnavadi Guggulu', stockQuantity: 70, price: 220 },
  { medicineName: 'Saptamrit Lauh', stockQuantity: 60, price: 180 },
  { medicineName: 'Arogyavardhini Vati', stockQuantity: 150, price: 200 },
  { medicineName: 'Gandhak Rasayan', stockQuantity: 120, price: 160 },
  { medicineName: 'Panch Tulsi Drops', stockQuantity: 300, price: 100 },
  { medicineName: 'Anu Taila', stockQuantity: 100, price: 80 },
  { medicineName: 'Kshirbala Taila', stockQuantity: 50, price: 450 },
  { medicineName: 'Mahanarayan Taila', stockQuantity: 40, price: 500 },
  { medicineName: 'Dhanwantharam Tailam', stockQuantity: 45, price: 480 },
  { medicineName: 'Brahmi Oil', stockQuantity: 60, price: 350 },
  { medicineName: 'Neem Oil', stockQuantity: 100, price: 150 },
  { medicineName: 'Castor Oil (Eranda Taila)', stockQuantity: 150, price: 120 },
  { medicineName: 'Kumkumadi Tailam', stockQuantity: 20, price: 1200 },
  { medicineName: 'Eladi Tailam', stockQuantity: 30, price: 600 },
  { medicineName: 'Nimbadi Churna', stockQuantity: 80, price: 140 },
  { medicineName: 'Sarivadyasava', stockQuantity: 50, price: 320 },
  { medicineName: 'Paracetamol 500mg', stockQuantity: 500, price: 20 },
  { medicineName: 'Amoxicillin 250mg', stockQuantity: 200, price: 50 },
  { medicineName: 'Azithromycin 500mg', stockQuantity: 150, price: 80 },
  { medicineName: 'Ciprofloxacin 500mg', stockQuantity: 100, price: 45 },
  { medicineName: 'Metformin 500mg', stockQuantity: 300, price: 30 },
  { medicineName: 'Atorvastatin 10mg', stockQuantity: 250, price: 60 },
  { medicineName: 'Amlodipine 5mg', stockQuantity: 200, price: 25 },
  { medicineName: 'Losartan 50mg', stockQuantity: 150, price: 40 },
  { medicineName: 'Omeprazole 20mg', stockQuantity: 400, price: 35 },
  { medicineName: 'Pantoprazole 40mg', stockQuantity: 350, price: 45 },
  { medicineName: 'Cetirizine 10mg', stockQuantity: 500, price: 15 },
  { medicineName: 'Loratadine 10mg', stockQuantity: 300, price: 20 },
  { medicineName: 'Ibuprofen 400mg', stockQuantity: 250, price: 30 },
  { medicineName: 'Diclofenac 50mg', stockQuantity: 200, price: 25 },
  { medicineName: 'Salbutamol Inhaler', stockQuantity: 50, price: 150 },
  { medicineName: 'Montelukast 10mg', stockQuantity: 180, price: 70 },
  { medicineName: 'Vitamin C 500mg', stockQuantity: 1000, price: 10 },
  { medicineName: 'Multivitamin Syrup', stockQuantity: 100, price: 120 },
  { medicineName: 'B-Complex Capsules', stockQuantity: 400, price: 40 },
  { medicineName: 'Calcium + Vitamin D3', stockQuantity: 300, price: 90 },
  { medicineName: 'Silver Nitrate Ointment', stockQuantity: 50, price: 80 }
];

async function main() {
  console.log('Seeding medicines...');
  for (const med of ayurvedicMedicines) {
    const existing = await prisma.inventory.findFirst({ where: { medicineName: med.medicineName }});
    if (!existing) {
        await prisma.inventory.create({ data: med });
        console.log(`Created: ${med.medicineName}`);
    }
  }
  console.log('Done!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
