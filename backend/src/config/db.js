const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelpro';
  mongoose.set('strictQuery', false);

  if (process.env.NODE_ENV === 'test' || process.env.USE_MEMORY_DB === 'true') {
    global.USE_IN_MEMORY_DB = true;
    console.log('[Database] Active Mode: High-Fidelity In-Memory Testing Engine (Zero external binary download)');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    global.USE_IN_MEMORY_DB = false;
    console.log(`[Database] MongoDB Connected to live daemon: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Connection to '${uri}' unavailable (${err.message}).`);
    console.log('[Database] Active Mode: High-Fidelity In-Memory Engine activated automatically.');
    console.log('[Database] To use external MongoDB, provide MONGODB_URI in backend/.env');
    global.USE_IN_MEMORY_DB = true;
  }
};

const disconnectDB = async () => {
  if (!global.USE_IN_MEMORY_DB) {
    try {
      await mongoose.connection.close();
    } catch (err) {
      console.error(`[Database Disconnect Error]: ${err.message}`);
    }
  }
};

module.exports = { connectDB, disconnectDB };
