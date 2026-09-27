import { Router, Response } from 'express';
import { safeError } from '../utils/errors.js';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { createActionLimiter } from '../middleware/rateLimiters.js';
import { clearApiCache } from '../middleware/cache.js';
import { recordPromptView } from '../services/viewBuffer.js';

const router = Router();

// List Prompts with rich filters
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      category,
      model,
      search,
      tag,
      sort = 'trending',
      featured,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {
      visibility: 'PUBLIC'
    };

    if (category) {
      where.category = { slug: category as string };
    }

    if (model) {
      where.model = { slug: model as string };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag as string }
        }
      };
    }

    if (search) {
      const q = (search as string).trim().slice(0, 80);
      if (q.length > 0) {
        where.OR = [
          { title: { contains: q } },
          { shortDescription: { contains: q } },
        ];
      }
    }

    let orderBy: any = [{ isFeatured: 'desc' }, { copyCount: 'desc' }];
    if (sort === 'stars') {
      orderBy = { stars: { _count: 'desc' } };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'copies') {
      orderBy = { copyCount: 'desc' };
    } else if (sort === 'trending') {
      orderBy = [{ viewsCount: 'desc' }, { copyCount: 'desc' }];
    }

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        take,
        skip,
        orderBy,
        include: {
          author: {
            select: { id: true, username: true, name: true, avatarUrl: true, role: true }
          },
          category: true,
          model: true,
          media: {
            orderBy: { orderIndex: 'asc' }
          },
          tags: {
            include: { tag: true }
          },
          _count: {
            select: {
              stars: true,
              forksAsParent: true,
              comments: true,
              editSuggestions: true,
            }
          }
        }
      }),
      prisma.prompt.count({ where })
    ]);

    // Check if current user has starred any of these
    let userStarredSet = new Set<string>();
    if (req.user) {
      const userStars = await prisma.star.findMany({
        where: {
          userId: req.user.userId,
          promptId: { in: prompts.map(p => p.id) }
        },
        select: { promptId: true }
      });
      userStarredSet = new Set(userStars.map(s => s.promptId));
    }

    const formatted = prompts.map(p => ({
      ...p,
      isStarred: userStarredSet.has(p.id),
      starsCount: p._count.stars,
      forksCount: p._count.forksAsParent,
      commentsCount: p._count.comments,
      tags: p.tags.map(t => t.tag.name),
    }));

    res.json({
      prompts: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to list prompts') });
  }
});

// Get Single Prompt by ID or Slug
router.get('/:idOrSlug', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;

    const prompt = await prisma.prompt.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatarUrl: true, bio: true, role: true }
        },
        category: true,
        model: true,
        media: {
          orderBy: { orderIndex: 'asc' }
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          include: {
            editor: {
              select: { username: true, avatarUrl: true }
            }
          }
        },
        tags: {
          include: { tag: true }
        },
        forkedFrom: {
          select: {
            id: true,
            title: true,
            slug: true,
            author: {
              select: { username: true, avatarUrl: true }
            }
          }
        },
        remixes: {
          take: 5,
          select: {
            id: true,
            title: true,
            slug: true,
            author: {
              select: { username: true, avatarUrl: true }
            }
          }
        },
        editSuggestions: {
          where: { status: 'OPEN' },
          include: {
            author: {
              select: { username: true, avatarUrl: true }
            }
          }
        },
        reactions: true,
        _count: {
          select: {
            stars: true,
            forksAsParent: true,
            comments: true,
            editSuggestions: true,
          }
        }
      }
    });

    if (!prompt) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    // Record view in memory buffer (flushed in bulk periodically, zero connection pool pressure)
    recordPromptView(prompt.id);

    let isStarred = false;
    if (req.user) {
      const star = await prisma.star.findUnique({
        where: {
          userId_promptId: {
            userId: req.user.userId,
            promptId: prompt.id
          }
        }
      });
      isStarred = !!star;
    }

    // Group reactions
    const reactionCounts: Record<string, number> = {};
    for (const r of prompt.reactions) {
      reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
    }

    res.json({
      ...prompt,
      isStarred,
      starsCount: prompt._count.stars,
      forksCount: prompt._count.forksAsParent,
      commentsCount: prompt._count.comments,
      suggestionsCount: prompt._count.editSuggestions,
      reactionCounts,
      tags: prompt.tags.map(t => t.tag.name),
    });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to fetch prompt') });
  }
});

// Create New Prompt
const CreatePromptSchema = z.object({
  title: z.string().min(3).max(120),
  shortDescription: z.string().min(10).max(300),
  fullPrompt: z.string().min(10),
  descriptionMd: z.string().optional(),
  categoryId: z.string(),
  modelId: z.string(),
  parameters: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  mediaUrls: z.array(z.object({
    type: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'APP_PREVIEW']),
    url: z.string().min(1),
    caption: z.string().optional()
  })).optional(),
  sandboxCode: z.string().optional(),
  license: z.string().default('MIT-Prompt'),
});

router.post('/', requireAuth, createActionLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = CreatePromptSchema.parse(req.body);
    const baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const prompt = await prisma.prompt.create({
      data: {
        title: data.title,
        slug,
        shortDescription: data.shortDescription,
        fullPrompt: data.fullPrompt,
        descriptionMd: data.descriptionMd || `### Usage\n${data.shortDescription}`,
        categoryId: data.categoryId,
        modelId: data.modelId,
        authorId: req.user!.userId,
        license: data.license,
        sandboxCode: data.sandboxCode || null,
        visibility: 'PUBLIC',
      }
    });

    // Create v1.0
    const version = await prisma.promptVersion.create({
      data: {
        promptId: prompt.id,
        versionNumber: 'v1.0',
        title: 'Initial Commit',
        promptText: data.fullPrompt,
        parametersJson: JSON.stringify(data.parameters || {}),
        changelog: 'First version of the prompt card.',
        editorId: req.user!.userId,
      }
    });

    // Add media in a single batch query
    if (data.mediaUrls && data.mediaUrls.length > 0) {
      await prisma.promptMedia.createMany({
        data: data.mediaUrls.map((m, i) => ({
          promptId: prompt.id,
          versionId: version.id,
          mediaType: m.type,
          url: m.url,
          caption: m.caption,
          orderIndex: i,
        }))
      });
    }

    // Add tags in parallel and batch relation insert
    if (data.tags && data.tags.length > 0) {
      const tagRecords = await Promise.all(
        data.tags.map((tagName) => {
          const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return prisma.tag.upsert({
            where: { slug: tagSlug },
            update: {},
            create: { name: tagName, slug: tagSlug }
          });
        })
      );

      await prisma.promptTag.createMany({
        data: tagRecords.map((t) => ({ promptId: prompt.id, tagId: t.id })),
      }).catch(() => {});
    }

    clearApiCache('/prompts');
    res.status(201).json({ prompt });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: safeError(err, 'Failed to create prompt') });
  }
});

// Update Prompt (Author or Admin only)
const UpdatePromptSchema = z.object({
  title: z.string().min(3).max(120),
  shortDescription: z.string().min(10).max(300),
  fullPrompt: z.string().min(10),
  descriptionMd: z.string().optional(),
  categoryId: z.string(),
  modelId: z.string(),
  parameters: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  mediaUrls: z.array(z.object({
    type: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'APP_PREVIEW']),
    url: z.string().min(1),
    caption: z.string().optional().nullable()
  })).optional(),
  sandboxCode: z.string().optional().nullable(),
  license: z.string().default('MIT-Prompt'),
  changelog: z.string().optional(),
});

router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.prompt.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    if (!existing) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    if (existing.authorId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Only the prompt author can edit this prompt' });
      return;
    }

    const data = UpdatePromptSchema.parse(req.body);

    // Calculate version number bump
    const currentVersion = existing.versions[0];
    let nextVerNumber = 'v1.1';
    if (currentVersion?.versionNumber) {
      const num = parseFloat(currentVersion.versionNumber.replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) {
        nextVerNumber = `v${(num + 0.1).toFixed(1)}`;
      }
    }

    // Create new version record to preserve history
    const version = await prisma.promptVersion.create({
      data: {
        promptId: existing.id,
        versionNumber: nextVerNumber,
        title: data.title,
        promptText: data.fullPrompt,
        parametersJson: JSON.stringify(data.parameters || {}),
        changelog: data.changelog || 'Updated prompt details.',
        editorId: req.user!.userId,
      }
    });

    // Update main prompt record
    await prisma.prompt.update({
      where: { id },
      data: {
        title: data.title,
        shortDescription: data.shortDescription,
        fullPrompt: data.fullPrompt,
        descriptionMd: data.descriptionMd || existing.descriptionMd,
        categoryId: data.categoryId,
        modelId: data.modelId,
        license: data.license,
        sandboxCode: data.sandboxCode !== undefined ? data.sandboxCode : existing.sandboxCode,
        updatedAt: new Date(),
      }
    });

    // Update media items
    if (data.mediaUrls !== undefined) {
      await prisma.promptMedia.deleteMany({
        where: { promptId: id }
      });

      if (data.mediaUrls.length > 0) {
        await prisma.promptMedia.createMany({
          data: data.mediaUrls.map((m, i) => ({
            promptId: id,
            versionId: version.id,
            mediaType: m.type,
            url: m.url,
            caption: m.caption || null,
            orderIndex: i,
          }))
        });
      }
    }

    // Update tags
    if (data.tags !== undefined) {
      await prisma.promptTag.deleteMany({
        where: { promptId: id }
      });

      if (data.tags.length > 0) {
        const tagRecords = await Promise.all(
          data.tags.map((tagName) => {
            const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return prisma.tag.upsert({
              where: { slug: tagSlug },
              update: {},
              create: { name: tagName, slug: tagSlug }
            });
          })
        );

        await prisma.promptTag.createMany({
          data: tagRecords.map((t) => ({ promptId: id, tagId: t.id }))
        }).catch(() => {});
      }
    }

    clearApiCache('/prompts');

    const fullUpdated = await prisma.prompt.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatarUrl: true, role: true }
        },
        category: true,
        model: true,
        media: {
          orderBy: { orderIndex: 'asc' }
        },
        versions: {
          orderBy: { createdAt: 'desc' }
        },
        tags: {
          include: { tag: true }
        }
      }
    });

    res.json({ prompt: fullUpdated });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: safeError(err, 'Failed to update prompt') });
  }
});

// Fork a Prompt (GitHub-style Remix)
router.post('/:id/fork', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const parent = await prisma.prompt.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { createdAt: 'desc' }, take: 1 },
        media: true,
        tags: { include: { tag: true } }
      }
    });

    if (!parent) {
      res.status(404).json({ error: 'Parent prompt not found' });
      return;
    }

    const baseSlug = `${parent.title}-remix`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create child prompt
    const forkedPrompt = await prisma.prompt.create({
      data: {
        title: `${parent.title} (Remix)`,
        slug,
        shortDescription: `Remixed from @${parent.authorId}: ${parent.shortDescription}`,
        fullPrompt: parent.fullPrompt,
        descriptionMd: `> Forked from [${parent.title}](/prompts/${parent.slug})\n\n${parent.descriptionMd}`,
        categoryId: parent.categoryId,
        modelId: parent.modelId,
        authorId: req.user!.userId,
        forkedFromPromptId: parent.id,
        license: parent.license,
        sandboxCode: parent.sandboxCode,
      }
    });

    // Create v1.0 of fork
    const version = await prisma.promptVersion.create({
      data: {
        promptId: forkedPrompt.id,
        versionNumber: 'v1.0',
        title: `Forked from ${parent.title}`,
        promptText: parent.fullPrompt,
        parametersJson: parent.versions[0]?.parametersJson || '{}',
        changelog: 'Forked and initialized new branch.',
        editorId: req.user!.userId,
      }
    });

    // Copy media in a single batch query
    if (parent.media && parent.media.length > 0) {
      await prisma.promptMedia.createMany({
        data: parent.media.map(m => ({
          promptId: forkedPrompt.id,
          versionId: version.id,
          mediaType: m.mediaType,
          url: m.url,
          caption: m.caption,
          orderIndex: m.orderIndex,
        }))
      });
    }

    // Copy tags in a single batch query
    if (parent.tags && parent.tags.length > 0) {
      await prisma.promptTag.createMany({
        data: parent.tags.map(t => ({ promptId: forkedPrompt.id, tagId: t.tagId }))
      }).catch(() => {});
    }

    // Record in Fork table
    await prisma.fork.create({
      data: {
        parentPromptId: parent.id,
        childPromptId: forkedPrompt.id,
      }
    });

    clearApiCache('/prompts');
    res.status(201).json({ prompt: forkedPrompt });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to fork prompt') });
  }
});

// Toggle Star
router.post('/:id/star', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.star.findUnique({
      where: {
        userId_promptId: { userId, promptId: id }
      }
    });

    let starred = false;
    if (existing) {
      await prisma.star.delete({
        where: { id: existing.id }
      });
      starred = false;
    } else {
      await prisma.star.create({
        data: { userId, promptId: id }
      });
      starred = true;
    }

    const starsCount = await prisma.star.count({
      where: { promptId: id }
    });

    clearApiCache('/prompts');
    res.json({ starred, starsCount });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to toggle star') });
  }
});

// Increment Copy Counter
router.post('/:id/copy', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.prompt.update({
      where: { id },
      data: { copyCount: { increment: 1 } },
      select: { copyCount: true }
    });
    res.json({ copyCount: updated.copyCount });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record copy count' });
  }
});

// Add Reaction
const ReactionSchema = z.object({
  type: z.enum(['FIRE', 'CONFUSED', 'BROKEN', 'HEART', 'BULB']),
});

router.post('/:id/react', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { type } = ReactionSchema.parse(req.body);
    const userId = req.user!.userId;

    // Idempotent: reacting again with the same type must not stack duplicate rows
    // (the UI never un-reacts, so a reload would otherwise inflate the counts).
    const existing = await prisma.reaction.findFirst({ where: { promptId: id, userId, type } });
    if (existing) {
      res.json({ reaction: existing });
      return;
    }

    const reaction = await prisma.reaction.create({
      data: { promptId: id, userId, type },
    });
    res.json({ reaction });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: safeError(err, 'Failed to react') });
  }
});

// Get Lineage Graph (Ancestors and Remixes)
router.get('/:id/lineage', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const target = await prisma.prompt.findUnique({
      where: { id },
      include: {
        author: { select: { username: true, avatarUrl: true } },
        forkedFrom: {
          include: {
            author: { select: { username: true, avatarUrl: true } }
          }
        },
        remixes: {
          include: {
            author: { select: { username: true, avatarUrl: true } }
          }
        }
      }
    });

    if (!target) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    const nodes: any[] = [];
    const edges: any[] = [];

    // Root / Parent
    if (target.forkedFrom) {
      nodes.push({
        id: target.forkedFrom.id,
        title: target.forkedFrom.title,
        slug: target.forkedFrom.slug,
        author: target.forkedFrom.author.username,
        avatar: target.forkedFrom.author.avatarUrl,
        isRoot: true,
      });
      edges.push({
        from: target.forkedFrom.id,
        to: target.id,
        label: 'forked from'
      });
    }

    // Current
    nodes.push({
      id: target.id,
      title: target.title,
      slug: target.slug,
      author: target.author.username,
      avatar: target.author.avatarUrl,
      isCurrent: true,
    });

    // Remixes
    for (const r of target.remixes) {
      nodes.push({
        id: r.id,
        title: r.title,
        slug: r.slug,
        author: r.author.username,
        avatar: r.author.avatarUrl,
        isRemix: true,
      });
      edges.push({
        from: target.id,
        to: r.id,
        label: 'remixed by'
      });
    }

    res.json({ nodes, edges });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to fetch lineage') });
  }
});

// Propose an Edit (Pull Request)
const SuggestionSchema = z.object({
  proposedTitle: z.string().min(3).max(120),
  proposedPromptText: z.string().min(10),
  proposedParameters: z.record(z.any()).optional(),
  notes: z.string().max(2000).optional(),
});

router.post('/:id/suggestions', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { proposedTitle, proposedPromptText, proposedParameters, notes } = SuggestionSchema.parse(req.body);

    const suggestion = await prisma.editSuggestion.create({
      data: {
        promptId: id,
        authorId: req.user!.userId,
        proposedTitle,
        proposedPromptText,
        proposedParameters: proposedParameters ? JSON.stringify(proposedParameters) : null,
        notes,
        status: 'OPEN',
      }
    });

    res.status(201).json({ suggestion });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: safeError(err, 'Failed to create suggestion') });
  }
});

// Merge an Edit Suggestion (Author Accepts PR)
router.post('/suggestions/:suggestionId/merge', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { suggestionId } = req.params;

    const suggestion = await prisma.editSuggestion.findUnique({
      where: { id: suggestionId },
      include: {
        prompt: {
          include: {
            versions: { orderBy: { createdAt: 'desc' }, take: 1 }
          }
        }
      }
    });

    if (!suggestion) {
      res.status(404).json({ error: 'Suggestion not found' });
      return;
    }

    if (suggestion.prompt.authorId !== req.user!.userId) {
      res.status(403).json({ error: 'Only the prompt author can merge suggestions' });
      return;
    }

    const currentVersion = suggestion.prompt.versions[0];
    const nextVerNumber = currentVersion ? `v${(parseFloat(currentVersion.versionNumber.replace('v', '')) + 0.1).toFixed(1)}` : 'v2.0';

    // Create new version
    const newVersion = await prisma.promptVersion.create({
      data: {
        promptId: suggestion.promptId,
        versionNumber: nextVerNumber,
        title: suggestion.proposedTitle,
        promptText: suggestion.proposedPromptText,
        parametersJson: suggestion.proposedParameters || currentVersion?.parametersJson || '{}',
        changelog: `Merged suggestion from community: ${suggestion.notes || 'Parameter refinement'}`,
        editorId: suggestion.authorId,
      }
    });

    // Update prompt
    await prisma.prompt.update({
      where: { id: suggestion.promptId },
      data: {
        fullPrompt: suggestion.proposedPromptText,
        updatedAt: new Date(),
      }
    });

    // Mark suggestion merged
    await prisma.editSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: 'MERGED',
        mergedAt: new Date(),
      }
    });

    res.json({ message: 'Suggestion merged successfully', version: newVersion });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to merge suggestion') });
  }
});

// Discussions / Feedback Threads
router.get('/:id/discussions', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const threads = await prisma.feedbackThread.findMany({
      where: { promptId: id },
      include: {
        author: { select: { username: true, avatarUrl: true } },
        comments: {
          include: {
            user: { select: { username: true, avatarUrl: true } },
            reactions: true,
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ threads });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to fetch discussions') });
  }
});

// Post New Discussion Thread
const DiscussionSchema = z.object({
  title: z.string().min(3).max(200),
  tag: z.string().max(40).default('feedback'),
  initialComment: z.string().max(5000).optional(),
});

router.post('/:id/discussions', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, tag, initialComment } = DiscussionSchema.parse(req.body);

    const thread = await prisma.feedbackThread.create({
      data: {
        promptId: id,
        authorId: req.user!.userId,
        title,
        tag,
      }
    });

    if (initialComment) {
      await prisma.comment.create({
        data: {
          promptId: id,
          threadId: thread.id,
          userId: req.user!.userId,
          bodyMd: initialComment,
        }
      });
    }

    res.status(201).json({ thread });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: safeError(err, 'Failed to create discussion thread') });
  }
});

// Add Comment to Discussion
const CommentSchema = z.object({
  bodyMd: z.string().min(1).max(5000),
  parentCommentId: z.string().nullable().optional(),
});

router.post('/:id/discussions/:threadId/comments', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, threadId } = req.params;
    const { bodyMd, parentCommentId } = CommentSchema.parse(req.body);

    const comment = await prisma.comment.create({
      data: {
        promptId: id,
        threadId,
        userId: req.user!.userId,
        bodyMd,
        parentCommentId: parentCommentId || null,
      },
      include: {
        user: { select: { username: true, avatarUrl: true } }
      }
    });

    res.status(201).json({ comment });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: safeError(err, 'Failed to add comment') });
  }
});

export default router;
