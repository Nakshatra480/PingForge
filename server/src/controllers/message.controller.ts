import { Request, Response } from 'express';
import asyncHandler from '../lib/async-handler';
import { createMessageSchema, updateMessageSchema, messageQuerySchema } from '../lib/validators/message.validators';
import * as messageService from '../services/message.service';

export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  const data = createMessageSchema.parse(req.body);
  const message = await messageService.createMessage(req.user!.id, data);
  res.status(201).json({ success: true, data: message });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const query = messageQuerySchema.parse(req.query);
  const result = await messageService.getMessages(req.user!.id, query);
  res.json({ success: true, data: result.messages, meta: result.meta });
});

export const getMessageById = asyncHandler(async (req: Request, res: Response) => {
  const message = await messageService.getMessageById(req.user!.id, req.params.id as string);
  res.json({ success: true, data: message });
});

export const updateMessage = asyncHandler(async (req: Request, res: Response) => {
  const data = updateMessageSchema.parse(req.body);
  const message = await messageService.updateMessage(req.user!.id, req.params.id as string, data);
  res.json({ success: true, data: message });
});
