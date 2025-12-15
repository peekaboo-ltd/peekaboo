import { Router } from 'express';
import { RiderLocationController } from '../controllers/riderLocation.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Update rider's own location (requires authentication)
router.post('/update', authenticate, RiderLocationController.updateRiderLocation);

// Get specific rider location
router.get('/:riderId', RiderLocationController.getRiderLocation);

// Get all online riders
router.get('/', RiderLocationController.getOnlineRiders);

// Set rider offline (requires authentication)
router.post('/offline', authenticate, RiderLocationController.setRiderOffline);

export default router;
