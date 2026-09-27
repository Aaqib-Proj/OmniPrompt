import { Router, Response } from 'express';
import { safeError } from '../utils/errors.js';
import { prisma } from '../prisma.js';

const router = Router();

// List Prompt Packs
router.get('/', async (_req, res) => {
  try {
    const packs = await prisma.promptPack.findMany({
      include: {
        items: {
          include: {
            prompt: {
              include: {
                model: true,
                category: true,
                media: { take: 1 }
              }
            }
          }
        },
        _count: { select: { items: true } }
      },
      orderBy: [{ isFeatured: 'desc' }, { downloadsCount: 'desc' }]
    });

    res.json({ packs });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to list packs') });
  }
});

// Export Pack as JSON Bundle
router.get('/:idOrSlug/export', async (req, res): Promise<void> => {
  try {
    const { idOrSlug } = req.params;

    const pack = await prisma.promptPack.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }]
      },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
          include: {
            prompt: {
              include: {
                model: true,
                category: true,
                versions: { orderBy: { createdAt: 'desc' }, take: 1 },
                tags: { include: { tag: true } }
              }
            }
          }
        }
      }
    });

    if (!pack) {
      res.status(404).json({ error: 'Prompt pack not found' });
      return;
    }

    // Increment downloads count
    await prisma.promptPack.update({
      where: { id: pack.id },
      data: { downloadsCount: { increment: 1 } }
    });

    const exportPayload = {
      manifest: {
        title: pack.title,
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        exportedFrom: 'https://promptit.io',
        category: pack.category,
        totalPrompts: pack.items.length,
      },
      prompts: pack.items.map(item => ({
        title: item.prompt.title,
        category: item.prompt.category.name,
        model: item.prompt.model.name,
        fullPrompt: item.prompt.fullPrompt,
        parameters: JSON.parse(item.prompt.versions[0]?.parametersJson || '{}'),
        tags: item.prompt.tags.map(t => t.tag.name),
        license: item.prompt.license,
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${pack.slug}-prompts.json"`);
    res.send(JSON.stringify(exportPayload, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to export prompt pack') });
  }
});

export default router;
