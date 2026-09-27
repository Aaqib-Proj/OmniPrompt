import { Router } from 'express';
import { safeError } from '../utils/errors.js';
import { prisma } from '../prisma.js';

const router = Router();

// List all categories with count
router.get('/', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { prompts: true }
        }
      }
    });

    const formatted = categories.map(c => ({
      ...c,
      promptsCount: c._count.prompts,
    }));

    res.json({ categories: formatted });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to list categories') });
  }
});

export default router;
