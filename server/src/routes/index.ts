import { Router } from 'express';
import authRoutes from './auth.routes';
import whatsappRoutes from './whatsapp.routes';
import orderRoutes from './order.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import auditLogRoutes from './auditLog.routes';
import orderAssignmentRoutes from './orderAssignment.routes';
import orderActivityRoutes from './orderActivity.routes';
import paymentRoutes from './payment.routes';
import webhookRoutes from './webhook.routes';

// CREATE ROUTER
const routes = Router();

// AUTH ROUTES
routes.use('/auth', authRoutes);

// WHATSAPP ROUTES
routes.use('/whatsapp', whatsappRoutes);

// ORDER ROUTES
routes.use('/orders', orderRoutes);

// USER ROUTES
routes.use('/users', userRoutes);

// ROLE ROUTES
routes.use('/roles', roleRoutes);

// AUDIT LOG ROUTES
routes.use('/audit-logs', auditLogRoutes);

// ORDER ASSIGNMENT ROUTES
routes.use('/order-assignments', orderAssignmentRoutes);

// ORDER ACTIVITY ROUTES
routes.use('/order-activities', orderActivityRoutes);

// PAYMENT ROUTES
routes.use('/payments', paymentRoutes);

// WEBHOOK ROUTES
routes.use('/webhooks', webhookRoutes);

export default routes;
