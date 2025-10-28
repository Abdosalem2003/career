import type { Express } from "express";
import { storage } from "./storage";
import { randomUUID } from "crypto";

export async function registerAdsAPI(app: Express) {
  // ============ GET Endpoints ============

  // جميع الإعلانات (للإدارة)
  app.get("/api/admin/ads", async (req, res) => {
    try {
      const ads = await storage.getAllAds();
      res.json(ads);
    } catch (error) {
      console.error("[Ads API] Error fetching ads:", error);
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });

  // إعلان محدد
  app.get("/api/admin/ads/:id", async (req, res) => {
    try {
      const ad = await storage.getAd(req.params.id);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }
      res.json(ad);
    } catch (error) {
      console.error("[Ads API] Error fetching ad:", error);
      res.status(500).json({ error: "Failed to fetch ad" });
    }
  });

  // الإعلانات النشطة حسب الموقع (للعرض بالموقع)
  app.get("/api/ads/placement/:placement", async (req, res) => {
    try {
      const { placement } = req.params;
      const allAds = await storage.getAllAds();
      
      // تصفية الإعلانات النشطة فقط
      const activeAds = allAds.filter(ad => 
        ad.active && 
        ad.placement === placement &&
        ad.filePath // تأكد من وجود الصورة
      );

      res.json(activeAds);
    } catch (error) {
      console.error("[Ads API] Error fetching ads by placement:", error);
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });

  // إحصائيات الإعلان
  app.get("/api/admin/ads/:id/stats", async (req, res) => {
    try {
      const ad = await storage.getAd(req.params.id);
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
      console.error("[Ads API] Error fetching ad stats:", error);
      res.status(500).json({ error: "Failed to fetch ad stats" });
    }
  });

  // إحصائيات لوحة التحكم
  app.get("/api/admin/ads/dashboard/stats", async (req, res) => {
    try {
      const ads = await storage.getAllAds();

      const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
      const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
      const totalConversions = ads.reduce((sum, ad) => sum + (ad.conversions || 0), 0);
      const totalBudget = ads.reduce((sum, ad) => sum + (ad.budget || 0), 0);
      const totalSpent = ads.reduce((sum, ad) => sum + (ad.spent || 0), 0);
      const activeAds = ads.filter(ad => ad.active).length;

      const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0";
      const avgROI = totalSpent > 0 ? (((totalBudget - totalSpent) / totalSpent) * 100).toFixed(2) : "0";

      res.json({
        totalAds: ads.length,
        activeAds,
        totalImpressions,
        totalClicks,
        totalConversions,
        totalBudget,
        totalSpent,
        avgCTR,
        avgROI,
      });
    } catch (error) {
      console.error("[Ads API] Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ============ POST Endpoints ============

  // إنشاء إعلان جديد
  app.post("/api/admin/ads", async (req, res) => {
    try {
      console.log("[Ads API] Creating ad with data:", req.body);
      
      const { name, placement, url, active, startDate, endDate, budget, filePath, targetPages } = req.body;

      if (!name || !placement) {
        console.error("[Ads API] Missing required fields:", { name, placement });
        return res.status(400).json({ error: "Missing required fields" });
      }

      const ad = await storage.createAd({
        name,
        placement,
        url: url || null,
        active: active !== false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget || 0,
        spent: 0,
        conversions: 0,
        impressions: 0,
        clicks: 0,
        filePath: filePath || null,
        targetPages: targetPages || ["all"],
      });

      console.log("[Ads API] Ad created successfully:", ad);
      res.json(ad);
    } catch (error) {
      console.error("[Ads API] Error creating ad:", error);
      res.status(500).json({ error: "Failed to create ad" });
    }
  });

  // تتبع مشاهدة الإعلان
  app.post("/api/ads/:id/impression", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementAdImpressions(id);
      res.json({ success: true });
    } catch (error) {
      console.error("[Ads API] Error tracking impression:", error);
      res.status(500).json({ error: "Failed to track impression" });
    }
  });

  // تتبع نقرة الإعلان
  app.post("/api/ads/:id/click", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementAdClicks(id);
      res.json({ success: true });
    } catch (error) {
      console.error("[Ads API] Error tracking click:", error);
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  // تتبع تحويل الإعلان
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

      await storage.updateAd(id, updatedAd);
      res.json({ success: true });
    } catch (error) {
      console.error("[Ads API] Error tracking conversion:", error);
      res.status(500).json({ error: "Failed to track conversion" });
    }
  });

  // عمليات جماعية - تحديث
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
          const updated = await storage.updateAd(adId, {
            ...updates,
            updatedAt: new Date(),
          });
          if (updated) updatedAds.push(updated);
        }
      }

      res.json({ success: true, updated: updatedAds.length, ads: updatedAds });
    } catch (error) {
      console.error("[Ads API] Error bulk updating ads:", error);
      res.status(500).json({ error: "Failed to bulk update ads" });
    }
  });

  // عمليات جماعية - حذف
  app.post("/api/admin/ads/bulk/delete", async (req, res) => {
    try {
      const { adIds } = req.body;

      if (!adIds || !Array.isArray(adIds)) {
        return res.status(400).json({ error: "Invalid request" });
      }

      let deletedCount = 0;
      for (const adId of adIds) {
        const success = await storage.deleteAd(adId);
        if (success) deletedCount++;
      }

      res.json({ success: true, deleted: deletedCount });
    } catch (error) {
      console.error("[Ads API] Error bulk deleting ads:", error);
      res.status(500).json({ error: "Failed to bulk delete ads" });
    }
  });

  // ============ PUT/PATCH Endpoints ============

  // تحديث إعلان
  app.put("/api/admin/ads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const ad = await storage.updateAd(id, {
        ...req.body,
        updatedAt: new Date(),
      });

      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }

      res.json(ad);
    } catch (error) {
      console.error("[Ads API] Error updating ad:", error);
      res.status(500).json({ error: "Failed to update ad" });
    }
  });

  // تبديل حالة الإعلان (نشط/معطل)
  app.patch("/api/admin/ads/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;
      const ad = await storage.getAd(id);

      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }

      const updated = await storage.updateAd(id, {
        active: !ad.active,
        updatedAt: new Date(),
      });

      res.json(updated);
    } catch (error) {
      console.error("[Ads API] Error toggling ad:", error);
      res.status(500).json({ error: "Failed to toggle ad" });
    }
  });

  // ============ DELETE Endpoints ============

  // حذف إعلان
  app.delete("/api/admin/ads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAd(id);

      if (!success) {
        return res.status(404).json({ error: "Ad not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("[Ads API] Error deleting ad:", error);
      res.status(500).json({ error: "Failed to delete ad" });
    }
  });
}
