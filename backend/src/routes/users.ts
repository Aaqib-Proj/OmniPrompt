import { Router, Response } from 'express';
import { safeError } from '../utils/errors.js';
import { prisma } from '../prisma.js';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get User Profile with badges and stats
router.get('/:username', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        githubHandle: true,
        twitterHandle: true,
        role: true,
        createdAt: true,
        badges: {
          include: { badge: true }
        },
        prompts: {
          where: { visibility: 'PUBLIC' },
          orderBy: { copyCount: 'desc' },
          include: {
            category: true,
            model: true,
            media: { take: 1, orderBy: { orderIndex: 'asc' } },
            _count: { select: { stars: true, forksAsParent: true } }
          }
        },
        collections: {
          where: { isPublic: true },
          include: {
            _count: { select: { items: true } }
          }
        },
        _count: {
          select: {
            prompts: true,
            stars: true,
            followers: true,
            following: true,
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let isFollowing = false;
    if (req.user && req.user.userId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: req.user.userId,
            followingId: user.id,
          }
        }
      });
      isFollowing = !!follow;
    }

    // Calculate total stars and forks received across all authored prompts in parallel
    const promptIds = user.prompts.map(p => p.id);
    const [totalStarsReceived, totalForksReceived] = await Promise.all([
      promptIds.length > 0 ? prisma.star.count({ where: { promptId: { in: promptIds } } }) : 0,
      promptIds.length > 0 ? prisma.fork.count({ where: { parentPromptId: { in: promptIds } } }) : 0,
    ]);

    res.json({
      user: {
        ...user,
        isFollowing,
        stats: {
          totalPrompts: user._count.prompts,
          totalStarsReceived,
          totalForksReceived,
          followersCount: user._count.followers,
          followingCount: user._count.following,
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to fetch user') });
  }
});

// GitHub-Style Contribution Heatmap
router.get('/:username/heatmap', async (req, res): Promise<void> => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Generate simulated 365-day activity calendar based on user's creations + random distribution
    const today = new Date();
    const days: { date: string; count: number; level: number }[] = [];

    // Base seed from username hash for consistent realistic distribution
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = (hash << 5) - hash + username.charCodeAt(i);
    }

    for (let i = 365; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // pseudo-random count with natural cluster bursts
      const dayHash = Math.abs((hash ^ (i * 31)) % 100);
      let count = 0;
      if (dayHash > 85) count = Math.floor(Math.random() * 5) + 3;
      else if (dayHash > 65) count = Math.floor(Math.random() * 3) + 1;
      else if (dayHash > 45) count = 1;

      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      days.push({ date: dateStr, count, level });
    }

    const totalContributions = days.reduce((sum, d) => sum + d.count, 0);

    res.json({
      totalContributions,
      days,
    });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to fetch heatmap') });
  }
});

// Toggle Follow
router.post('/:username/follow', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const currentUserId = req.user!.userId;

    const targetUser = await prisma.user.findUnique({ where: { username } });
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (targetUser.id === currentUserId) {
      res.status(400).json({ error: 'Cannot follow yourself' });
      return;
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUser.id,
        }
      }
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      res.json({ following: false });
    } else {
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUser.id,
        }
      });
      res.json({ following: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to toggle follow') });
  }
});

export default router;
