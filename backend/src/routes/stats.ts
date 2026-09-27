import { Router } from 'express';
import { safeError } from '../utils/errors.js';
import { prisma } from '../prisma.js';

const router = Router();

router.get('/summary', async (_req, res) => {
  try {
    const [totalPrompts, totalModels, totalCreators, totalStars, totalForks, recentActivity] = await Promise.all([
      prisma.prompt.count(),
      prisma.model.count(),
      prisma.user.count(),
      prisma.star.count(),
      prisma.fork.count(),
      prisma.prompt.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          category: { select: { name: true } },
          author: { select: { username: true } },
          createdAt: true,
        }
      })
    ]);

    const ticker = recentActivity.map(a => `${a.author.username} published "${a.title.slice(0, 32)}..." in ${a.category.name}`);

    res.json({
      totalPrompts,
      totalModels,
      totalCreators,
      totalStars,
      totalForks,
      ticker,
    });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to fetch platform stats') });
  }
});

export default router;
