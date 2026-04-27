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
import passportConfig from './src/config/passport.js'; 
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
passportConfig(passport); 

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

// Root route to prevent "No open ports" error during Render health checks
app.get('/', (req, res) => {
  res.send('Bliss Backend is running.');
});

// 7. ERROR HANDLING
app.use(notFound);      
app.use(errorHandler);  

/**
 * 8. DATABASE & SERVER INITIALIZATION
 */
const startServer = async () => {
  try {
    // Render often uses MONGO_URI, but some use DATABASE_URL. 
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_URL;
    
    // Log the presence of the URI without exposing the secret
    console.log('--- Startup Check ---');
    console.log(`Database URI found: ${mongoURI ? 'YES' : 'NO'}`);
    console.log(`Node Environment: ${process.env.NODE_ENV}`);
    
    if (!mongoURI) {
      console.error('❌ CRITICAL ERROR: Database connection string (MONGO_URI) is missing in environment variables.');
      process.exit(1); 
    }

    // Connect to Database
    await connectDB();
    
    // Render defaults to port 10000. We MUST listen on 0.0.0.0
    const PORT = process.env.PORT || 10000;

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
  🚀 Bliss API is Live
  ----------------------------------
  ✅ Status: Connected to Database
  🛠️  Mode:   ${process.env.NODE_ENV || 'production'}
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
    // Delay exit slightly to ensure logs are sent to Render dashboard
    setTimeout(() => process.exit(1), 1000);
  }
};

startServer();
