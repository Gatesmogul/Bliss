const mongoose = require('mongoose');

/**
 * Database Connection Management
 * Handles connection to MongoDB and lifecycle events for the Bliss Backend.
 */
const connectDB = async () => {
  try {
    // Ensure the MONGO_URI is defined to prevent undefined connection attempts
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // autoIndex is useful in development but can be heavy in production.
      // It is kept true here to ensure your schemas' indexes are built.
      autoIndex: true,
      // Maximum time to wait for a connection before failing
      connectTimeoutMS: 10000, 
      // Maintains a stable number of socket connections
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code
    process.exit(1);
  }
};

/**
 * Lifecycle Event Listeners
 * Monitor the health of the connection throughout the app's runtime.
 */
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connection established.');
});

mongoose.connection.on('error', (err) => {
  console.error(`🛑 Mongoose runtime error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose connection lost. Checking network...');
});

/**
 * Graceful Shutdown Handler
 * Ensures that all database operations finish before the process exits.
 */
const gracefulShutdown = async (msg, callback) => {
  try {
    await mongoose.connection.close();
    console.log(`🔌 MongoDB closed through: ${msg}`);
    callback();
  } catch (err) {
    console.error('❌ Error during database shutdown:', err);
    process.exit(1);
  }
};

// Handle app termination (Ctrl+C)
process.on('SIGINT', () => {
  gracefulShutdown('App termination (SIGINT)', () => {
    process.exit(0);
  });
});

// Handle Nodemon restarts or system signals
process.on('SIGTERM', () => {
  gracefulShutdown('System termination (SIGTERM)', () => {
    process.exit(0);
  });
});

module.exports = connectDB;