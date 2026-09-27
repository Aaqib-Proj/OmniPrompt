import { Router, Response } from 'express';
import { z } from 'zod';
import { safeError } from '../utils/errors.js';
import { prisma } from '../prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const CreateCollectionSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
});

const AddItemSchema = z.object({
  promptId: z.string().min(1),
});

// Get Collections
router.get('/', async (req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { username: true, avatarUrl: true } },
        items: {
          take: 3,
          include: {
            prompt: {
              include: {
                media: { take: 1 }
              }
            }
          }
        },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ collections });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to list collections') });
  }
});

// Create Collection
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, isPublic } = CreateCollectionSchema.parse(req.body);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'collection';

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description,
        isPublic,
        userId: req.user!.userId,
      }
    });

    res.status(201).json({ collection });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    // Slug is unique per user, so a same-named collection collides.
    if (err?.code === 'P2002') {
      res.status(409).json({ error: 'You already have a collection with that name.' });
      return;
    }
    res.status(500).json({ error: safeError(err, 'Failed to create collection') });
  }
});

// Add / Remove Item from Collection
router.post('/:id/items', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { promptId } = AddItemSchema.parse(req.body);

    const collection = await prisma.collection.findUnique({
      where: { id }
    });

    if (!collection || collection.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Collection not found or access denied' });
      return;
    }

    // Verify the prompt exists, otherwise the insert fails on a foreign key.
    const prompt = await prisma.prompt.findUnique({ where: { id: promptId }, select: { id: true } });
    if (!prompt) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    const existing = await prisma.collectionItem.findUnique({
      where: {
        collectionId_promptId: { collectionId: id, promptId }
      }
    });

    if (existing) {
      await prisma.collectionItem.delete({ where: { id: existing.id } });
      res.json({ inCollection: false });
    } else {
      await prisma.collectionItem.create({
        data: { collectionId: id, promptId }
      });
      res.json({ inCollection: true });
    }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: safeError(err, 'Failed to update collection') });
  }
});

export default router;
