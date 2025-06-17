import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../helpers/errors.helper";
import { Conversation } from "../entities/conversation.entity";
import Joi from "joi";

export const validateCreateConversation = (conversation: Partial<Conversation>) => {
  const schema = Joi.object({
    recipientId: Joi.string().required(),
  });

  return schema.validate(conversation);
};