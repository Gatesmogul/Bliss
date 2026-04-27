/**
 * BLISS BACKEND - MAIN SERVER
 */
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './src/config/db.js';
import passportConfig from './src/config/passport.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

import authRoutes from './src/routes/authRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import matchRoutes from './src/routes/matchRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FIXED: Since server.js is in /backend, '..' takes us to the project root
const projectRoot = path.resolve(__dirname, '..'); 

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, 
}));

const allowedOrigins = [
  process.env.CLIENT_URL,               
  'http://localhost:3000',              
  'http://localhost:19006',             
  'https://bliss-fypm.onrender.com'     
];

app.use(cors({
  origin: function (origin, callback) {
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

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(passport.initialize());
passportConfig(passport); 

// API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Bliss API is operational',
    timestamp: new Date().toISOString()
  });
});

// --- FRONTEND INTEGRATION ---
if (process.env.NODE_ENV === 'production') {
  // FIXED: Points to /app/dist correctly from the root
  const frontendBuildPath = path.join(projectRoot, 'app', 'dist');

  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
    } else {
        res.status(404).json({ message: "API route not found" });
    }
  });
} else {
  app.get('/', (req, res) => {
    res.send('Bliss Backend is running in development mode...');
  });
}

app.use(notFound);      
app.use(errorHandler);  

const startServer = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_URL;
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
  📂 Frontend: Serving from /app/dist
  🛠️  Mode:   ${process.env.NODE_ENV || 'production'}
  🔗 Port:   ${PORT}
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
