import { Queue } from 'bullmq';
import { config } from './config.js';
import { getRedis } from './cache.js';

let queue = null;

export function getParseQueue() {
  const connection = getRedis();
  if (!connection) return null;
  if (!queue) {
    queue = new Queue('volna-parse', {
      connection,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 20,
        attempts: 2,
      },
    });
  }
  return queue;
}

export async function enqueueParse({ citySlug, topicSlug }) {
  const parseQueue = getParseQueue();
  if (!parseQueue) return false;
  await parseQueue.add(
    'refresh-feed',
    { citySlug, topicSlug },
    { jobId: `feed:${citySlug}:${topicSlug}`, delay: 50 },
  );
  return true;
}

export { config };
