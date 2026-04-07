import { NextFunction, Request, Response } from 'express';
import { pushService } from '../services/push.service';
import { SendPushDto } from '../types/push.types';

export const PushController = {
  async sendTestPush(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as SendPushDto;
      const sentCount = await pushService.sendPushNotification(payload);

      return res.status(200).json({
        message:
          sentCount > 0
            ? 'Test push notifications queued'
            : 'No push sent (see server logs: PUSH_NOTIFICATIONS_DISABLED, missing OneSignal env, or OneSignal API error)',
        data: {
          sentCount,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
