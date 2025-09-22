import { Router } from 'express';
import whatsappRoutes from './whatsapp.routes';
import orderRoutes from './order.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import auditLogRoutes from './auditLog.routes';
import orderAssignmentRoutes from './orderAssignment.routes';
import orderActivityRoutes from './orderActivity.routes';

// CREATE ROUTER
const routes = Router();

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

export default routes;
