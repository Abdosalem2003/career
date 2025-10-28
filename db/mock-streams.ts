// Mock in-memory storage for live streams
let liveStreamsData: any[] = [];
let nextId = 1;

export const mockLiveStreams = {
  // Select all
  select: () => ({
    from: () => ({
      where: () => ({ limit: () => Promise.resolve(liveStreamsData) }),
      orderBy: () => Promise.resolve(liveStreamsData),
      limit: () => Promise.resolve(liveStreamsData)
    })
  }),
  
  // Insert
  insert: () => ({
    values: (data: any) => ({
      returning: () => {
        const newStream = {
          id: `stream_${nextId++}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        liveStreamsData.push(newStream);
        return Promise.resolve([newStream]);
      }
    })
  }),
  
  // Update
  update: () => ({
    set: (data: any) => ({
      where: (condition: any) => ({
        returning: () => {
          // Find and update
          const index = liveStreamsData.findIndex(s => s.id === condition.id);
          if (index !== -1) {
            liveStreamsData[index] = {
              ...liveStreamsData[index],
              ...data,
              updatedAt: new Date(),
            };
            return Promise.resolve([liveStreamsData[index]]);
          }
          return Promise.resolve([]);
        }
      })
    })
  }),
  
  // Delete
  delete: () => ({
    where: (condition: any) => ({
      returning: () => {
        const index = liveStreamsData.findIndex(s => s.id === condition.id);
        if (index !== -1) {
          const deleted = liveStreamsData[index];
          liveStreamsData.splice(index, 1);
          return Promise.resolve([deleted]);
        }
        return Promise.resolve([]);
      }
    })
  }),
};
