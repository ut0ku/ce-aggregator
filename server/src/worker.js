import { Worker } from 'bullmq';
import { getRedis } from './cache.js';
import { refreshFeed } from './services/aggregator.js';

export function startWorker() {
  const connection = getRedis();
  if (!connection) {
    console.warn('Parse worker skipped: Redis is not connected.');
    return null;
  }

  try {
    const worker = new Worker(
      'volna-parse',
      async (job) => {
        const { citySlug, topicSlug } = job.data;
        await refreshFeed(citySlug, topicSlug);
      },
      { connection, concurrency: 2 },
    );

    worker.on('failed', (job, error) => {
      console.warn(`Parse job failed ${job?.id}:`, error.message);
    });

    return worker;
  } catch (error) {
    console.warn('Parse worker failed to initialize:', error.message);
    return null;
  }
}
