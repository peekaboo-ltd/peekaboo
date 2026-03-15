import { NextFunction, Request, Response } from 'express';
import { pushService } from '../services/push.service';
import { AuthRequest } from '../types/auth.types';
import { RegisterPushTokenDto, SendPushDto } from '../types/push.types';

export const PushController = {
  async registerSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const payload = req.body as RegisterPushTokenDto;

      const subscription = await pushService.registerPushToken(
        authReq.user!.id,
        payload
      );

      return res.status(200).json({
        message: 'Push subscription saved',
        data: {
          id: subscription.id,
          expoPushToken: subscription.expoPushToken,
          notificationsEnabled: subscription.notificationsEnabled,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async disableSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const { token } = req.params;

      await pushService.disablePushToken(authReq.user!.id, token);

      return res.status(200).json({
        message: 'Push subscription disabled',
      });
    } catch (error) {
      next(error);
    }
  },

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
