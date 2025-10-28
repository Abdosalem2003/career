import type { LiveStream, InsertLiveStream } from "@shared/schema";

// In-memory storage for live streams (will persist to database later)
let liveStreams: LiveStream[] = [];
let nextId = 1;

export const liveStreamStorage = {
  // Get active live stream
  getActiveLiveStream(): LiveStream | null {
    const active = liveStreams.find(stream => stream.isActive);
    return active || null;
  },

  // Get all live streams
  getAllLiveStreams(): LiveStream[] {
    return [...liveStreams].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Create live stream
  createLiveStream(data: Omit<InsertLiveStream, 'id' | 'createdAt' | 'updatedAt'>): LiveStream {
    const now = new Date();
    const newStream: LiveStream = {
      id: `stream_${nextId++}`,
      titleEn: data.titleEn,
      titleAr: data.titleAr,
      descriptionEn: data.descriptionEn || null,
      descriptionAr: data.descriptionAr || null,
      streamUrl: data.streamUrl,
      thumbnailUrl: data.thumbnailUrl || null,
      isActive: data.isActive ?? true,
      viewerCount: 0,
      startedAt: data.startedAt || now,
      endedAt: data.endedAt || null,
      createdAt: now,
      updatedAt: now,
    };
    
    liveStreams.push(newStream);
    return newStream;
  },

  // Update live stream
  updateLiveStream(id: string, data: Partial<LiveStream>): LiveStream | null {
    const index = liveStreams.findIndex(s => s.id === id);
    if (index === -1) return null;

    liveStreams[index] = {
      ...liveStreams[index],
      ...data,
      updatedAt: new Date(),
    };

    return liveStreams[index];
  },

  // Delete live stream
  deleteLiveStream(id: string): boolean {
    const index = liveStreams.findIndex(s => s.id === id);
    if (index === -1) return false;

    liveStreams.splice(index, 1);
    return true;
  },

  // Increment viewer count
  incrementViewerCount(id: string): LiveStream | null {
    const stream = liveStreams.find(s => s.id === id);
    if (!stream) return null;

    stream.viewerCount = (stream.viewerCount || 0) + 1;
    return stream;
  },

  // Get stream by ID
  getLiveStreamById(id: string): LiveStream | null {
    return liveStreams.find(s => s.id === id) || null;
  },
};
