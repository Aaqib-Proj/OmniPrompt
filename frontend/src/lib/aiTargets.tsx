import React from 'react';
import { Prompt } from '../types';

export interface AiTarget {
  id: string;
  name: string;
  shortName: string;
  provider: string;
  badgeColor: string;
  isPrefill: boolean;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  getUrl: (promptText: string) => string;
}

// Crisp inline SVGs for AI Model logos
export const ClaudeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

export const OpenAIIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.5 10.7a5.3 5.3 0 0 0-.45-4.27 5.42 5.42 0 0 0-4.75-2.73c-.45 0-.9.06-1.33.18A5.4 5.4 0 0 0 10.4 2a5.42 5.42 0 0 0-5.17 3.8 5.35 5.35 0 0 0-3.3 2.44 5.38 5.38 0 0 0 .54 6.2 5.36 5.36 0 0 0 .45 4.27 5.42 5.42 0 0 0 4.75 2.73c.45 0 .9-.06 1.33-.18A5.4 5.4 0 0 0 13.6 22a5.42 5.42 0 0 0 5.17-3.8 5.35 5.35 0 0 0 3.3-2.44 5.38 5.38 0 0 0-.57-5.06zm-7.9 9.8c-.8 0-1.55-.26-2.17-.7l.1-.06 3.63-2.1a.8.8 0 0 0 .4-.7v-5.1l1.53.88v4.22a3.8 3.8 0 0 1-3.49 3.56zm-8.82-3.73a3.8 3.8 0 0 1-.48-2.69l.1.06 3.63 2.1a.8.8 0 0 0 .8 0l4.43-2.55v1.76l-3.66 2.11a3.82 3.82 0 0 1-4.82-.79zm-1.12-8.52a3.8 3.8 0 0 1 2.22-1.99v4.35a.8.8 0 0 0 .4.7l4.43 2.55-1.53.88-3.65-2.1a3.82 3.82 0 0 1-1.87-4.39zm12.9 2.55l-4.43-2.55 1.53-.88 3.65 2.1a3.82 3.82 0 0 1 1.87 4.39 3.8 3.8 0 0 1-2.22 1.99v-4.35a.8.8 0 0 0-.4-.7zm1.6 4.79a3.8 3.8 0 0 1-.48 2.69l-.1-.06-3.63-2.1a.8.8 0 0 0-.8 0l-4.43 2.55v-1.76l3.66-2.11a3.82 3.82 0 0 1 5.78.79zm-7.66-3.2l-1.95-1.12 1.95-1.13 1.95 1.13-1.95 1.12z" />
  </svg>
);

export const PerplexityIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
  </svg>
);

export const CursorIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.5 3.5l13 8.5-7 1.5-2.5 7-3.5-17z" />
  </svg>
);

export const LovableIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const GeminiIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c.5 4.5 4.5 8.5 9 9-4.5.5-8.5 4.5-9 9-.5-4.5-4.5-8.5-9-9 4.5-.5 8.5-4.5 9-9z" />
  </svg>
);

export const DeepSeekIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12c1.5 2.5 6.5 2.5 8 0M9 9h.01M15 9h.01" />
  </svg>
);

export const MidjourneyIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3L2 12l10 9 10-9L12 3zm0 3.8L18.2 12 12 17.2 5.8 12 12 6.8z" />
  </svg>
);

export const SunoIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </svg>
);

export const ElevenLabsIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <rect x="7" y="5" width="3" height="14" rx="1.5" />
    <rect x="14" y="5" width="3" height="14" rx="1.5" />
  </svg>
);

export const RunwayIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 2h2v8H9V8zm4 0h2v8h-2V8z" />
  </svg>
);

export const SoraIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
    <path d="M10 8l6 4-6 4V8z" fill="#0b0f19" />
  </svg>
);

export const FluxIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
  </svg>
);

export const StabilityIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="6" cy="12" r="3" />
    <circle cx="12" cy="6" r="3" />
    <circle cx="12" cy="18" r="3" />
    <circle cx="18" cy="12" r="3" />
  </svg>
);

export const HiggsfieldIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2L18.8 8 12 11.8 5.2 8 12 4.2zM4.8 9.6L11 13v7.6l-6.2-3.4V9.6zm14.4 0v7.6L13 20.6V13l6.2-3.4z" />
  </svg>
);

// Registry of AI targets
export const AI_TARGETS: Record<string, AiTarget> = {
  claude: {
    id: 'claude',
    name: 'Claude 3.7 Sonnet',
    shortName: 'Claude',
    provider: 'Anthropic',
    badgeColor: '#cc785c',
    isPrefill: true,
    hint: 'Prefilled in chat & ready to send',
    icon: ClaudeIcon,
    getUrl: (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor Composer',
    shortName: 'Cursor',
    provider: 'Cursor',
    badgeColor: '#6366f1',
    isPrefill: true,
    hint: 'Deep link to Cursor editor',
    icon: CursorIcon,
    getUrl: (prompt) => `https://cursor.com/link/prompt?text=${encodeURIComponent(prompt)}`,
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity AI',
    shortName: 'Perplexity',
    provider: 'Perplexity',
    badgeColor: '#20808d',
    isPrefill: true,
    hint: 'Prefilled research query',
    icon: PerplexityIcon,
    getUrl: (prompt) => `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`,
  },
  lovable: {
    id: 'lovable',
    name: 'Lovable.dev',
    shortName: 'Lovable',
    provider: 'Lovable',
    badgeColor: '#ff4081',
    isPrefill: true,
    hint: 'Prefilled fullstack app build prompt',
    icon: LovableIcon,
    getUrl: (prompt) => `https://lovable.dev/#prompt=${encodeURIComponent(prompt)}`,
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'OpenAI ChatGPT',
    shortName: 'ChatGPT',
    provider: 'OpenAI',
    badgeColor: '#10a37f',
    isPrefill: false,
    hint: 'Copies prompt & opens ChatGPT',
    icon: OpenAIIcon,
    getUrl: () => `https://chatgpt.com/`,
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    shortName: 'Gemini',
    provider: 'Google',
    badgeColor: '#4285f4',
    isPrefill: false,
    hint: 'Copies prompt & opens Gemini',
    icon: GeminiIcon,
    getUrl: () => `https://gemini.google.com/app`,
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek R1',
    shortName: 'DeepSeek',
    provider: 'DeepSeek',
    badgeColor: '#0284c7',
    isPrefill: false,
    hint: 'Copies prompt & opens DeepSeek',
    icon: DeepSeekIcon,
    getUrl: () => `https://chat.deepseek.com/`,
  },
  midjourney: {
    id: 'midjourney',
    name: 'Midjourney v7',
    shortName: 'Midjourney',
    provider: 'Midjourney',
    badgeColor: '#4b70e2',
    isPrefill: false,
    hint: 'Copies prompt & opens Midjourney web',
    icon: MidjourneyIcon,
    getUrl: () => `https://alpha.midjourney.com/`,
  },
  suno: {
    id: 'suno',
    name: 'Suno v4',
    shortName: 'Suno',
    provider: 'Suno',
    badgeColor: '#f97316',
    isPrefill: false,
    hint: 'Copies lyrics/prompt & opens Suno',
    icon: SunoIcon,
    getUrl: () => `https://suno.com/create`,
  },
  elevenlabs: {
    id: 'elevenlabs',
    name: 'ElevenLabs Prime',
    shortName: 'ElevenLabs',
    provider: 'ElevenLabs',
    badgeColor: '#84cc16',
    isPrefill: false,
    hint: 'Copies text & opens Voice Studio',
    icon: ElevenLabsIcon,
    getUrl: () => `https://elevenlabs.io/app/speech-synthesis`,
  },
  runway: {
    id: 'runway',
    name: 'Runway Gen-3',
    shortName: 'Runway',
    provider: 'Runway',
    badgeColor: '#22c55e',
    isPrefill: false,
    hint: 'Copies prompt & opens Runway',
    icon: RunwayIcon,
    getUrl: () => `https://app.runwayml.com/`,
  },
  sora: {
    id: 'sora',
    name: 'OpenAI Sora',
    shortName: 'Sora',
    provider: 'OpenAI',
    badgeColor: '#0066cc',
    isPrefill: false,
    hint: 'Copies prompt & opens Sora',
    icon: SoraIcon,
    getUrl: () => `https://sora.com/`,
  },
  flux: {
    id: 'flux',
    name: 'FLUX.1 Pro',
    shortName: 'FLUX.1',
    provider: 'Black Forest Labs',
    badgeColor: '#e11d48',
    isPrefill: false,
    hint: 'Copies prompt & opens Replicate playground',
    icon: FluxIcon,
    getUrl: () => `https://replicate.com/black-forest-labs/flux-1.1-pro`,
  },
  sd: {
    id: 'sd',
    name: 'Stability SD3.5',
    shortName: 'Stable Diffusion',
    provider: 'Stability AI',
    badgeColor: '#a855f7',
    isPrefill: false,
    hint: 'Copies prompt & opens Clipdrop',
    icon: StabilityIcon,
    getUrl: () => `https://clipdrop.co/stable-diffusion`,
  },
  higgsfield: {
    id: 'higgsfield',
    name: 'Higgsfield AI Studio',
    shortName: 'Higgsfield',
    provider: 'Higgsfield',
    badgeColor: '#d1fe17',
    isPrefill: true,
    hint: 'Generate instantly with Higgsfield AI Studio',
    icon: HiggsfieldIcon,
    getUrl: (prompt) => `/studio?prompt=${encodeURIComponent(prompt)}`,
  },
};

// Maps model slugs in the OmniPrompt database to AI targets
const MODEL_SLUG_MAP: Record<string, string> = {
  'claude-3-7-sonnet': 'claude',
  'gpt-4o': 'chatgpt',
  'gemini-2-5-pro': 'gemini',
  'deepseek-r1': 'deepseek',
  'deepseek-coder-33b': 'deepseek',
  'cursor-composer': 'cursor',
  'midjourney-v7': 'midjourney',
  'suno-v4': 'suno',
  'elevenlabs-prime': 'elevenlabs',
  'runway-gen-3-alpha': 'runway',
  'runwayml': 'runway',
  'sora': 'sora',
  'flux-1-pro': 'flux',
  'flux-1-dev': 'flux',
  'sd3-5-large': 'sd',
  'stable-diffusion-1': 'sd',
  'stable-diffusion-video': 'sd',
  'animatediff-lightning': 'sd',
  'cogvideox-5b': 'runway',
  'veo': 'sora',
  'videopoet': 'sora',
  'soul-2': 'higgsfield',
  'soul-cinema': 'higgsfield',
  'kling-3-turbo': 'higgsfield',
  'kling-3-std': 'higgsfield',
  'kling-3-pro': 'higgsfield',
  'seedance-2-5': 'higgsfield',
  'seedance-2': 'higgsfield',
  'wan-3': 'higgsfield',
  'wan-2-7': 'higgsfield',
  'higgsfield': 'higgsfield',
  'higgsfield-ai': 'higgsfield',
};

// Default universal set for general chat/writing models
export const GENERAL_ALL_MODELS: AiTarget[] = [
  AI_TARGETS.claude,
  AI_TARGETS.chatgpt,
  AI_TARGETS.perplexity,
  AI_TARGETS.gemini,
  AI_TARGETS.deepseek,
  AI_TARGETS.cursor,
  AI_TARGETS.lovable,
];

export interface ResolvedAiTargets {
  targets: AiTarget[];
  isAll: boolean; // True when "all models" or > 3 targets -> renders dropdown
}

/**
 * Resolves which AI models a prompt can be used in:
 * - 1 model: 1 button
 * - 2 models: 2 buttons
 * - 3 models: 3 buttons
 * - 4+ or all: Dropdown
 */
export function resolvePromptAiTargets(prompt: Prompt): ResolvedAiTargets {
  // 1. Check prompt parameters for explicit compatible models
  let parameters: Record<string, any> = {};
  try {
    const version = prompt.versions?.[0];
    if (version?.parametersJson) {
      parameters = JSON.parse(version.parametersJson);
    }
  } catch {
    // ignore malformed parameters
  }

  // Explicitly marked as "all" in parameters or tags
  const tags = prompt.tags || [];
  const isTaggedAll = tags.includes('all-models') || tags.includes('universal') || parameters.compatible_models === 'all';
  if (isTaggedAll) {
    return {
      targets: GENERAL_ALL_MODELS,
      isAll: true,
    };
  }

  // Explicit array of compatible model IDs or slugs in parameters
  if (Array.isArray(parameters.compatible_models) && parameters.compatible_models.length > 0) {
    const explicitTargets: AiTarget[] = [];
    for (const item of parameters.compatible_models) {
      const targetId = MODEL_SLUG_MAP[item] || item;
      if (AI_TARGETS[targetId] && !explicitTargets.some((t) => t.id === targetId)) {
        explicitTargets.push(AI_TARGETS[targetId]);
      }
    }
    if (explicitTargets.length > 0) {
      return {
        targets: explicitTargets,
        isAll: explicitTargets.length > 3,
      };
    }
  }

  // 2. Category-based resolution
  const catSlug = prompt.category?.slug || '';
  const modelSlug = prompt.model?.slug || '';
  const primaryTargetId = MODEL_SLUG_MAP[modelSlug];

  // If text-writing or code-free-agents (Universal LLM prompts)
  if (catSlug === 'text-writing' || catSlug === 'code-free-agents') {
    // If prompt author didn't bind it to a strict single model, general text works with all models
    return {
      targets: GENERAL_ALL_MODELS,
      isAll: true,
    };
  }

  // Applications & UI/UX (Can be used in Cursor, Claude, Lovable, ChatGPT)
  if (catSlug === 'applications' || catSlug === 'ui-ux') {
    const codeTargets = [AI_TARGETS.cursor, AI_TARGETS.claude, AI_TARGETS.lovable, AI_TARGETS.chatgpt];
    return {
      targets: codeTargets,
      isAll: true, // 4 models -> dropdown
    };
  }

  // Video prompts (Higgsfield Studio, Sora & Runway)
  if (catSlug === 'videos') {
    if (primaryTargetId === 'higgsfield') {
      return { targets: [AI_TARGETS.higgsfield], isAll: false };
    }
    if (modelSlug.includes('sora')) {
      return { targets: [AI_TARGETS.higgsfield, AI_TARGETS.sora], isAll: false };
    }
    if (modelSlug.includes('runway')) {
      return { targets: [AI_TARGETS.higgsfield, AI_TARGETS.runway], isAll: false };
    }
    // Generic video prompt can be used in Higgsfield Studio, Sora & Runway
    return { targets: [AI_TARGETS.higgsfield, AI_TARGETS.sora, AI_TARGETS.runway], isAll: false };
  }

  // Audio prompts (Suno & ElevenLabs)
  if (catSlug === 'audio') {
    if (modelSlug.includes('suno')) {
      return { targets: [AI_TARGETS.suno], isAll: false };
    }
    if (modelSlug.includes('elevenlabs')) {
      return { targets: [AI_TARGETS.elevenlabs], isAll: false };
    }
    // Generic audio
    return { targets: [AI_TARGETS.suno, AI_TARGETS.elevenlabs], isAll: false };
  }

  // Image prompts (Higgsfield Studio, Midjourney, Flux, Stable Diffusion)
  if (catSlug === 'images') {
    if (primaryTargetId === 'higgsfield') {
      return { targets: [AI_TARGETS.higgsfield], isAll: false };
    }
    if (modelSlug.includes('midjourney') || prompt.fullPrompt.includes('--ar') || prompt.fullPrompt.includes('--v')) {
      return { targets: [AI_TARGETS.higgsfield, AI_TARGETS.midjourney], isAll: false };
    }
    if (modelSlug.includes('flux')) {
      return { targets: [AI_TARGETS.higgsfield, AI_TARGETS.flux], isAll: false };
    }
    if (modelSlug.includes('sd') || modelSlug.includes('stable-diffusion')) {
      return { targets: [AI_TARGETS.higgsfield, AI_TARGETS.sd], isAll: false };
    }
    // General image prompt
    return {
      targets: [AI_TARGETS.higgsfield, AI_TARGETS.midjourney, AI_TARGETS.flux],
      isAll: false,
    };
  }

  // 3. Fallback: Single primary model button
  if (primaryTargetId && AI_TARGETS[primaryTargetId]) {
    return {
      targets: [AI_TARGETS[primaryTargetId]],
      isAll: false,
    };
  }

  // If unknown model or default, show Claude as 1-click fallback
  return {
    targets: [AI_TARGETS.claude],
    isAll: false,
  };
}

/**
 * Executes launch of an AI target:
 * - Native prefill: opens URL with prompt prefilled.
 * - Copy & launch: copies prompt to clipboard, opens URL.
 */
export async function executeAiLaunch(
  target: AiTarget,
  promptText: string,
  onNotify?: (message: string, isSuccess: boolean) => void
): Promise<void> {
  const url = target.getUrl(promptText);

  if (target.id === 'higgsfield') {
    window.location.href = url;
    onNotify?.(`Opening prompt in Higgsfield AI Studio...`, true);
    return;
  }

  if (target.isPrefill) {
    window.open(url, '_blank', 'noopener,noreferrer');
    onNotify?.(`Opened in ${target.shortName} with prompt pre-filled!`, true);
  } else {
    // Copy to clipboard first
    try {
      await navigator.clipboard.writeText(promptText);
      window.open(url, '_blank', 'noopener,noreferrer');
      onNotify?.(`Prompt copied! Press Ctrl+V (or Cmd+V) to paste in ${target.shortName}.`, true);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
      onNotify?.(`Opened ${target.shortName}. (Clipboard access denied; copy prompt manually)`, false);
    }
  }
}
