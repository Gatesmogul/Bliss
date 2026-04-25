/**
 * BLISS BACKEND - MAIN SERVER
 * Central hub for API routes, database connection, and security.
 */
const path = require('path');
require('dotenv').config(); // Ensure .env is in the same folder as server.js

const express = require('express');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// 1. IMPORT CONFIGS & MIDDLEWARE
const connectDB = require('./src/config/db'); 
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');

// 2. IMPORT ROUTE FILES
const authRoutes = require('./src/routes/authRoutes');
const matchRoutes = require('./src/routes/matchRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const userRoutes = require('./src/routes/userRoutes');

// Initialize App
const app = express();

/**
 * 3. DATABASE & SERVER INITIALIZATION
 */
const startServer = async () => {
  try {
    // Ensure DB_URI exists before trying to connect
    if (!process.env.MONGO_URI && !process.env.DATABASE_URL) {
      console.warn('⚠️  WARNING: Database connection string is missing in .env');
    }

    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`
  🚀 Bliss API is Live
  ----------------------------------
  ✅ Status: Connected to Database
  🛠️  Mode:   ${process.env.NODE_ENV || 'development'}
  🔗 Port:   ${PORT}
  ----------------------------------
      `);
    });

    // Handle Graceful Shutdown for Unhandled Rejections
    process.on('unhandledRejection', (err) => {
      console.error(`🛑 Server Error: ${err.message}`);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error(`❌ Initialization Failed: ${error.message}`);
    process.exit(1);
  }
};

// 4. GLOBAL MIDDLEWARES
app.use(helmet()); // Security Headers

app.use(cors({
  origin: process.env.CLIENT_URL || '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// 5. LOGGER & AUTH
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

app.use(passport.initialize());
// Verify this file exists at ./src/config/passport.js
if (typeof require('./src/config/passport') === 'function') {
  require('./src/config/passport')(passport);
}

// 6. API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);

// 7. HEALTH CHECK
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Bliss API is operational',
    timestamp: new Date().toISOString()
  });
});

// 8. ERROR HANDLING
app.use(notFound);      
app.use(errorHandler);  

// EXECUTE
startServer();