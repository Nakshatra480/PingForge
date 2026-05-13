import Lead from '../models/lead.model';
import Campaign from '../models/campaign.model';
import Message from '../models/message.model';
import Activity from '../models/activity.model';

export const getDashboardStats = async (userId: string) => {
  const [totalLeads, totalCampaigns, messageStats, recentActivity] = await Promise.all([
    Lead.countDocuments({ userId }),
    Campaign.countDocuments({ userId }),
    Message.aggregate([
      { $match: { userId: userId as any } },
      {
        $group: {
          _id: null,
          totalSent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          totalReplied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
          totalMessages: { $sum: 1 },
        },
      },
    ]),
    Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const stats = messageStats[0] || { totalSent: 0, totalReplied: 0, totalMessages: 0 };
  const replyRate = stats.totalSent > 0 ? Math.round((stats.totalReplied / stats.totalSent) * 100) : 0;

  return {
    leads: totalLeads,
    campaigns: totalCampaigns,
    messagesSent: stats.totalSent,
    replyRate,
    recentActivity,
  };
};

export const getCampaignAnalytics = async (userId: string): Promise<any[]> => {
  const campaigns = await Campaign.find({ userId })
    .select('name status type targetCount sentCount replyCount createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return campaigns.map(c => ({
    ...c,
    replyRate: c.sentCount > 0 ? Math.round((c.replyCount / c.sentCount) * 100) : 0,
  }));
};
