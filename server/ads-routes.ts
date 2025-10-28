import type { Express } from "express";
import { storage } from "./storage";
import { randomUUID } from "crypto";

export async function registerAdsRoutes(app: Express) {
  // ============ Ads Management Routes ============

  // Get all ads with filters
  app.get("/api/admin/ads", async (req, res) => {
    try {
      const { placement, status, search } = req.query;

      // Get all ads from storage
      const allAds = await storage.getAllAds?.() || [];

      let filteredAds = allAds;

      // Apply filters
      if (placement && placement !== "all") {
        filteredAds = filteredAds.filter((ad: any) => ad.placement === placement);
      }

      if (status === "active") {
        filteredAds = filteredAds.filter((ad: any) => ad.active === true);
      } else if (status === "inactive") {
        filteredAds = filteredAds.filter((ad: any) => ad.active === false);
      }

      if (search) {
        filteredAds = filteredAds.filter((ad: any) =>
          ad.name.toLowerCase().includes((search as string).toLowerCase())
        );
      }

      res.json(filteredAds);
    } catch (error) {
      console.error("[Ads] Error fetching ads:", error);
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });

  // Get single ad by ID
  app.get("/api/admin/ads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const ad = await storage.getAd(id);

      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }

      res.json(ad);
    } catch (error) {
      console.error("[Ads] Error fetching ad:", error);
      res.status(500).json({ error: "Failed to fetch ad" });
    }
  });

  // Create new ad
  app.post("/api/admin/ads", async (req, res) => {
    try {
      const {
        name,
        description,
        placement,
        filePath,
        url,
        active,
        startDate,
        endDate,
        budget,
        dailyBudget,
        targetAudience,
        keywords,
        enableTracking,
        enableRetargeting,
        conversionGoal,
      } = req.body;

      // Validate required fields
      if (!name || !placement || !filePath) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate placement
      const validPlacements = ["header", "sidebar-top", "sidebar-middle", "in-article", "footer"];
      if (!validPlacements.includes(placement)) {
        return res.status(400).json({ error: "Invalid placement" });
      }

      const newAd = {
        id: randomUUID(),
        name,
        description: description || "",
        placement,
        filePath,
        url: url || "",
        active: active !== false,
        startDate: startDate || null,
        endDate: endDate || null,
        budget: budget || 0,
        dailyBudget: dailyBudget || 0,
        targetAudience: targetAudience || "",
        keywords: keywords || "",
        enableTracking: enableTracking !== false,
        enableRetargeting: enableRetargeting || false,
        conversionGoal: conversionGoal || "clicks",
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to storage
      await storage.createAd?.(newAd);

      res.status(201).json(newAd);
    } catch (error) {
      console.error("[Ads] Error creating ad:", error);
      res.status(500).json({ error: "Failed to create ad" });
    }
  });

  // Update ad
  app.put("/api/admin/ads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Get existing ad
      const existingAd = await storage.getAdById?.(id);
      if (!existingAd) {
        return res.status(404).json({ error: "Ad not found" });
      }

      // Validate placement if provided
      if (updateData.placement) {
        const validPlacements = ["header", "sidebar-top", "sidebar-middle", "in-article", "footer"];
        if (!validPlacements.includes(updateData.placement)) {
          return res.status(400).json({ error: "Invalid placement" });
        }
      }

      const updatedAd = {
        ...existingAd,
        ...updateData,
        updatedAt: new Date(),
      };

      // Update in storage
      await storage.updateAd?.(id, updatedAd);

      res.json(updatedAd);
    } catch (error) {
      console.error("[Ads] Error updating ad:", error);
      res.status(500).json({ error: "Failed to update ad" });
    }
  });

  // Delete ad
  app.delete("/api/admin/ads/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Check if ad exists
      const ad = await storage.getAd(id);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }

      // Delete from storage
      await storage.deleteAd?.(id);

      res.json({ success: true, message: "Ad deleted successfully" });
    } catch (error) {
      console.error("[Ads] Error deleting ad:", error);
      res.status(500).json({ error: "Failed to delete ad" });
    }
  });

  // Toggle ad status
  app.patch("/api/admin/ads/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;

      const ad = await storage.getAd(id);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }

      const updatedAd = {
        ...ad,
        active: !ad.active,
        updatedAt: new Date(),
      };

      await storage.updateAd?.(id, updatedAd);

      res.json(updatedAd);
    } catch (error) {
      console.error("[Ads] Error toggling ad:", error);
      res.status(500).json({ error: "Failed to toggle ad" });
    }
  });

  // Get ad statistics
  app.get("/api/admin/ads/:id/stats", async (req, res) => {
    try {
      const { id } = req.params;

      const ad = await storage.getAd(id);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }

      const impressions = ad.impressions || 0;
      const clicks = ad.clicks || 0;
      const conversions = ad.conversions || 0;
      const spent = ad.spent || 0;
      const budget = ad.budget || 0;

      const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0";
      const cpc = clicks > 0 ? (spent / clicks).toFixed(2) : "0";
      const cpa = conversions > 0 ? (spent / conversions).toFixed(2) : "0";
      const roi = spent > 0 ? (((budget - spent) / spent) * 100).toFixed(2) : "0";

      res.json({
        id: ad.id,
        name: ad.name,
        placement: ad.placement,
        impressions,
        clicks,
        conversions,
        spent,
        budget,
        ctr,
        cpc,
        cpa,
        roi,
      });
    } catch (error) {
      console.error("[Ads] Error fetching ad stats:", error);
      res.status(500).json({ error: "Failed to fetch ad stats" });
    }
  });

  // Get ads by placement
  app.get("/api/admin/ads/placement/:placement", async (req, res) => {
    try {
      const { placement } = req.params;

      const allAds = await storage.getAllAds?.() || [];
      const adsByPlacement = allAds.filter((ad: any) => ad.placement === placement && ad.active);

      res.json(adsByPlacement);
    } catch (error) {
      console.error("[Ads] Error fetching ads by placement:", error);
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });

  // Track ad impression
  app.post("/api/ads/:id/impression", async (req, res) => {
    try {
      const { id } = req.params;

      const ad = await storage.getAd(id);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }

      const updatedAd = {
        ...ad,
        impressions: (ad.impressions || 0) + 1,
        updatedAt: new Date(),
      };

      await storage.updateAd?.(id, updatedAd);

      res.json({ success: true, impressions: updatedAd.impressions });
    } catch (error) {
      console.error("[Ads] Error tracking impression:", error);
      res.status(500).json({ error: "Failed to track impression" });
    }
  });

  // Track ad click
  app.post("/api/ads/:id/click", async (req, res) => {
    try {
      const { id } = req.params;

      const ad = await storage.getAd(id);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }

      const updatedAd = {
        ...ad,
        clicks: (ad.clicks || 0) + 1,
        updatedAt: new Date(),
      };

      await storage.updateAd?.(id, updatedAd);

      res.json({ success: true, clicks: updatedAd.clicks });
    } catch (error) {
      console.error("[Ads] Error tracking click:", error);
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  // Track ad conversion
  app.post("/api/ads/:id/conversion", async (req, res) => {
    try {
      const { id } = req.params;
      const { value } = req.body;

      const ad = await storage.getAd(id);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }

      const updatedAd = {
        ...ad,
        conversions: (ad.conversions || 0) + 1,
        spent: (ad.spent || 0) + (value || 0),
        updatedAt: new Date(),
      };

      await storage.updateAd?.(id, updatedAd);

      res.json({ success: true, conversions: updatedAd.conversions });
    } catch (error) {
      console.error("[Ads] Error tracking conversion:", error);
      res.status(500).json({ error: "Failed to track conversion" });
    }
  });

  // Bulk update ads
  app.post("/api/admin/ads/bulk/update", async (req, res) => {
    try {
      const { adIds, updates } = req.body;

      if (!adIds || !Array.isArray(adIds) || !updates) {
        return res.status(400).json({ error: "Invalid request" });
      }

      const updatedAds = [];

      for (const adId of adIds) {
        const ad = await storage.getAd(adId);
        if (ad) {
          const updatedAd = {
            ...ad,
            ...updates,
            updatedAt: new Date(),
          };
          await storage.updateAd?.(adId, updatedAd);
          updatedAds.push(updatedAd);
        }
      }

      res.json({ success: true, updated: updatedAds.length, ads: updatedAds });
    } catch (error) {
      console.error("[Ads] Error bulk updating ads:", error);
      res.status(500).json({ error: "Failed to bulk update ads" });
    }
  });

  // Bulk delete ads
  app.post("/api/admin/ads/bulk/delete", async (req, res) => {
    try {
      const { adIds } = req.body;

      if (!adIds || !Array.isArray(adIds)) {
        return res.status(400).json({ error: "Invalid request" });
      }

      let deletedCount = 0;

      for (const adId of adIds) {
        const ad = await storage.getAd(adId);
        if (ad) {
          await storage.deleteAd?.(adId);
          deletedCount++;
        }
      }

      res.json({ success: true, deleted: deletedCount });
    } catch (error) {
      console.error("[Ads] Error bulk deleting ads:", error);
      res.status(500).json({ error: "Failed to bulk delete ads" });
    }
  });

  // Get ads dashboard statistics
  app.get("/api/admin/ads/dashboard/stats", async (req, res) => {
    try {
      const allAds = await storage.getAllAds?.() || [];

      const stats = {
        totalAds: allAds.length,
        activeAds: allAds.filter((ad: any) => ad.active).length,
        totalImpressions: allAds.reduce((sum: number, ad: any) => sum + (ad.impressions || 0), 0),
        totalClicks: allAds.reduce((sum: number, ad: any) => sum + (ad.clicks || 0), 0),
        totalConversions: allAds.reduce((sum: number, ad: any) => sum + (ad.conversions || 0), 0),
        totalBudget: allAds.reduce((sum: number, ad: any) => sum + (ad.budget || 0), 0),
        totalSpent: allAds.reduce((sum: number, ad: any) => sum + (ad.spent || 0), 0),
        byPlacement: {
          header: allAds.filter((ad: any) => ad.placement === "header").length,
          "sidebar-top": allAds.filter((ad: any) => ad.placement === "sidebar-top").length,
          "sidebar-middle": allAds.filter((ad: any) => ad.placement === "sidebar-middle").length,
          "in-article": allAds.filter((ad: any) => ad.placement === "in-article").length,
          footer: allAds.filter((ad: any) => ad.placement === "footer").length,
        },
      };

      res.json(stats);
    } catch (error) {
      console.error("[Ads] Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });
}
