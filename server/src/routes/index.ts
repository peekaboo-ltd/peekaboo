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
import dashboardRoutes from './dashboard.routes';
import landingRoutes from './landing.routes';
import businessPlanRoutes from './businessPlan.routes';
import organizationRoutes from './organization.routes';
import batchRoutes from './batch.routes';
import pushRoutes from './push.routes';

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

// DASHBOARD ROUTES
routes.use('/dashboard', dashboardRoutes);

// LANDING ROUTES (public)
routes.use('/landing', landingRoutes);
// BUSINESS PLAN ROUTES
routes.use('/business-plans', businessPlanRoutes);

// ORGANIZATION ROUTES
routes.use('/organizations', organizationRoutes);

// BATCH ROUTES
routes.use('/batches', batchRoutes);

// PUSH ROUTES
routes.use('/push', pushRoutes);

export default routes;
