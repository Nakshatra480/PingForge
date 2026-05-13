import Message from '../models/message.model';
import Activity from '../models/activity.model';
import AppError from '../lib/app-error';
import { CreateMessageInput, UpdateMessageInput, MessageQueryInput } from '../lib/validators/message.validators';

export const createMessage = async (userId: string, data: CreateMessageInput) => {
  const message = await Message.create({ ...data, userId });

  await Activity.create({
    userId,
    leadId: data.leadId,
    campaignId: data.campaignId,
    type: 'message_sent',
    description: `Created ${data.type} message`,
  });

  return message;
};

export const getMessages = async (userId: string, query: MessageQueryInput) => {
  const { page, limit, leadId, campaignId, status } = query;
  const filter: Record<string, any> = { userId };

  if (leadId) filter.leadId = leadId;
  if (campaignId) filter.campaignId = campaignId;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments(filter),
  ]);

  return { messages, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getMessageById = async (userId: string, messageId: string) => {
  const message = await Message.findOne({ _id: messageId, userId }).lean();
  if (!message) {
    throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }
  return message;
};

export const updateMessage = async (userId: string, messageId: string, data: UpdateMessageInput) => {
  const message = await Message.findOneAndUpdate(
    { _id: messageId, userId },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();

  if (!message) {
    throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }
  return message;
};
