import { NextFunction, Request, Response } from "express";
import logger from "../helpers/logger.helper";
import { WhatsappService } from "../services/whatsapp.service";

// INITIALIZE SERVICE
const whatsappService = new WhatsappService();

export const WhatsappController = {
  // GET WEBHOOK
  async getWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const WHATSAPP_BUSINESS_VERIFY_TOKEN =
        process.env.WHATSAPP_BUSINESS_VERIFY_TOKEN;

      let mode = req.query["hub.mode"];
      let token = req.query["hub.verify_token"];
      let challenge = req.query["hub.challenge"];

      if (!mode || !token) {
        return res.status(403).send({ error: "Missing mode or token" });
      }

      if (mode === "subscribe" && token === WHATSAPP_BUSINESS_VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      } else {
        return res.sendStatus(403);
      }
    } catch (error) {
      logger.error(error);
      next(error);
    }
  },

  // RECEIVE MESSAGE FROM WEBHOOK
  async postWebhook(req: Request, res: Response, next: NextFunction) {
    try {

      // HANDLE MESSAGE
      await whatsappService.handleMessage(req.body);

      // RETURN SUCCESS
      return res.status(200).send({ message: "Message received" });
    } catch (err) {
      logger.error(err);
      next(err);
    }
  },
};
