import { prisma } from '../prisma.js';

// In-memory buffer: promptId -> pending view increments
const pendingViews = new Map<string, number>();
let flushTimer: NodeJS.Timeout | null = null;
let isFlushing = false;

/**
 * Record a prompt view in memory without hitting the database immediately.
 * Buffered views are flushed in batches every 15 seconds.
 */
export function recordPromptView(promptId: string): void {
  const current = pendingViews.get(promptId) || 0;
  pendingViews.set(promptId, current + 1);

  // Ensure periodic flush timer is active
  if (!flushTimer) {
    flushTimer = setInterval(() => {
      flushViewBuffer().catch((err) => console.error('Error in periodic view flush:', err));
    }, 15000);
    // Unref so the interval does not prevent Node from exiting cleanly
    if (flushTimer.unref) {
      flushTimer.unref();
    }
  }

  // If buffer has accumulated over 150 entries, trigger an immediate flush
  if (pendingViews.size >= 150) {
    flushViewBuffer().catch((err) => console.error('Error in batch view flush:', err));
  }
}

/**
 * Flush all pending buffered views to the database in a single transaction.
 */
export async function flushViewBuffer(): Promise<void> {
  if (isFlushing || pendingViews.size === 0) return;

  isFlushing = true;

  // Snapshot and clear buffer
  const batch = new Map(pendingViews);
  pendingViews.clear();

  try {
    const updates = Array.from(batch.entries()).map(([promptId, count]) =>
      prisma.prompt.update({
        where: { id: promptId },
        data: { viewsCount: { increment: count } },
        select: { id: true }
      })
    );

    // Execute updates in parallel transaction chunks of 25
    const CHUNK_SIZE = 25;
    for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
      const chunk = updates.slice(i, i + CHUNK_SIZE);
      await prisma.$transaction(chunk).catch((err) => {
        console.error('Failed to flush view batch chunk:', err.message);
      });
    }
  } catch (err: any) {
    console.error('View buffer flush error:', err.message);
  } finally {
    isFlushing = false;
  }
}
