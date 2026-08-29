import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "../helpers/logger.helper";
import {
  DecryptedFlowRequest,
  decryptFlowRequest,
  encryptFlowResponse,
} from "../helpers/whatsapp.flows.helper";
import { WhatsappService } from "../services/whatsapp.service";
import { UUID } from "../types";
import crypto from "crypto";

const whatsappService = new WhatsappService();

export const WhatsappController = {
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

  async postWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const appSecret = process.env.WHATSAPP_APP_SECRET;
      if (appSecret) {
        const signature = req.header("x-hub-signature-256") || "";
        const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
        const expected = rawBody
          ? `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`
          : "";
        const valid =
          signature.length === expected.length &&
          signature.length > 0 &&
          crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
        if (!valid) return res.status(401).send({ error: "Invalid WhatsApp webhook signature" });
      }
      await whatsappService.handleMessage(req.body);

      return res.status(200).send({ message: "Message received" });
    } catch (err) {
      logger.error(err);
      next(err);
    }
  },

  async postFlowWebhook(req: Request, res: Response) {
    let decryptedFlow:
      | DecryptedFlowRequest<Record<string, any>>
      | undefined;

    try {
      decryptedFlow = decryptFlowRequest(req.body);
    } catch (error) {
      logger.error("WhatsApp Flow decryption failed:", error);
      return res.status(421).send({
        error:
          error instanceof Error
            ? error.message
            : "Unable to decrypt WhatsApp Flow request",
      });
    }

    const { decryptedBody, aesKeyBuffer, initialVectorBuffer } = decryptedFlow;

    if (decryptedBody.action === "ping") {
      return res
        .status(200)
        .send(
          encryptFlowResponse(
            { data: { status: "active" } },
            aesKeyBuffer,
            initialVectorBuffer,
          ),
        );
    }

    try {
      const flowTokenSecret = process.env.WHATSAPP_FLOW_TOKEN_SECRET;

      if (!flowTokenSecret) {
        throw new Error("WhatsApp Flow token secret is not configured");
      }

      const decoded = jwt.verify(
        decryptedBody.flow_token || "",
        flowTokenSecret,
      ) as JwtPayload & {
        phone?: string;
        conversationId?: UUID;
        sessionId?: UUID;
        role?: "sender" | "recipient" | "payer";
      };
      const senderPhone = decoded.phone;

      if (!senderPhone) {
        throw new Error("WhatsApp Flow token is missing the sender phone");
      }

      if (decryptedBody.action === "data_exchange") {
        const encryptedResponse = await whatsappService.handleFlowSubmission(
          decryptedBody,
          senderPhone,
          {
            conversationId: decoded.conversationId,
            sessionId: decoded.sessionId,
            role: decoded.role,
          },
          aesKeyBuffer,
          initialVectorBuffer,
        );

        return res.status(200).send(encryptedResponse);
      }

      return res.status(200).send(
        encryptFlowResponse(
          {
            screen: decryptedBody.screen || "SENDER_RECIPIENT",
            data: { error: "Unsupported WhatsApp Flow action" },
          },
          aesKeyBuffer,
          initialVectorBuffer,
        ),
      );
    } catch (error) {
      logger.error("WhatsApp Flow processing failed:", error);
      return res.status(200).send(
        encryptFlowResponse(
          {
            screen: decryptedBody.screen || "SENDER_RECIPIENT",
            data: {
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to process WhatsApp Flow request",
            },
          },
          aesKeyBuffer,
          initialVectorBuffer,
        ),
      );
    }
  },
};
