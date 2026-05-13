import Campaign from '../models/campaign.model';
import Lead from '../models/lead.model';
import Activity from '../models/activity.model';
import AppError from '../lib/app-error';
import { CreateCampaignInput, UpdateCampaignInput, CampaignQueryInput } from '../lib/validators/campaign.validators';

export const createCampaign = async (userId: string, data: CreateCampaignInput) => {
  const campaign = await Campaign.create({
    ...data,
    userId,
    targetCount: data.leadIds?.length || 0,
  });
  return campaign;
};

export const getCampaigns = async (userId: string, query: CampaignQueryInput) => {
  const { page, limit, status } = query;
  const filter: Record<string, any> = { userId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [campaigns, total] = await Promise.all([
    Campaign.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Campaign.countDocuments(filter),
  ]);

  return { campaigns, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getCampaignById = async (userId: string, campaignId: string) => {
  const campaign = await Campaign.findOne({ _id: campaignId, userId }).lean();
  if (!campaign) {
    throw new AppError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND');
  }
  return campaign;
};

export const updateCampaign = async (userId: string, campaignId: string, data: UpdateCampaignInput) => {
  const updateData: Record<string, any> = { ...data };
  if (data.leadIds) {
    updateData.targetCount = data.leadIds.length;
  }

  const campaign = await Campaign.findOneAndUpdate(
    { _id: campaignId, userId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  if (!campaign) {
    throw new AppError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND');
  }

  if (data.status === 'active') {
    await Activity.create({
      userId,
      campaignId: campaign._id,
      type: 'campaign_launched',
      description: `Launched campaign: ${campaign.name}`,
    });
  }

  return campaign;
};

export const deleteCampaign = async (userId: string, campaignId: string) => {
  const campaign = await Campaign.findOneAndDelete({ _id: campaignId, userId });
  if (!campaign) {
    throw new AppError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND');
  }
  return { deleted: true };
};
export const trackSent = async (userId: string, campaignId: string, leadId?: string) => {
  const campaign = await Campaign.findOneAndUpdate(
    { _id: campaignId, userId },
    { $inc: { sentCount: 1 } },
    { new: true }
  );

  if (!campaign) {
    throw new AppError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND');
  }

  try {
    await Activity.create({
      userId,
      campaignId: campaign._id,
      leadId,
      type: 'outreach_sent',
      description: `Sent outreach for campaign: ${campaign.name}`,
    });
  } catch (e: any) {
    console.error('[trackSent] Activity log failed (non-fatal):', e.message);
  }

  if (leadId) {
    await Lead.findByIdAndUpdate(leadId, {
      $set: { lastContactedAt: new Date() },
      $inc: { engagementScore: 5 }
    });
  }

  return campaign;
};

export const trackReply = async (userId: string, campaignId: string, leadId?: string) => {
  const campaign = await Campaign.findOneAndUpdate(
    { _id: campaignId, userId },
    { $inc: { replyCount: 1 } },
    { new: true }
  );

  if (!campaign) {
    throw new AppError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND');
  }

  await Activity.create({
    userId,
    campaignId: campaign._id,
    leadId,
    type: 'lead_replied',
    description: `Received reply for campaign: ${campaign.name}`,
  });

  if (leadId) {
    await Lead.findByIdAndUpdate(leadId, {
      $set: { stage: 'engaged' },
      $inc: { engagementScore: 15 }
    });
  }

  return campaign;
};

export const trackReplyByLead = async (userId: string, leadId: string) => {
  const campaigns = await Campaign.find({ userId, leadIds: leadId });
  
  if (campaigns.length === 0) {
    await Lead.findByIdAndUpdate(leadId, {
      $set: { stage: 'engaged' },
      $inc: { engagementScore: 10 }
    });
    return { success: true, updatedCampaigns: 0 };
  }

  const campaignIds = campaigns.map(c => c._id);
  
  await Campaign.updateMany(
    { _id: { $in: campaignIds } },
    { $inc: { replyCount: 1 } }
  );

  await Activity.create({
    userId,
    leadId,
    type: 'lead_replied',
    description: `Lead replied to ${campaigns.length} campaign(s)`,
  });

  await Lead.findByIdAndUpdate(leadId, {
    $set: { stage: 'engaged' },
    $inc: { engagementScore: 15 }
  });

  return { success: true, updatedCampaigns: campaigns.length };
};
