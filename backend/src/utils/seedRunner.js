const dotenv = require('dotenv');
dotenv.config();

const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase } = require('./seedData');

async function runSeed() {
  try {
    await connectDB();
    await seedDatabase();
    console.log('[Seed] Database seeding completed successfully.');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error(`[Seed Error]: ${err.message}`);
    process.exit(1);
  }
}

runSeed();

