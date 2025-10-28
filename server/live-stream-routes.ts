import type { Express } from "express";
import crypto from "crypto";

// In-memory storage for live streams (mock database)
let liveStreamsStorage: any[] = [];
let streamIdCounter = 1;

// In-memory storage for chat messages and likes
let chatMessages: Map<string, any[]> = new Map();
let streamLikes: Map<string, Set<string>> = new Map();

export function registerLiveStreamRoutes(app: Express) {
  
  // ============ Admin Routes ============
  
  // Get all streams (Admin)
  app.get("/api/admin/live-streams", async (req, res) => {
    try {
      const streams = liveStreamsStorage.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      res.json(streams);
    } catch (error) {
      console.error("Error fetching streams:", error);
      res.status(500).json({ error: "Failed to fetch streams" });
    }
  });

  // Get stream stats (Admin)
  app.get("/api/admin/live-streams/stats", async (req, res) => {
    try {
      const stats = {
        totalStreams: liveStreamsStorage.length,
        liveNow: liveStreamsStorage.filter(s => s.status === 'live').length,
        totalViewers: liveStreamsStorage
          .filter(s => s.status === 'live')
          .reduce((sum: number, s: any) => sum + (s.viewerCount || 0), 0),
        scheduledStreams: liveStreamsStorage.filter(s => s.status === 'scheduled').length,
        avgDuration: 0,
        peakViewers: Math.max(...liveStreamsStorage.map(s => s.maxViewers || 0), 0),
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get single stream (Admin)
  app.get("/api/admin/live-streams/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const stream = liveStreamsStorage.find(s => s.id === id);
      
      if (!stream) {
        return res.status(404).json({ error: "Stream not found" });
      }
      
      res.json(stream);
    } catch (error) {
      console.error("Error fetching stream:", error);
      res.status(500).json({ error: "Failed to fetch stream" });
    }
  });

  // Create stream (Admin)
  app.post("/api/admin/live-streams", async (req, res) => {
    try {
      const data = req.body;
      
      // Generate RTMP key if not provided
      if (data.streamType === 'rtmp' && !data.rtmpKey) {
        data.rtmpKey = crypto.randomBytes(16).toString('hex');
      }
      
      // Generate screen share ID if not provided
      if (data.streamType === 'screen_share' && !data.screenShareId) {
        data.screenShareId = crypto.randomBytes(16).toString('hex');
      }
      
      // Set default RTMP URL if not provided
      if (data.streamType === 'rtmp' && !data.rtmpUrl) {
        data.rtmpUrl = 'rtmp://localhost/live';
      }
      
      const newStream = {
        id: `stream_${streamIdCounter++}`,
        ...data,
        status: data.status || 'scheduled',
        isActive: data.isActive !== false,
        viewerCount: 0,
        maxViewers: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      liveStreamsStorage.push(newStream);
      
      console.log("[Live Streams] Created:", newStream.id);
      res.json(newStream);
    } catch (error) {
      console.error("Error creating stream:", error);
      res.status(500).json({ error: "Failed to create stream" });
    }
  });

  // Update stream (Admin)
  app.patch("/api/admin/live-streams/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const index = liveStreamsStorage.findIndex(s => s.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Stream not found" });
      }
      
      liveStreamsStorage[index] = {
        ...liveStreamsStorage[index],
        ...data,
        updatedAt: new Date(),
      };
      
      res.json(liveStreamsStorage[index]);
    } catch (error) {
      console.error("Error updating stream:", error);
      res.status(500).json({ error: "Failed to update stream" });
    }
  });

  // Update stream status (Admin)
  app.patch("/api/admin/live-streams/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const index = liveStreamsStorage.findIndex(s => s.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Stream not found" });
      }
      
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };
      
      if (status === 'live' && !liveStreamsStorage[index].startedAt) {
        updateData.startedAt = new Date();
      } else if (status === 'ended') {
        updateData.endedAt = new Date();
        
        if (liveStreamsStorage[index].startedAt) {
          const duration = Math.floor(
            (new Date().getTime() - new Date(liveStreamsStorage[index].startedAt).getTime()) / 1000
          );
          updateData.duration = duration;
        }
      }
      
      liveStreamsStorage[index] = {
        ...liveStreamsStorage[index],
        ...updateData,
      };
      
      res.json(liveStreamsStorage[index]);
    } catch (error) {
      console.error("Error updating stream status:", error);
      res.status(500).json({ error: "Failed to update stream status" });
    }
  });

  // Delete stream (Admin)
  app.delete("/api/admin/live-streams/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const index = liveStreamsStorage.findIndex(s => s.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Stream not found" });
      }
      
      const deleted = liveStreamsStorage[index];
      liveStreamsStorage.splice(index, 1);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting stream:", error);
      res.status(500).json({ error: "Failed to delete stream" });
    }
  });

  // Start stream (Admin)
  app.post("/api/admin/live-streams/:id/start", async (req, res) => {
    try {
      const { id } = req.params;
      
      const index = liveStreamsStorage.findIndex(s => s.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Stream not found" });
      }
      
      liveStreamsStorage[index] = {
        ...liveStreamsStorage[index],
        status: 'live',
        startedAt: new Date(),
        updatedAt: new Date(),
      };
      
      res.json(liveStreamsStorage[index]);
    } catch (error) {
      console.error("Error starting stream:", error);
      res.status(500).json({ error: "Failed to start stream" });
    }
  });

  // Stop stream (Admin)
  app.post("/api/admin/live-streams/:id/stop", async (req, res) => {
    try {
      const { id } = req.params;
      
      const index = liveStreamsStorage.findIndex(s => s.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Stream not found" });
      }
      
      let duration = 0;
      if (liveStreamsStorage[index].startedAt) {
        duration = Math.floor(
          (new Date().getTime() - new Date(liveStreamsStorage[index].startedAt).getTime()) / 1000
        );
      }
      
      liveStreamsStorage[index] = {
        ...liveStreamsStorage[index],
        status: 'ended',
        endedAt: new Date(),
        duration,
        updatedAt: new Date(),
      };
      
      res.json(liveStreamsStorage[index]);
    } catch (error) {
      console.error("Error stopping stream:", error);
      res.status(500).json({ error: "Failed to stop stream" });
    }
  });

  // Increment viewer count
  app.post("/api/admin/live-streams/:id/viewer", async (req, res) => {
    try {
      const { id } = req.params;
      
      const index = liveStreamsStorage.findIndex(s => s.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Stream not found" });
      }
      
      const currentViewers = (liveStreamsStorage[index].viewerCount || 0) + 1;
      const maxViewers = Math.max(currentViewers, liveStreamsStorage[index].maxViewers || 0);
      
      liveStreamsStorage[index] = {
        ...liveStreamsStorage[index],
        viewerCount: currentViewers,
        maxViewers,
        updatedAt: new Date(),
      };
      
      res.json(liveStreamsStorage[index]);
    } catch (error) {
      console.error("Error incrementing viewer:", error);
      res.status(500).json({ error: "Failed to increment viewer" });
    }
  });

  // ============ Public Routes ============
  
  // Get active stream (Public)
  app.get("/api/streams/active", async (req, res) => {
    try {
      const stream = liveStreamsStorage.find(
        s => s.status === 'live' && s.isActive && s.isPublic
      );
      
      res.json(stream || null);
    } catch (error) {
      console.error("Error fetching active stream:", error);
      res.status(500).json({ error: "Failed to fetch active stream" });
    }
  });

  // Get all public streams (Public)
  app.get("/api/streams", async (req, res) => {
    try {
      const streams = liveStreamsStorage
        .filter(s => s.isActive && s.isPublic)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20);
      
      res.json(streams);
    } catch (error) {
      console.error("Error fetching streams:", error);
      res.status(500).json({ error: "Failed to fetch streams" });
    }
  });

  // Get stream by ID (Public)
  app.get("/api/streams/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const stream = liveStreamsStorage.find(
        s => s.id === id && s.isPublic
      );
      
      if (!stream) {
        return res.status(404).json({ error: "Stream not found" });
      }
      
      res.json(stream);
    } catch (error) {
      console.error("Error fetching stream:", error);
      res.status(500).json({ error: "Failed to fetch stream" });
    }
  });

  // ============ Chat Routes ============
  
  // Get chat messages for a stream
  app.get("/api/streams/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const messages = chatMessages.get(id) || [];
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Post a chat message
  app.post("/api/streams/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const { userName, message } = req.body;

      if (!userName || !message) {
        return res.status(400).json({ error: "Username and message are required" });
      }

      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        streamId: id,
        userName,
        message,
        createdAt: new Date().toISOString(),
      };

      if (!chatMessages.has(id)) {
        chatMessages.set(id, []);
      }

      const messages = chatMessages.get(id)!;
      messages.push(newMessage);

      // Keep only last 100 messages
      if (messages.length > 100) {
        messages.shift();
      }

      res.json(newMessage);
    } catch (error) {
      console.error("Error posting message:", error);
      res.status(500).json({ error: "Failed to post message" });
    }
  });

  // ============ Like Routes ============
  
  // Get likes count for a stream
  app.get("/api/streams/:id/likes", async (req, res) => {
    try {
      const { id } = req.params;
      const likes = streamLikes.get(id) || new Set();
      res.json({ count: likes.size, likes: Array.from(likes) });
    } catch (error) {
      console.error("Error fetching likes:", error);
      res.status(500).json({ error: "Failed to fetch likes" });
    }
  });

  // Toggle like for a stream
  app.post("/api/streams/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      const { userName } = req.body;

      if (!userName) {
        return res.status(400).json({ error: "Username is required" });
      }

      if (!streamLikes.has(id)) {
        streamLikes.set(id, new Set());
      }

      const likes = streamLikes.get(id)!;
      
      if (likes.has(userName)) {
        likes.delete(userName);
        res.json({ liked: false, count: likes.size });
      } else {
        likes.add(userName);
        res.json({ liked: true, count: likes.size });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });
}
