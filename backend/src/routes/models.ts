import { Router } from 'express';
import { safeError } from '../utils/errors.js';
import { prisma } from '../prisma.js';

const router = Router();

// List all models with prompt count
router.get('/', async (_req, res) => {
  try {
    const models = await prisma.model.findMany({
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { prompts: true }
        }
      }
    });

    const formatted = models.map(m => ({
      ...m,
      promptsCount: m._count.prompts,
    }));

    res.json({ models: formatted });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to list models') });
  }
});

// Get single model by slug with all its prompts
router.get('/:slug', async (req, res): Promise<void> => {
  try {
    const { slug } = req.params;
    const model = await prisma.model.findUnique({
      where: { slug },
      include: {
        prompts: {
          where: { visibility: 'PUBLIC' },
          include: {
            author: { select: { username: true, avatarUrl: true } },
            category: true,
            media: { take: 1, orderBy: { orderIndex: 'asc' } },
            _count: { select: { stars: true, forksAsParent: true } }
          },
          orderBy: { copyCount: 'desc' }
        },
        _count: { select: { prompts: true } }
      }
    });

    if (!model) {
      res.status(404).json({ error: 'Model not found' });
      return;
    }

    res.json({
      model: {
        ...model,
        promptsCount: model._count.prompts,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to fetch model') });
  }
});

export default router;
