import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { AppDataSource } from './data-source';
import errorHandler from './middlewares/errors.middleware';
import routes from './routes';
import logger from './helpers/logger.helper';

// CREATE EXPRESS APP
const app: Application = express();

// Debug environment variables
console.log('🔧 Environment Variables:');
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// CORS Configuration
const corsOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000', // Alternative dev port
  'http://127.0.0.1:5173', // Alternative localhost format
];

console.log('🌐 CORS Origins:', corsOrigins);

// MIDDLEWARES
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Manual CORS Headers (overriding any existing CORS)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('🔍 Manual CORS - Incoming Origin:', origin);
  console.log('🔍 Allowed Origins:', corsOrigins);
  
  // Check if origin is allowed
  if (!origin || corsOrigins.includes(origin)) {
    console.log('✅ Setting CORS headers for origin:', origin);
    res.header('Access-Control-Allow-Origin', origin || corsOrigins[0]);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  } else {
    console.log('❌ Origin not allowed:', origin);
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight request');
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Keep the cors middleware as backup but it should be overridden by manual headers above
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use('/api/v1', routes);
app.use(errorHandler);

// DATABASE CONNECTION
AppDataSource.initialize()
  .then(() => {
    logger.success(`${process.env.DB_NAME} connected`);
  })
  .catch((error) => {
    logger.error('Database connection failed', error);
  });

export default app;
