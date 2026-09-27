export interface User {
  id: string;
  username: string;
  name?: string | null;
  email?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  githubHandle?: string | null;
  twitterHandle?: string | null;
  role: string;
  createdAt: string;
  badges?: { badge: Badge }[];
  stats?: {
    totalPrompts: number;
    totalStarsReceived: number;
    totalForksReceived: number;
    followersCount: number;
    followingCount: number;
  };
  _count?: {
    prompts: number;
    stars: number;
    followers: number;
    following: number;
  };
}

export interface Model {
  id: string;
  name: string;
  slug: string;
  provider: string;
  modality: string;
  logoUrl?: string | null;
  badgeColor?: string | null;
  description: string;
  contextWindow?: string | null;
  officialUrl?: string | null;
  isFeatured: boolean;
  promptsCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  badgeColor: string;
  promptsCount?: number;
}

export interface PromptMedia {
  id: string;
  promptId: string;
  versionId?: string | null;
  mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'APP_PREVIEW';
  url: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  orderIndex: number;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  versionNumber: string;
  title: string;
  promptText: string;
  parametersJson: string;
  changelog?: string | null;
  editorId: string;
  editor?: { username: string; avatarUrl?: string | null };
  createdAt: string;
}

export interface Prompt {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullPrompt: string;
  descriptionMd: string;
  categoryId: string;
  modelId: string;
  forkedFromPromptId?: string | null;
  license: string;
  visibility: string;
  copyCount: number;
  viewsCount: number;
  isFeatured: boolean;
  sandboxCode?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  attribution?: string | null;
  createdAt: string;
  updatedAt: string;
  author: User;
  category: Category;
  model: Model;
  media: PromptMedia[];
  versions?: PromptVersion[];
  tags: string[];
  isStarred?: boolean;
  starsCount: number;
  forksCount: number;
  commentsCount: number;
  suggestionsCount?: number;
  reactionCounts?: Record<string, number>;
  forkedFrom?: {
    id: string;
    title: string;
    slug: string;
    author: { username: string; avatarUrl?: string | null };
  } | null;
  remixes?: {
    id: string;
    title: string;
    slug: string;
    author: { username: string; avatarUrl?: string | null };
  }[];
  editSuggestions?: EditSuggestion[];
}

export interface EditSuggestion {
  id: string;
  promptId: string;
  authorId: string;
  proposedTitle: string;
  proposedPromptText: string;
  proposedParameters?: string | null;
  notes?: string | null;
  status: 'OPEN' | 'MERGED' | 'REJECTED';
  mergedAt?: string | null;
  createdAt: string;
  author: { username: string; avatarUrl?: string | null };
}

export interface Comment {
  id: string;
  promptId: string;
  threadId?: string | null;
  userId: string;
  parentCommentId?: string | null;
  bodyMd: string;
  createdAt: string;
  user: { username: string; avatarUrl?: string | null };
}

export interface FeedbackThread {
  id: string;
  promptId: string;
  authorId: string;
  title: string;
  status: 'OPEN' | 'RESOLVED';
  tag: string;
  createdAt: string;
  author: { username: string; avatarUrl?: string | null };
  comments: Comment[];
}

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'OBSIDIAN';
}

export interface PromptPack {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  isFeatured: boolean;
  downloadsCount: number;
  items?: { prompt: Prompt }[];
  _count?: { items: number };
}

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  theme: string;
  prize: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  submissions?: {
    id: string;
    votesCount: number;
    user: { username: string; avatarUrl?: string | null };
    prompt: Prompt;
  }[];
}

export interface LineageGraphData {
  nodes: {
    id: string;
    title: string;
    slug: string;
    author: string;
    avatar?: string | null;
    isRoot?: boolean;
    isCurrent?: boolean;
    isRemix?: boolean;
  }[];
  edges: {
    from: string;
    to: string;
    label: string;
  }[];
}
