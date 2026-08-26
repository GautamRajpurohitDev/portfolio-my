import { Request, Response } from "express";
import { Project } from "../models/Project";
import { JourneyEntry } from "../models/JourneyEntry";
import { Update } from "../models/Update";
import { Skill } from "../models/Skill";
import { Certificate } from "../models/Certificate";
import { Milestone } from "../models/Milestone";
import { Revision } from "../models/Revision";
import { Settings } from "../models/Settings";
import { Media } from "../models/Media";

export async function getDashboardOverview(req: Request, res: Response): Promise<void> {
  try {
    // Parallelize all the independent DB queries
    const [
      projTotal, projPub,
      jourTotal, jourPub,
      updTotal, updPub,
      draftCountsAgg,
      settingsDoc,
      mediaRecent,
      allRecentDocs
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ published: true }),
      
      JourneyEntry.countDocuments(),
      JourneyEntry.countDocuments({ published: true }),
      
      Update.countDocuments(),
      Update.countDocuments({ published: true }),
      
      // Count drafts by entity type
      Revision.aggregate([
        { $match: { status: "draft" } },
        { $group: { _id: "$entityType", count: { $sum: 1 } } }
      ]),

      // Fetch global settings to get site status & currently learning
      Settings.findOne().lean(),

      // Fetch 4 recent media
      Media.find().sort({ createdAt: -1 }).limit(4).lean(),

      // Fetch recent activity across main content collections
      // (This is slightly inefficient across 5 collections, but for a personal portfolio it's negligible)
      Promise.all([
        Project.find().sort({ updatedAt: -1 }).limit(3).select("title updatedAt _id").lean(),
        JourneyEntry.find().sort({ updatedAt: -1 }).limit(3).select("title topic updatedAt _id").lean(),
        Update.find().sort({ updatedAt: -1 }).limit(3).select("title updatedAt _id").lean(),
        Revision.find({ status: "draft" }).sort({ updatedAt: -1 }).limit(5).select("entityType entityId updatedAt").lean()
      ])
    ]);

    // Format Draft Counts
    const drafts = draftCountsAgg.reduce((acc: any, curr: any) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    const totalDrafts = Object.values(drafts).reduce((a: any, b: any) => a + b, 0);

    // Format Recent Activity (Combine and sort the promises)
    const [recentProj, recentJour, recentUpd, recentRevisions] = allRecentDocs;
    
    const formattedActivity = [
      ...recentProj.map(p => ({ id: p._id, title: p.title, type: "Project", date: p.updatedAt, url: `/admin/projects/${p._id}/edit` })),
      ...recentJour.map(j => ({ id: j._id, title: j.title || j.topic, type: "Journey", date: j.updatedAt, url: `/admin/journey/${j._id}/edit` })),
      ...recentUpd.map(u => ({ id: u._id, title: u.title, type: "Update", date: u.updatedAt, url: `/admin/updates/${u._id}/edit` })),
      ...recentRevisions.map(r => ({ id: r._id, title: `Draft ${r.entityType}`, type: "Draft", date: r.updatedAt, url: r.entityType === 'Settings' ? '/admin/settings' : `/admin/${r.entityType.toLowerCase()}s/${r.entityId}/edit` }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

    // Calculate Streak (from Journey entries)
    const allJourneyDates = await JourneyEntry.find({ published: true }).select("date").lean();
    const days = new Set(allJourneyDates.map(e => new Date(e.date).toDateString()));
    let streak = 0;
    let d = new Date();
    while (days.has(d.toDateString())) { 
      streak++; 
      d.setDate(d.getDate() - 1); 
    }

    // Determine Last Published / Updated
    // Using the most recent activity date as "Last Updated"
    const lastUpdated = formattedActivity.length > 0 ? formattedActivity[0].date : new Date();

    // Find the most recent published Revision to determine "Last Published"
    const lastPubRevision = await Revision.findOne({ status: "published" }).sort({ createdAt: -1 }).lean();
    const lastPublished = lastPubRevision ? lastPubRevision.createdAt : null;

    res.json({
      success: true,
      data: {
        stats: {
          projects: { total: projTotal, published: projPub },
          journey:  { total: jourTotal, published: jourPub },
          updates:  { total: updTotal,  published: updPub },
          drafts:   { total: totalDrafts, breakdown: drafts }
        },
        siteStatus: {
          maintenanceMode: settingsDoc?.indexing?.maintenanceMode || false,
          lastUpdated,
          lastPublished
        },
        streak,
        recentActivity: formattedActivity,
        recentMedia: mediaRecent,
        currentlyLearning: settingsDoc?.currentlyLearning || null
      }
    });

  } catch (error: any) {
    console.error("Dashboard Aggregation Error:", error);
    res.status(500).json({ success: false, message: "Dashboard aggregation failed" });
  }
}
