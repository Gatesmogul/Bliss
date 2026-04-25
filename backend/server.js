/**
 * BLISS BACKEND - MAIN SERVER
 * Central hub for API routes, database connection, and security.
 */
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. IMPORT CONFIGS & MIDDLEWARE
import connectDB from './src/config/db.js';
import passportConfig from './src/config/passport.js'; // Direct import is safer
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

// 2. IMPORT ROUTE FILES
import authRoutes from './src/routes/authRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import matchRoutes from './src/routes/matchRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

// Initialize dotenv
dotenv.config();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 3. GLOBAL MIDDLEWARES
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// 4. LOGGER & AUTH
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(passport.initialize());
passportConfig(passport); // Initialize passport with the imported config

// 5. API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);

// 6. HEALTH CHECK
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Bliss API is operational',
    timestamp: new Date().toISOString()
  });
});

// 7. ERROR HANDLING
app.use(notFound);      
app.use(errorHandler);  

/**
 * 8. DATABASE & SERVER INITIALIZATION
 */
const startServer = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL;
    
    if (!MONGO_URI) {
      throw new Error('Database connection string is missing in .env');
    }

    await connectDB();
    
    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
  🚀 Bliss API is Live (ESM Mode)
  ----------------------------------
  ✅ Status: Connected to Database
  🛠️  Mode:   ${process.env.NODE_ENV || 'development'}
  🔗 Port:   ${PORT}
  🌍 Host:   0.0.0.0
  ----------------------------------
      `);
    });

    // Handle Graceful Shutdown
    process.on('unhandledRejection', (err) => {
      console.error(`🛑 Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error(`❌ Initialization Failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();