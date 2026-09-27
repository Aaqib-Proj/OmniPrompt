import { Prompt, Model, Category, PromptPack, Challenge, LineageGraphData, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

const getHeaders = () => {
  const token = localStorage.getItem('promptit_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Prompts
  getPrompts: async (params?: { category?: string; model?: string; search?: string; tag?: string; sort?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.model) searchParams.set('model', params.model);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/api/v1/prompts?${searchParams.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch prompts');
    return res.json() as Promise<{ prompts: Prompt[]; pagination: { total: number; page: number; totalPages: number } }>;
  },

  getPrompt: async (idOrSlug: string) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts/${idOrSlug}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch prompt');
    return res.json() as Promise<Prompt>;
  },

  createPrompt: async (data: any) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create prompt');
    }
    return res.json() as Promise<{ prompt: Prompt }>;
  },

  updatePrompt: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update prompt');
    }
    return res.json() as Promise<{ prompt: Prompt }>;
  },

  forkPrompt: async (promptId: string) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts/${promptId}/fork`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fork prompt');
    return res.json() as Promise<{ prompt: Prompt }>;
  },

  toggleStar: async (promptId: string) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts/${promptId}/star`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle star');
    return res.json() as Promise<{ starred: boolean; starsCount: number }>;
  },

  recordCopy: async (promptId: string) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts/${promptId}/copy`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) return { copyCount: 0 };
    return res.json() as Promise<{ copyCount: number }>;
  },

  reactToPrompt: async (promptId: string, type: string) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts/${promptId}/react`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type }),
    });
    if (!res.ok) throw new Error('Failed to react');
    return res.json();
  },

  getLineage: async (promptId: string) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts/${promptId}/lineage`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch lineage');
    return res.json() as Promise<LineageGraphData>;
  },

  suggestEdit: async (promptId: string, data: any) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts/${promptId}/suggestions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit suggestion');
    return res.json();
  },

  mergeSuggestion: async (suggestionId: string) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts/suggestions/${suggestionId}/merge`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to merge suggestion');
    }
    return res.json();
  },

  getDiscussions: async (promptId: string) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts/${promptId}/discussions`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch discussions');
    return res.json();
  },

  createDiscussion: async (promptId: string, title: string, initialComment?: string) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts/${promptId}/discussions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, initialComment }),
    });
    if (!res.ok) throw new Error('Failed to create discussion');
    return res.json();
  },

  addComment: async (promptId: string, threadId: string, bodyMd: string) => {
    const res = await fetch(`${API_BASE}/api/v1/prompts/${promptId}/discussions/${threadId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bodyMd }),
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  // Models & Categories
  getModels: async () => {
    const res = await fetch(`${API_BASE}/api/v1/models`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch models');
    return res.json() as Promise<{ models: Model[] }>;
  },

  getModel: async (slug: string) => {
    const res = await fetch(`${API_BASE}/api/v1/models/${slug}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch model');
    return res.json() as Promise<{ model: Model & { prompts: Prompt[] } }>;
  },

  getCategories: async () => {
    const res = await fetch(`${API_BASE}/api/v1/categories`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json() as Promise<{ categories: Category[] }>;
  },

  // Stats & Ticker
  getStatsSummary: async () => {
    const res = await fetch(`${API_BASE}/api/v1/stats/summary`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json() as Promise<{
      totalPrompts: number;
      totalModels: number;
      totalCreators: number;
      totalStars: number;
      totalForks: number;
      ticker: string[];
    }>;
  },

  // User Profiles & Heatmap
  getUserProfile: async (username: string) => {
    const res = await fetch(`${API_BASE}/api/v1/users/${username}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json() as Promise<{ user: User & { prompts: Prompt[] } }>;
  },

  getUserHeatmap: async (username: string) => {
    const res = await fetch(`${API_BASE}/api/v1/users/${username}/heatmap`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch heatmap');
    return res.json() as Promise<{ totalContributions: number; days: { date: string; count: number; level: number }[] }>;
  },

  toggleFollow: async (username: string) => {
    const res = await fetch(`${API_BASE}/api/v1/users/${username}/follow`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle follow');
    return res.json() as Promise<{ following: boolean }>;
  },

  // Packs & Challenges
  getPacks: async () => {
    const res = await fetch(`${API_BASE}/api/v1/packs`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch packs');
    return res.json() as Promise<{ packs: PromptPack[] }>;
  },

  getActiveChallenge: async () => {
    const res = await fetch(`${API_BASE}/api/v1/challenges/active`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch challenge');
    return res.json() as Promise<{ challenge: Challenge }>;
  },

  voteChallengeSubmission: async (submissionId: string) => {
    const res = await fetch(`${API_BASE}/api/v1/challenges/submissions/${submissionId}/vote`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to vote');
    return res.json();
  },

  // Upload Local File
  uploadFile: async (file: File): Promise<{ url: string; originalName: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch(`${API_BASE}/api/v1/upload`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              filename: file.name,
              data: base64,
              contentType: file.type,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Upload failed');
          }
          const data = await res.json();
          resolve(data);
        } catch (e) {
          // Fallback to Data URL for reliable local preview and persistence
          resolve({ url: reader.result as string, originalName: file.name });
        }
      };
      reader.onerror = () => reject(new Error('Failed to read local file'));
      reader.readAsDataURL(file);
    });
  }
};
