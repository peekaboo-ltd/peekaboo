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
import { requireDatabase } from './middlewares/database.middleware';
import {
  buildPaypackConfig,
  validatePaypackStartupConfig,
} from './integrations/paypack/paypack.config';
import {
  buildMvendCallbackUrl,
  buildMvendConfig,
  validateMvendStartupConfig,
} from './integrations/mvend/mvend.config';
import { getActivePaymentProvider } from './helpers/paymentProvider.helper';
import { PaymentProvider } from './types/payment-provider.types';

// Validate only the gateway that initiates new payments.
const activePaymentProvider = getActivePaymentProvider();
const paymentConfigIssues =
  activePaymentProvider === PaymentProvider.MVEND
    ? validateMvendStartupConfig(buildMvendConfig())
    : validatePaypackStartupConfig(buildPaypackConfig());
if (paymentConfigIssues.length) {
  paymentConfigIssues.forEach((issue) =>
    logger.warning(`[${activePaymentProvider}] ${issue}`),
  );

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `${activePaymentProvider} configuration invalid: ${paymentConfigIssues.join('; ')}`,
    );
  }
}
if (activePaymentProvider === PaymentProvider.MVEND) {
  const callbackUrl = buildMvendCallbackUrl();
  if (callbackUrl) {
    logger.info(`[MVEND] Callback route ready at ${callbackUrl.replace(/[^/]+$/, '<MVEND_CALLBACK_TOKEN>')}`);
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

// Health check — always available, reports database reachability
app.get('/api/v1/health', (_req, res) => {
  if (AppDataSource.isInitialized) {
    return res.status(200).json({ status: 'ok' });
  }
  return res.status(503).json({ status: 'unavailable' });
});

app.use('/api/v1', requireDatabase, routes);
app.use('/api/v1/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(errorHandler);

// DATABASE CONNECTION
const initialization = AppDataSource.initialize();
initialization
  .then(() => {
    logger.success(`${process.env.DB_NAME} connected`);
  })
  .catch((error) => {
    logger.error('Database connection failed', error);
  });

// Awaited by the worker entrypoint so the server only accepts traffic
// once the database is connected.
export const databaseReady = initialization;

export default app;
