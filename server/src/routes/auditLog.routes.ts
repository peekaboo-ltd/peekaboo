import { Router } from 'express';
import { AuditController } from '../controllers/auditLog.controller';

const router = Router();
const auditController = new AuditController();

// FETCH AUDIT LOGS
router.get('/', auditController.fetchAuditLogs);

// FETCH ENTITY HISTORY
router.get('/entity/:entityId', auditController.fetchEntityHistory);

export default router;
