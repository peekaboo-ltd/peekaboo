import { NextFunction, Request, Response } from 'express';
import { pushService } from '../services/push.service';
import { SendPushDto } from '../types/push.types';

export const PushController = {
  async sendTestPush(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as SendPushDto;
      const sentCount = await pushService.sendPushNotification(payload);

      return res.status(200).json({
        message: 'Test push notifications queued',
        data: {
          sentCount,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
