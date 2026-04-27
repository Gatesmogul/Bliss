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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 3. GLOBAL MIDDLEWARES
app.use(helmet());

// UPDATED CORS CONFIGURATION
const allowedOrigins = [
  process.env.CLIENT_URL,               // Your Vercel URL (set this in Render Env)
  'http://localhost:3000',              // React local dev
  'http://localhost:19006',             // Expo web dev
  'https://bliss-fypm.onrender.com'     // Self-reference
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_URL;
    
    console.log('--- Startup Check ---');
    console.log(`Database URI found: ${mongoURI ? 'YES' : 'NO'}`);
    console.log(`Client URL allowed: ${process.env.CLIENT_URL || 'NONE'}`);
    
    if (!mongoURI) {
      console.error('❌ CRITICAL ERROR: Database connection string is missing.');
      process.exit(1); 
    }

    await connectDB();
    
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

    process.on('unhandledRejection', (err) => {
      console.error(`🛑 Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error(`❌ Initialization Failed: ${error.message}`);
    setTimeout(() => process.exit(1), 1000);
  }
};

startServer();
