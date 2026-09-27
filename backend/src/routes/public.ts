import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// Public Prompt API by ID (Developer access)
router.get('/prompts/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        author: { select: { username: true } },
        category: { select: { name: true, slug: true } },
        model: { select: { name: true, provider: true } },
        versions: { orderBy: { createdAt: 'desc' }, take: 1 },
      }
    });

    if (!prompt || prompt.visibility !== 'PUBLIC') {
      res.status(404).json({ error: 'Prompt not found or is private' });
      return;
    }

    res.json({
      id: prompt.id,
      title: prompt.title,
      slug: prompt.slug,
      promptText: prompt.fullPrompt,
      category: prompt.category.name,
      model: prompt.model.name,
      provider: prompt.model.provider,
      author: prompt.author.username,
      version: prompt.versions[0]?.versionNumber || 'v1.0',
      parameters: JSON.parse(prompt.versions[0]?.parametersJson || '{}'),
      license: prompt.license,
      updatedAt: prompt.updatedAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal API error' });
  }
});

export default router;
