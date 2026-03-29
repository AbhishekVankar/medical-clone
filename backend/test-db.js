import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testConnection() {
  try {
    console.log("--- Starting Database Connection Test ---");
    
    // 1. Try to count patients
    console.log("Testing query: Counting patients...");
    const patientCount = await prisma.patient.count();
    console.log(`Successfully connected! Patient count in DB: ${patientCount}`);

    // 2. Try to create a test patient
    console.log("Testing write: Creating seed patient...");
    const testPatient = await prisma.patient.create({
      data: {
        name: "Test Patient",
        age: 30,
        contact: "1234567890",
        medicalHist: { note: "Initial test connection" }
      }
    });
    console.log(`Successfully created test patient with ID: ${testPatient.id}`);

    // 3. Cleanup test patient
    console.log("Cleaning up test patient...");
    await prisma.patient.delete({
      where: { id: testPatient.id }
    });
    console.log("Cleanup successful.");

    console.log("--- Database Test PASSED Successfully ---");
  } catch (error) {
    console.error("--- Database Test FAILED ---");
    console.error(error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testConnection();
