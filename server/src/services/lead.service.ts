import Lead from '../models/lead.model';
import Activity from '../models/activity.model';
import AppError from '../lib/app-error';
import { CreateLeadInput, UpdateLeadInput, LeadQueryInput } from '../lib/validators/lead.validators';

export const createLead = async (userId: string, data: CreateLeadInput) => {
  const lead = await Lead.create({ ...data, userId });

  await Activity.create({
    userId,
    leadId: lead._id,
    type: 'lead_added',
    description: `Added lead: ${lead.name}`,
  });

  return lead;
};

export const getLeads = async (userId: string, query: LeadQueryInput) => {
  const { page, limit, stage, tags, search, sort, order } = query;
  const filter: Record<string, any> = { userId };

  if (stage) filter.stage = stage;
  if (tags) filter.tags = { $in: tags.split(',').map(t => t.trim()) };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  const sortObj: Record<string, 1 | -1> = { [sort]: order === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .select('name email company title tags stage engagementScore lastContactedAt createdAt')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  return { leads, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getLeadById = async (userId: string, leadId: string) => {
  const lead = await Lead.findOne({ _id: leadId, userId }).lean();
  if (!lead) {
    throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
  }
  return lead;
};

export const updateLead = async (userId: string, leadId: string, data: UpdateLeadInput) => {
  const lead = await Lead.findOneAndUpdate(
    { _id: leadId, userId },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();

  if (!lead) {
    throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
  }
  return lead;
};

export const deleteLead = async (userId: string, leadId: string) => {
  const lead = await Lead.findOneAndDelete({ _id: leadId, userId });
  if (!lead) {
    throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
  }
  return { deleted: true };
};
