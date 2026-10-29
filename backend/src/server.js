const app = require('./app');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./utils/seedData');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await seedDatabase();

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` HotelPro REST API Server Active on port ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(` Environment:  ${process.env.NODE_ENV || 'development'}`);
      console.log(`=======================================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection]: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`[Server Start Failure]: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };

