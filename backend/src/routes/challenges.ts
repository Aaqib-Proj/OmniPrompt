import { Router, Response } from 'express';
import { safeError } from '../utils/errors.js';
import { prisma } from '../prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get active challenge
router.get('/active', async (_req, res) => {
  try {
    const challenge = await prisma.challenge.findFirst({
      where: { isActive: true },
      include: {
        submissions: {
          orderBy: { votesCount: 'desc' },
          include: {
            user: { select: { username: true, avatarUrl: true } },
            prompt: {
              include: {
                model: true,
                category: true,
                media: { take: 1 },
                _count: { select: { stars: true } }
              }
            }
          }
        }
      }
    });

    res.json({ challenge });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to fetch challenge') });
  }
});

// Submit prompt to challenge
router.post('/:id/submit', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { promptId } = req.body;

    const challenge = await prisma.challenge.findUnique({ where: { id } });
    if (!challenge || !challenge.isActive) {
      res.status(400).json({ error: 'Challenge is not active' });
      return;
    }

    const submission = await prisma.challengeSubmission.create({
      data: {
        challengeId: id,
        promptId,
        userId: req.user!.userId,
      }
    });

    res.status(201).json({ submission });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to submit to challenge') });
  }
});

// Vote for submission
router.post('/submissions/:id/vote', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.challengeSubmission.update({
      where: { id },
      data: { votesCount: { increment: 1 } }
    });
    res.json({ votesCount: updated.votesCount });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to vote') });
  }
});

export default router;
