import express, { Application, Request } from 'express';
import path from 'path';
import cors from 'cors';
import 'dotenv/config';
import passport from 'passport';
import { AppDataSource } from './data-source';
import errorHandler from './middlewares/errors.middleware';
import routes from './routes';
import logger from './helpers/logger.helper';
import { configureGoogleAuth } from './config/passport.config';
import { auditContextMiddleware } from './middlewares/auditContext.middleware';
import {
  buildPaypackConfig,
  validatePaypackStartupConfig,
} from './integrations/paypack/paypack.config';

const paypackConfigIssues = validatePaypackStartupConfig(buildPaypackConfig());
if (paypackConfigIssues.length) {
  paypackConfigIssues.forEach((issue) => logger.warning(`[Paypack] ${issue}`));

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `Paypack configuration invalid: ${paypackConfigIssues.join('; ')}`,
    );
  }
}

// CREATE EXPRESS APP
const app: Application = express();

// MIDDLEWARES
app.use(express.json({
  limit: '50mb',
  verify: (req, _res, buffer) => {
    (req as unknown as Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
  },
}));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Initialize Passport
app.use(passport.initialize());

// Configure Google OAuth
configureGoogleAuth();

// Audit context — wraps every request in AsyncLocalStorage
app.use(auditContextMiddleware);

app.use('/api/v1', routes);
app.use('/api/v1/uploads', express.static(path.join(process.cwd(), 'uploads')));
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
