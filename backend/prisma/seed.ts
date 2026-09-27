import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Cleaning existing database tables...');
  await prisma.challengeSubmission.deleteMany().catch(() => {});
  await prisma.challenge.deleteMany().catch(() => {});
  await prisma.apiKey.deleteMany().catch(() => {});
  await prisma.userBadge.deleteMany().catch(() => {});
  await prisma.badge.deleteMany().catch(() => {});
  await prisma.promptPackItem.deleteMany().catch(() => {});
  await prisma.promptPack.deleteMany().catch(() => {});
  await prisma.reaction.deleteMany().catch(() => {});
  await prisma.comment.deleteMany().catch(() => {});
  await prisma.feedbackThread.deleteMany().catch(() => {});
  await prisma.editSuggestion.deleteMany().catch(() => {});
  await prisma.collectionItem.deleteMany().catch(() => {});
  await prisma.collection.deleteMany().catch(() => {});
  await prisma.fork.deleteMany().catch(() => {});
  await prisma.star.deleteMany().catch(() => {});
  await prisma.promptTag.deleteMany().catch(() => {});
  await prisma.tag.deleteMany().catch(() => {});
  await prisma.promptMedia.deleteMany().catch(() => {});
  await prisma.promptVersion.deleteMany().catch(() => {});
  await prisma.prompt.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});
  await prisma.model.deleteMany().catch(() => {});
  await prisma.follow.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  console.log('🌱 Seeding Users...');
  const passwordHash = await bcrypt.hash('promptit123', 10);

  const usersData = [
    {
      username: 'alexchen',
      name: 'Alex Chen',
      email: 'alex@promptit.io',
      bio: 'Staff AI Engineer @ Lattice. Building autonomous systems and multi-modal prompt architectures.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      githubHandle: 'alexchen-ai',
      twitterHandle: 'alexchen_prompt',
      role: 'CREATOR',
    },
    {
      username: 'sarah_connor',
      name: 'Sarah Connor',
      email: 'sarah@promptit.io',
      bio: 'Generative cinema director & cinematographer. Pushing Sora & Runway Gen-3 to physical realism limits.',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      githubHandle: 'sarahcinematics',
      twitterHandle: 'sarah_ai_film',
      role: 'CREATOR',
    },
    {
      username: 'elena_v',
      name: 'Elena Rostova',
      email: 'elena@promptit.io',
      bio: 'Principal Product Designer. Crafting generative UI/UX design tokens and accessible web components.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      githubHandle: 'elenarostova',
      twitterHandle: 'elena_design',
      role: 'CREATOR',
    },
    {
      username: 'marcus_dev',
      name: 'Marcus Thorne',
      email: 'marcus@promptit.io',
      bio: 'Full-stack agent builder. Specialist in Claude 3.7 Sonnet extended thinking and TypeScript scaffolding.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      githubHandle: 'mthorne-dev',
      twitterHandle: 'marcus_agents',
      role: 'USER',
    },
    {
      username: 'suno_maestro',
      name: 'Devin Kael',
      email: 'devin@promptit.io',
      bio: 'Sound designer & AI music composer. Curating prompt structures for Suno v4 & ElevenLabs.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      githubHandle: 'devinkael',
      twitterHandle: 'kael_sounds',
      role: 'USER',
    },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of usersData) {
    createdUsers[u.username] = await prisma.user.create({
      data: { ...u, passwordHash },
    });
  }

  console.log('🌱 Seeding Categories...');
  const categoriesData = [
    { name: 'Images', slug: 'images', description: 'Photorealism, 3D renders, concept art, and digital illustrations.', icon: 'Image', badgeColor: '#6366f1' },
    { name: 'Videos', slug: 'videos', description: 'Cinematic camera moves, drone shots, visual effects, and storytelling.', icon: 'Video', badgeColor: '#ec4899' },
    { name: 'Applications', slug: 'applications', description: 'Full-stack application prompts, architecture templates, and SaaS generators.', icon: 'Code', badgeColor: '#06b6d4' },
    { name: 'UI/UX', slug: 'ui-ux', description: 'Design systems, interactive dashboards, landing page concepts, and component code.', icon: 'Layout', badgeColor: '#8b5cf6' },
    { name: 'Text/Writing', slug: 'text-writing', description: 'Essays, long-form journalism, technical documentation, and copywriting.', icon: 'FileText', badgeColor: '#10b981' },
    { name: 'Code-free Agents', slug: 'code-free-agents', description: 'Autonomous research workflows, customer support routing, and multi-agent coordination.', icon: 'Bot', badgeColor: '#f59e0b' },
    { name: 'Audio', slug: 'audio', description: 'Music production, vocal timbre descriptions, sound effects, and voice cloning.', icon: 'Music', badgeColor: '#f43f5e' },
  ];

  const createdCategories: Record<string, any> = {};
  for (const c of categoriesData) {
    createdCategories[c.slug] = await prisma.category.create({ data: c });
  }

  console.log('🌱 Seeding Models...');
  const modelsData = [
    { name: 'Claude 3.7 Sonnet', slug: 'claude-3-7-sonnet', provider: 'Anthropic', modality: 'Multimodal / Code', logoUrl: 'https://anthropic.com/favicon.ico', badgeColor: '#cc785c', description: 'Hybrid reasoning and instant response model with state-of-the-art coding and nuanced prompt following.', contextWindow: '200k', isFeatured: true, officialUrl: 'https://anthropic.com/claude' },
    { name: 'OpenAI GPT-4o', slug: 'gpt-4o', provider: 'OpenAI', modality: 'Multimodal', logoUrl: 'https://openai.com/favicon.ico', badgeColor: '#10a37f', description: 'Omni-model reasoning across audio, vision, and text in real-time with exceptional structured output reliability.', contextWindow: '128k', isFeatured: true, officialUrl: 'https://openai.com' },
    { name: 'Midjourney v7', slug: 'midjourney-v7', provider: 'Midjourney', modality: 'Image', logoUrl: 'https://www.midjourney.com/favicon.ico', badgeColor: '#4b70e2', description: 'Next-generation image synthesis with cinematic textural fidelity, realistic anatomy, and hyper-coherent lighting.', contextWindow: 'N/A', isFeatured: true, officialUrl: 'https://midjourney.com' },
    { name: 'Black Forest Labs Flux.1 Pro', slug: 'flux-1-pro', provider: 'Black Forest Labs', modality: 'Image', logoUrl: 'https://blackforestlabs.ai/favicon.ico', badgeColor: '#e11d48', description: 'Top-tier open-weight/API image foundation model with unprecedented prompt fidelity and typography rendering.', contextWindow: 'N/A', isFeatured: true, officialUrl: 'https://blackforestlabs.ai' },
    { name: 'OpenAI Sora', slug: 'sora', provider: 'OpenAI', modality: 'Video', logoUrl: 'https://openai.com/favicon.ico', badgeColor: '#0066cc', description: 'Diffusion video model capable of generating up to 60s of hyper-realistic video with consistent 3D physics.', contextWindow: 'N/A', isFeatured: true, officialUrl: 'https://openai.com/sora' },
    { name: 'Runway Gen-3 Alpha', slug: 'runway-gen-3-alpha', provider: 'Runway', modality: 'Video', logoUrl: 'https://runwayml.com/favicon.ico', badgeColor: '#22c55e', description: 'Breakthrough video generation model with fine-grained motion control, camera director controls, and expressive characters.', contextWindow: 'N/A', isFeatured: true, officialUrl: 'https://runwayml.com' },
    { name: 'Google Gemini 2.5 Pro', slug: 'gemini-2-5-pro', provider: 'Google', modality: 'Multimodal', logoUrl: 'https://google.com/favicon.ico', badgeColor: '#4285f4', description: 'Massive 1M+ token context model excels at complex reasoning, deep repository comprehension, and multimodal analysis.', contextWindow: '1M+', isFeatured: true, officialUrl: 'https://deepmind.google/technologies/gemini/' },
    { name: 'DeepSeek R1', slug: 'deepseek-r1', provider: 'DeepSeek', modality: 'Reasoning / Text', logoUrl: 'https://deepseek.com/favicon.ico', badgeColor: '#0284c7', description: 'Reinforcement-learning driven open reasoning model with transparent chain-of-thought verification for math and code.', contextWindow: '64k', isFeatured: true, officialUrl: 'https://deepseek.com' },
    { name: 'Suno v4', slug: 'suno-v4', provider: 'Suno', modality: 'Audio', logoUrl: 'https://suno.com/favicon.ico', badgeColor: '#f97316', description: 'End-to-end song and music generator with studio-grade vocal mixing, dynamic arrangement, and genre blending.', contextWindow: 'N/A', isFeatured: true, officialUrl: 'https://suno.com' },
    { name: 'ElevenLabs Prime', slug: 'elevenlabs-prime', provider: 'ElevenLabs', modality: 'Audio', logoUrl: 'https://elevenlabs.io/favicon.ico', badgeColor: '#84cc16', description: 'Ultra-realistic emotional speech synthesis, dynamic conversational inflection, and custom voice design prompts.', contextWindow: 'N/A', isFeatured: false, officialUrl: 'https://elevenlabs.io' },
    { name: 'Cursor Composer / Dev', slug: 'cursor-composer', provider: 'Cursor', modality: 'UI/Code', logoUrl: 'https://cursor.com/favicon.ico', badgeColor: '#6366f1', description: 'Agentic multi-file workspace coding engine with automated diff generation and contextual indexation.', contextWindow: '128k', isFeatured: false, officialUrl: 'https://cursor.com' },
    { name: 'Stability SD3.5 Large', slug: 'sd3-5-large', provider: 'Stability AI', modality: 'Image', logoUrl: 'https://stability.ai/favicon.ico', badgeColor: '#a855f7', description: 'Highly customizable open diffusion model for concept artists, matte painters, and custom LoRA pipelines.', contextWindow: 'N/A', isFeatured: false, officialUrl: 'https://stability.ai' }
  ];

  const createdModels: Record<string, any> = {};
  for (const m of modelsData) {
    createdModels[m.slug] = await prisma.model.create({ data: m });
  }

  console.log('🌱 Seeding Badges...');
  const badgesData = [
    { name: 'First Fork', slug: 'first-fork', description: 'Successfully forked and iterated on a community prompt.', icon: 'GitFork', tier: 'BRONZE' },
    { name: '100 Stars Club', slug: '100-stars', description: 'Received over 100 stars on a single prompt card.', icon: 'Star', tier: 'GOLD' },
    { name: 'Model Pioneer', slug: 'model-pioneer', description: 'Published benchmark prompts for 5+ distinct foundation models.', icon: 'Sparkles', tier: 'SILVER' },
    { name: 'Prompt Architect', slug: 'prompt-architect', description: 'Merged 10+ pull-request style edit suggestions.', icon: 'GitMerge', tier: 'GOLD' },
    { name: 'Obsidian Elite', slug: 'obsidian-elite', description: 'Ranked #1 on the weekly community challenge leaderboard.', icon: 'Award', tier: 'OBSIDIAN' },
  ];

  const createdBadges: Record<string, any> = {};
  for (const b of badgesData) {
    createdBadges[b.slug] = await prisma.badge.create({ data: b });
  }

  // Award badges to demo users
  await prisma.userBadge.createMany({
    data: [
      { userId: createdUsers.alexchen.id, badgeId: createdBadges['100-stars'].id },
      { userId: createdUsers.alexchen.id, badgeId: createdBadges['prompt-architect'].id },
      { userId: createdUsers.sarah_connor.id, badgeId: createdBadges['model-pioneer'].id },
      { userId: createdUsers.elena_v.id, badgeId: createdBadges['obsidian-elite'].id },
      { userId: createdUsers.marcus_dev.id, badgeId: createdBadges['first-fork'].id },
    ]
  });

  console.log('🌱 Seeding Prompts & Prompt Cards...');

  // Helper to generate seed prompts
  const promptsSpec = [
    // 1. Images
    {
      title: 'Cinematic 35mm Cyberpunk Street Portrait in Tokyo Rain',
      slug: 'cinematic-35mm-cyberpunk-street-portrait-tokyo-rain',
      category: 'images',
      model: 'midjourney-v7',
      author: 'sarah_connor',
      shortDesc: 'Hyper-realistic medium shot of a cybernetic courier in Shinjuku alleyway with volumetric neon fog.',
      fullPrompt: 'A cinematic medium portrait of {subject} wearing an oversized translucent techwear poncho, rain droplets beading on cheekbones, faint neon cyan and magenta reflections from Shinjuku alley signs, shot on 35mm Arri Alexa, anamorphic lens flare, shallow depth of field, natural skin texture, ISO 400, muted tungsten backlight --ar 16:9 --style raw --v 7.0',
      descriptionMd: `### Overview\nThis prompt leverages **Midjourney v7's** updated sub-surface scattering and lens distortion algorithms to achieve photorealistic street portraits without the "AI plastic sheen".\n\n### Recommended Variables:\n- \`{subject}\`: e.g. "a 28-year-old female courier with cybernetic temple implants", "an elderly mechanic in grease-stained coveralls"\n\n### Tips:\n- Use \`--style raw\` to ensure natural skin pores.\n- Keep \`--stylize\` below 250 for documentary realism.`,
      parameters: { aspect_ratio: "16:9", stylize: 180, chaos: 10, v: "7.0", lens: "35mm Anamorphic" },
      media: [
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80', caption: 'Cyberpunk Courier in Shinjuku Rain' },
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80', caption: 'Atmospheric volumetric lighting pass' }
      ],
      tags: ['cyberpunk', 'portrait', '35mm', 'neon', 'cinematic'],
      stars: 342,
      copies: 1420,
      isFeatured: true
    },
    {
      title: 'Architectural Brutalism Meets Biophilic Greenhouse',
      slug: 'architectural-brutalism-biophilic-greenhouse',
      category: 'images',
      model: 'flux-1-pro',
      author: 'elena_v',
      shortDesc: 'Raw cast-concrete atrium overgrown with tropical flora, captured during golden hour sunlight.',
      fullPrompt: 'An architectural photograph of {space_type} constructed from raw board-marked cast concrete and monolithic glass panels, completely overtaken by lush cascading {plant_type}, dramatic sunlight streaming through skylights casting geometric ray shadows, architectural digest editorial style, Hasselblad X2D 100C, 24mm f/8, ultra-sharp detail.',
      descriptionMd: `### Concept\nA study in contrasting industrial brutalism with lush organic nature. Flux.1 Pro excels here at rendering board-marked concrete grain and realistic botanical veins.`,
      parameters: { aspect_ratio: "4:3", steps: 35, guidance_scale: 3.5, camera: "Hasselblad X2D" },
      media: [
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80', caption: 'Brutalist Concrete Atrium' }
      ],
      tags: ['architecture', 'brutalism', 'greenhouse', 'hasselblad'],
      stars: 219,
      copies: 870,
      isFeatured: true
    },
    {
      title: 'Matte Painting: Ancient Orbital Colony Ruins Over Desert Planet',
      slug: 'matte-painting-orbital-colony-ruins-desert-planet',
      category: 'images',
      model: 'sd3-5-large',
      author: 'alexchen',
      shortDesc: 'Colossal sci-fi ring structure crashing into wind-swept sand dunes, Moebius style palette.',
      fullPrompt: 'Panoramic digital matte painting of a colossal derelict orbital ring station crashed into vast crimson sand dunes, tiny explorer caravan in the foreground providing epic sense of scale, atmosphere haze, dual moons rising on the horizon, art by John Berkey and Chris Foss, 8k resolution, cinematic color grading.',
      descriptionMd: `### Art Direction\nClassic 1970s sci-fi book cover aesthetic combined with modern matte painting lighting fidelity.`,
      parameters: { aspect_ratio: "21:9", steps: 40, cfg_scale: 7.0, seed: 928371 },
      media: [
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80', caption: 'Derelict Colony Dunes' }
      ],
      tags: ['sci-fi', 'matte-painting', 'desert', 'space', 'concept-art'],
      stars: 184,
      copies: 640,
      isFeatured: false
    },
    {
      title: 'Hyper-Realistic Macro Studio Photography of Microchips in Ice',
      slug: 'hyper-realistic-macro-studio-microchips-ice',
      category: 'images',
      model: 'flux-1-pro',
      author: 'marcus_dev',
      shortDesc: 'A silicon wafer microchip frozen inside a crystal-clear melting block of glacier ice with air bubbles.',
      fullPrompt: 'Extreme macro photograph of a gold-plated {chip_type} embedded inside a crystalline cube of clear ice, microscopic air bubbles, condensation droplets running down the frosted surface, studio strobe lighting with soft turquoise rim light, shot with 100mm macro lens at f/11, focus stacked, 8k commercial product photography.',
      descriptionMd: `### Macro Hardware Aesthetics\nDemonstrates precision text rendering on microchip dies using Flux.1 Pro.`,
      parameters: { aspect_ratio: "1:1", steps: 30, guidance: 4.0 },
      media: [
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80', caption: 'Frozen Silicon Wafer' }
      ],
      tags: ['hardware', 'macro', 'ice', 'commercial', 'studio'],
      stars: 97,
      copies: 410,
      isFeatured: false
    },

    // 2. Videos
    {
      title: 'FPV Drone Dive Through Misty Alpine Waterfall at Dawn',
      slug: 'fpv-drone-dive-misty-alpine-waterfall-dawn',
      category: 'videos',
      model: 'sora',
      author: 'sarah_connor',
      shortDesc: 'Continuous 15s camera move tracking down a raging 200m waterfall surrounded by pine trees.',
      fullPrompt: 'Smooth continuous single-take FPV camera diving at high speed down a thunderous 200-meter glacial waterfall in the Swiss Alps at golden hour, water spray hitting the lens with realistic droplet physics, weaving through mossy granite cliffs, morning mist parting to reveal a turquoise alpine lake below, 60fps cinematic 4k.',
      descriptionMd: `### Camera Movement Notes\nSora understands continuous momentum and fluid camera trajectories. Using terms like "single-take FPV dive" ensures zero jump-cuts.`,
      parameters: { duration: "15s", fps: 60, resolution: "4K", motion_strength: 8.5 },
      media: [
        { type: 'VIDEO', url: 'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&auto=format&fit=crop&q=80', caption: 'Alpine Waterfall Continuous Dive' }
      ],
      tags: ['drone', 'fpv', 'waterfall', 'nature', 'sora', '4k'],
      stars: 480,
      copies: 1950,
      isFeatured: true
    },
    {
      title: 'Neon Tokyo Hyperlapse at Night: Shibuya Crossing Traffic Vortex',
      slug: 'neon-tokyo-hyperlapse-shibuya-crossing-vortex',
      category: 'videos',
      model: 'sora',
      author: 'sarah_connor',
      shortDesc: 'A swirling 360-degree crane hyperlapse above Shibuya crossing with light trails and illuminated billboards.',
      fullPrompt: '360-degree ascending crane hyperlapse shot rotating slowly above Shibuya Crossing at midnight in light rain, thousands of pedestrians carrying translucent umbrellas, red and white light streaks from passing taxis, massive luminous LED screens reflecting off wet asphalt, 8k resolution, fluid temporal consistency.',
      descriptionMd: `### Motion Fidelity\nTested for maintaining billboard text stability while camera orbits 360 degrees.`,
      parameters: { duration: "12s", camera: "360 Crane", fps: 30 },
      media: [
        { type: 'VIDEO', url: 'https://assets.mixkit.co/videos/preview/mixkit-night-sky-with-stars-at-a-calm-lake-time-lapse-42508-large.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80', caption: 'Shibuya Hyperlapse Night' }
      ],
      tags: ['hyperlapse', 'tokyo', 'sora', 'night', 'light-trails'],
      stars: 312,
      copies: 1100,
      isFeatured: true
    },

    // 3. UI/UX & Live Sandbox Apps
    {
      title: 'Modern Neo-Fintech Wealth Dashboard with Glassmorphism & Micro-Charts',
      slug: 'modern-neo-fintech-wealth-dashboard-glassmorphism',
      category: 'ui-ux',
      model: 'claude-3-7-sonnet',
      author: 'elena_v',
      shortDesc: 'Complete single-file React & Tailwind responsive banking dashboard with live interactive sparklines.',
      fullPrompt: 'Create an ultra-modern, responsive SaaS fintech dashboard for high-net-worth portfolio management. Tech: HTML + Tailwind CSS + Lucide icons style. Include: 1) Top portfolio balance card with +14.2% growth pill and 30-day mini sparkline; 2) Asset allocation ring with crypto/stocks/real-estate breakdown; 3) Recent transactions list with company logos and status badges; 4) Quick Transfer drawer. Palette: Dark slate (#0b0f19), emerald accent (#10b981), hyper-indigo (#6366f1). Ensure full interactive hover states and accessible tab switching.',
      descriptionMd: `### Interactive Sandbox Included!\nThis prompt includes a complete runnable live HTML/Tailwind sandbox. Click the **"Live Sandbox"** tab on this prompt card to interact with the real component!\n\n### Highlights:\n- Pixel-perfect glassmorphism using \`backdrop-blur-md\`\n- Micro-interactions on balance cards\n- Semantic HTML5 layout with mobile responsiveness.`,
      parameters: { framework: "Tailwind CSS + HTML", theme: "Dark Fintech", accessibility: "WCAG-AA" },
      sandboxCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #07090e; font-family: system-ui, sans-serif; }
    .glass { background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }
  </style>
</head>
<body class="p-6 text-white min-h-screen">
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Nexus Wealth OS</h1>
        <p class="text-xs text-slate-400">Real-time Multi-Asset Portfolio</p>
      </div>
      <div class="flex gap-2">
        <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-500/25">+ Add Capital</button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="glass p-5 rounded-2xl hover:border-indigo-500/50 transition">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Worth</span>
        <div class="text-3xl font-extrabold mt-1">$1,429,850.00</div>
        <div class="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1">
          <span>↑ +$48,200 (14.2%)</span>
          <span class="text-slate-400">this month</span>
        </div>
      </div>
      <div class="glass p-5 rounded-2xl hover:border-indigo-500/50 transition">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Liquid Cash (APY 5.1%)</span>
        <div class="text-3xl font-extrabold mt-1">$318,400.00</div>
        <div class="mt-2 text-xs text-indigo-400 font-medium">Auto-swept into Treasury Bills</div>
      </div>
      <div class="glass p-5 rounded-2xl hover:border-indigo-500/50 transition">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Staked Yield</span>
        <div class="text-3xl font-extrabold mt-1">$8,940/mo</div>
        <div class="mt-2 text-xs text-emerald-400 font-medium">9.4% Blended Return</div>
      </div>
    </div>

    <!-- Active Holdings Table -->
    <div class="glass rounded-2xl p-5">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-semibold text-sm text-slate-200">Top Performing Allocations</h3>
        <span class="text-xs text-indigo-400 cursor-pointer hover:underline">View All 18 Assets</span>
      </div>
      <div class="divide-y divide-slate-800 text-sm">
        <div class="py-3 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">NV</div>
            <div>
              <div class="font-semibold">Nvidia Corp (NVDA)</div>
              <div class="text-xs text-slate-400">Equities · 450 Shares</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold">$585,000.00</div>
            <div class="text-xs text-emerald-400">+34.8% ($151,200)</div>
          </div>
        </div>
        <div class="py-3 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">BTC</div>
            <div>
              <div class="font-semibold">Bitcoin Sovereign Reserve</div>
              <div class="text-xs text-slate-400">Cold Storage Vault 01</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold">$412,000.00</div>
            <div class="text-xs text-emerald-400">+18.4% ($64,100)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
      media: [
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80', caption: 'Fintech Dashboard Component' }
      ],
      tags: ['fintech', 'dashboard', 'tailwind', 'glassmorphism', 'ui-ux', 'react'],
      stars: 520,
      copies: 2310,
      isFeatured: true
    },
    {
      title: 'Bento Grid Design System for SaaS Product Landing Page',
      slug: 'bento-grid-design-system-saas-landing-page',
      category: 'ui-ux',
      model: 'claude-3-7-sonnet',
      author: 'elena_v',
      shortDesc: 'Asymmetric 6-card bento grid with gradient borders, animated badges, and micro-copy for AI products.',
      fullPrompt: 'Design a 6-card Bento Grid layout using modern CSS Grid and Tailwind classes for an AI developer platform. Card 1 (spans 2 cols): Real-time streaming log terminal with pulse animation. Card 2: Interactive API latency dial showing 42ms. Card 3: Enterprise SSO security badges. Card 4: Global edge deployment map. Card 5: Team collaboration avatars with live cursor indicators. Card 6: One-line SDK install card with copy button. Colors: Slate-950 background with subtle radial gradient (#6366f1 at 15% opacity).',
      descriptionMd: `### Bento Architecture\nDesigned to showcase developer features in high-density visual containers favored by modern AI tool homepages (Vercel, Linear, Supabase style).`,
      parameters: { columns: 3, framework: "Tailwind CSS", responsive: "True" },
      sandboxCode: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 p-8 text-white">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-8">
      <span class="text-xs uppercase tracking-widest text-indigo-400 font-bold">Architecture</span>
      <h2 class="text-3xl font-bold mt-1">Engineered for Autonomous Latency</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div class="text-xs text-indigo-400 font-mono mb-2">LIVE STREAMING ENGINE</div>
        <h3 class="text-lg font-bold">Sub-50ms Global Edge Routing</h3>
        <p class="text-sm text-slate-400 mt-1">Automated prompt token streaming across 340 PoPs with intelligent failover.</p>
        <div class="mt-4 bg-black/50 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800">
          $ curl -X POST https://api.promptit.io/v1/stream --header "Auth: Bearer pk_live_..."
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div class="text-xs text-pink-400 font-mono mb-2">RELIABILITY</div>
          <h3 class="text-lg font-bold">99.99% Uptime SLA</h3>
        </div>
        <div class="text-4xl font-extrabold text-indigo-400 mt-4">42<span class="text-sm font-normal text-slate-400">ms avg</span></div>
      </div>
    </div>
  </div>
</body>
</html>`,
      media: [
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80', caption: 'Bento Grid SaaS Component' }
      ],
      tags: ['bento-grid', 'saas', 'landing-page', 'ui-ux', 'tailwind'],
      stars: 388,
      copies: 1470,
      isFeatured: true
    },

    // 4. Applications & Agents
    {
      title: 'Full-Stack Next.js 15 App Router + Prisma + Stripe SaaS Scaffolding Prompt',
      slug: 'fullstack-nextjs-15-app-router-prisma-stripe-scaffolding',
      category: 'applications',
      model: 'cursor-composer',
      author: 'alexchen',
      shortDesc: 'Exhaustive specification prompt that generates production directory structure, schema, and API routes in Cursor.',
      fullPrompt: 'Act as a Principal Staff Architect. Generate a complete production-grade Next.js 15 App Router codebase structure for a B2B SaaS named {app_name}. Requirements:\n1. Tech Stack: Next.js 15, TypeScript, Tailwind CSS v4, Prisma ORM with PostgreSQL, Supabase Auth, Stripe Subscriptions with webhooks.\n2. Provide exact \`schema.prisma\` with User, Team, Subscription, and AuditLog models.\n3. Implement server actions for team member invitation and permission checks (RBAC: Owner, Admin, Member).\n4. Implement secure webhook handler in \`app/api/webhooks/stripe/route.ts\` verifying signature with idempotency checks.\n5. Output every file with complete types, no placeholder comments, and strict error handling.',
      descriptionMd: `### Usage in Cursor Composer / Windsurf\nPaste this prompt into Composer with file indexing active. It sets strict rules against lazy omissions (\`// implement rest of logic\`).\n\n### Proven Results:\n- Clean zero-warning builds on Vercel\n- Automated webhook testing compatibility with Stripe CLI`,
      parameters: { framework: "Next.js 15 App Router", database: "PostgreSQL / Prisma", auth: "Supabase" },
      media: [
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80', caption: 'Next.js 15 Architecture' }
      ],
      tags: ['nextjs', 'typescript', 'stripe', 'prisma', 'saas', 'architecture'],
      stars: 640,
      copies: 3200,
      isFeatured: true
    },
    {
      title: 'Autonomous Competitor Intelligence Research Agent with Multi-Step Verification',
      slug: 'autonomous-competitor-intelligence-agent-multi-step',
      category: 'code-free-agents',
      model: 'deepseek-r1',
      author: 'marcus_dev',
      shortDesc: 'Deep reasoning agent system prompt that performs 5-phase strategic competitive teardowns with confidence scores.',
      fullPrompt: 'You are an elite Competitive Intelligence Strategist. When given {target_company} and {industry}, execute the following strict 5-phase protocol:\nPhase 1: Value Proposition & ICP Mapping. Identify primary customer personas, pain points addressed, and messaging hooks.\nPhase 2: Product Feature Matrix & Gap Analysis. Compare core capabilities against top 3 incumbents.\nPhase 3: Pricing & Packaging Architecture. Deconstruct tiers, paywalls, and expansion revenue drivers.\nPhase 4: Moat & Defensibility Audit. Evaluate network effects, proprietary data, switching costs, and regulatory moats.\nPhase 5: Vulnerability & Attack Vectors. Recommend 3 concrete asymmetric product moves to win market share.\nOutput must be formatted with executive markdown tables, risk indicators (🟢/🟡/🔴), and citation confidence ratings.',
      descriptionMd: `### Why DeepSeek R1?\nDeepSeek R1's extended reasoning path ensures the agent doesn't provide generic platitudes, but conducts deep adversarial strategic audits.`,
      parameters: { reasoning_tokens: 8000, temperature: 0.6, output_format: "Markdown Strategy Report" },
      media: [
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80', caption: 'Strategic Intelligence Framework' }
      ],
      tags: ['deepseek-r1', 'agent', 'strategy', 'market-research', 'analysis'],
      stars: 415,
      copies: 1820,
      isFeatured: true
    },

    // 5. Audio
    {
      title: 'Cyberpunk Synthwave Anthem with Analog Moog Bass & Female Vocals',
      slug: 'cyberpunk-synthwave-anthem-analog-moog-female-vocals',
      category: 'audio',
      model: 'suno-v4',
      author: 'suno_maestro',
      shortDesc: 'Complete song structure prompt with verse/chorus tags, BPM, and retro analog synthesizer arrangements.',
      fullPrompt: '[Genre: Cyberpunk Synthwave, 128 BPM, Key: D Minor]\n[Instruments: Heavy Moog Bassline, LinnDrum snare with gated reverb, Juno-106 arpeggios, gritty electric guitar solos, atmospheric synth pads]\n[Mood: Driving, nostalgic, rebellious, nighttime highway]\n\n[Verse 1]\nNeon streetlights bleeding through the rain\nCircuit pulses running in my vein\nMidnight shadows dancing on the glass\nWatch the ghost cities slip and pass\n\n[Pre-Chorus]\nSystem override, feel the frequency rise\nLook into the electric sky\n\n[Chorus]\nWe are the signal in the static night\nBurning through the towers of synthetic light\nNever slowing down, no turning back\nRacing on the hyper-speed chrome track\n\n[Guitar Solo: Soaring expressive 80s synth-rock style]\n[Outro: Arp fadeout with distant sirens]',
      descriptionMd: `### Suno v4 Prompting Structure\nSuno v4 responds exceptionally well to structured bracket tags \`[Genre]\`, \`[Instruments]\`, and arrangement cues like \`[Pre-Chorus]\` and \`[Guitar Solo]\` to shape song dynamics.`,
      parameters: { bpm: 128, key: "D Minor", model_version: "v4", genre: "Synthwave" },
      media: [
        { type: 'AUDIO', url: 'https://cdn.freesound.org/previews/518/518888_1156514-lq.mp3', caption: 'Cyberpunk Synthwave Snippet' }
      ],
      tags: ['suno', 'synthwave', 'music', 'cyberpunk', 'audio'],
      stars: 275,
      copies: 1350,
      isFeatured: true
    },

    // 6. Text & Writing
    {
      title: 'The Great Decoupling: Long-Form Tech Essay on Autonomous AI Agents',
      slug: 'the-great-decoupling-long-form-tech-essay',
      category: 'text-writing',
      model: 'gemini-2-5-pro',
      author: 'alexchen',
      shortDesc: 'A provocative, deeply researched Stratechery-style analytical essay on the economic restructuring of software.',
      fullPrompt: 'Write an authoritative 3,000-word analytical essay titled "The Great Decoupling: How Autonomous Software Agents Are Dismantling the SaaS Business Model". Adopt the intellectual tone of Ben Thompson (Stratechery) merged with Paul Graham. Structure:\n1. The Margins of Human Labor: Why SaaS charged per seat and why seats are evaporating.\n2. The Unit Economics of Agentic Work: Compute-as-a-Cost vs Token-as-a-Deliverable.\n3. The Interface Collapse: Why software dashboards are becoming invisible background daemon processes.\n4. Historical Precedents: Lessons from the transition from mainframes to relational databases.\n5. Who Captures Value: Foundation model providers vs vertical agent operators.\nInclude concrete mathematical examples comparing $50/user/mo vs $0.002/agent-action.',
      descriptionMd: `### Writing Persona Guidelines\nUses Gemini 2.5 Pro's comprehensive reasoning to balance macroeconomic rigor with gripping prose.`,
      parameters: { length: "3000 words", tone: "Analytical / Macro-strategy", context_used: "High" },
      media: [
        { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80', caption: 'Autonomous Economic Architecture' }
      ],
      tags: ['essay', 'stratechery', 'economics', 'saas', 'agents'],
      stars: 320,
      copies: 1290,
      isFeatured: false
    }
  ];

  // Additional prompts generated from templates.
  const additionalCategories = ['images', 'videos', 'applications', 'ui-ux', 'text-writing', 'code-free-agents', 'audio'];
  const additionalModels = ['claude-3-7-sonnet', 'gpt-4o', 'midjourney-v7', 'flux-1-pro', 'sora', 'runway-gen-3-alpha', 'gemini-2-5-pro', 'suno-v4'];
  const authorsList = ['alexchen', 'sarah_connor', 'elena_v', 'marcus_dev', 'suno_maestro'];

  const promptTemplates = [
    { title: 'Interactive Multi-Step Onboarding Flow with Micro-Animations', cat: 'ui-ux', mod: 'claude-3-7-sonnet', tag: 'onboarding' },
    { title: 'Enterprise Incident Post-Mortem & Root Cause Analysis Generator', cat: 'text-writing', mod: 'gpt-4o', tag: 'devops' },
    { title: 'Autonomous GitHub PR Reviewer & Security Vulnerability Scanner', cat: 'code-free-agents', mod: 'claude-3-7-sonnet', tag: 'security' },
    { title: 'Ambient Lo-Fi Chillhop Study Beats with Rainy Vinyl Texture', cat: 'audio', mod: 'suno-v4', tag: 'lofi' },
    { title: 'Design System Typography & Color Palette Token Generator for Tailwind', cat: 'ui-ux', mod: 'claude-3-7-sonnet', tag: 'design-tokens' },
    { title: 'FastAPI + Celery + Redis Asynchronous Task Pipeline Blueprint', cat: 'applications', mod: 'cursor-composer', tag: 'fastapi' },
    { title: 'B2B Cold Outreach Email Sequence with Personalized Trigger Events', cat: 'text-writing', mod: 'gpt-4o', tag: 'copywriting' },
    { title: 'Customer Churn Predictor & Retention Action Agent', cat: 'code-free-agents', mod: 'gemini-2-5-pro', tag: 'analytics' },
    { title: 'Epic Orchestral Cinematic Trailer Score with Taiko Drums', cat: 'audio', mod: 'suno-v4', tag: 'orchestral' },
    { title: 'Crypto Wallet Mobile App Concept with Live Gas Fee Tracker', cat: 'ui-ux', mod: 'claude-3-7-sonnet', tag: 'crypto-ui' },
    { title: 'Fullstack Micro-SaaS Boilerplate: SvelteKit + PocketBase', cat: 'applications', mod: 'cursor-composer', tag: 'svelte' },
    { title: 'Technical Whitepaper Executive Summary on Post-Quantum Cryptography', cat: 'text-writing', mod: 'gemini-2-5-pro', tag: 'cryptography' },
    { title: 'Multi-Model Debate Agent: Claude vs GPT vs Gemini on Policy Decisions', cat: 'code-free-agents', mod: 'claude-3-7-sonnet', tag: 'multi-agent' },
    { title: 'Deep Meditation Binaural Beats with Tibetan Singing Bowls', cat: 'audio', mod: 'suno-v4', tag: 'meditation' },
    { title: 'E-Commerce Checkout Drawer with 1-Click Apple Pay & Order Bump', cat: 'ui-ux', mod: 'claude-3-7-sonnet', tag: 'ecommerce' },
    { title: 'Event-Driven Microservices Blueprint with Apache Kafka & Go', cat: 'applications', mod: 'cursor-composer', tag: 'golang' },
    { title: 'Crisis Communication Press Release & Media Response Playbook', cat: 'text-writing', mod: 'gpt-4o', tag: 'pr' },
    { title: 'Autonomous SEO Topic Cluster Architect & Content Brief Generator', cat: 'code-free-agents', mod: 'gemini-2-5-pro', tag: 'seo' },
    { title: 'Retro 80s Heavy Metal Guitar Riff with Double Bass Drums', cat: 'audio', mod: 'suno-v4', tag: 'metal' },
    { title: 'Kanban Task Board with Drag-and-Drop States & Team Workload Meters', cat: 'ui-ux', mod: 'claude-3-7-sonnet', tag: 'kanban' },
    { title: 'GraphQL Gateway with Apollo Federation & Redis Subscriptions', cat: 'applications', mod: 'cursor-composer', tag: 'graphql' },
    { title: 'Patent Application Specification & Claim Drafting Prompt', cat: 'text-writing', mod: 'deepseek-r1', tag: 'patent' },
    { title: 'Smart Meeting Action Item Extractor & Calendar Sync Coordinator', cat: 'code-free-agents', mod: 'gpt-4o', tag: 'productivity' },
    { title: 'Deep Tech Podcast Voiceover Inflection & Pacing Prompt', cat: 'audio', mod: 'elevenlabs-prime', tag: 'voiceover' },
    { title: 'Mobile Banking Biometric Authentication & FaceID Scan UI Component', cat: 'ui-ux', mod: 'claude-3-7-sonnet', tag: 'biometric-ui' },
    { title: 'Rust WebAssembly Audio Synthesizer in the Browser Template', cat: 'applications', mod: 'cursor-composer', tag: 'wasm' },
    { title: 'Series A Venture Capital Pitch Deck Script & Narrative Arc', cat: 'text-writing', mod: 'gpt-4o', tag: 'pitch-deck' },
    { title: 'Legal Contract Clause Anomaly & Indemnity Clause Auditor', cat: 'code-free-agents', mod: 'deepseek-r1', tag: 'legal' },
    { title: 'Warm Acoustic Folk Guitar Duet in Mountain Cabin Ambience', cat: 'audio', mod: 'suno-v4', tag: 'folk' }
  ];

  const allPromptsToCreate: any[] = [...promptsSpec]; // Specs and generated templates differ in parameter shape.

  let idCounter = 1;
  for (const t of promptTemplates) {
    const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const authorName = authorsList[idCounter % authorsList.length];
    allPromptsToCreate.push({
      title: t.title,
      slug: `${slug}-${idCounter}`,
      category: t.cat,
      model: t.mod,
      author: authorName,
      shortDesc: `Production-tested prompt for ${t.title} using top-tier models and verified parameters.`,
      fullPrompt: `Execute high-fidelity output for {target_subject}. Optimize for {primary_quality} with strict adherence to professional grade standards. Additional parameters: style={style_token}, lighting={lighting_setup}, fidelity=maximum.`,
      descriptionMd: `### Production Prompt\nCurated prompt template for **${t.title}**.\n\n### Usage\nSubstitute the highlighted template variables \`{target_subject}\` and \`{style_token}\` with your desired subject.`,
      parameters: { model: t.mod, quality: "high", seed: 1000 + idCounter, iteration: "v1.0" },
      media: [
        { type: t.cat === 'videos' ? 'VIDEO' : (t.cat === 'audio' ? 'AUDIO' : 'IMAGE'), url: `https://images.unsplash.com/photo-${1500000000000 + (idCounter * 1234567) % 50000000}?w=1200&auto=format&fit=crop&q=80`, caption: t.title }
      ],
      tags: [t.tag, t.cat, 'verified', 'production'],
      stars: Math.floor(Math.random() * 300) + 15,
      copies: Math.floor(Math.random() * 1200) + 80,
      isFeatured: idCounter % 7 === 0
    });
    idCounter++;
  }

  console.log(`🌱 Inserting ${allPromptsToCreate.length} prompt cards into database...`);

  const createdPromptsList: any[] = [];

  for (const p of allPromptsToCreate) {
    const authorUser = createdUsers[p.author] || createdUsers.alexchen;
    const cat = createdCategories[p.category] || createdCategories.images;
    const mdl = createdModels[p.model] || createdModels['gpt-4o'];

    const prompt = await prisma.prompt.create({
      data: {
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDesc,
        fullPrompt: p.fullPrompt,
        descriptionMd: p.descriptionMd,
        authorId: authorUser.id,
        categoryId: cat.id,
        modelId: mdl.id,
        license: 'MIT-Prompt',
        visibility: 'PUBLIC',
        copyCount: 0,
        viewsCount: 0,
        isFeatured: p.isFeatured || false,
        sandboxCode: (p as any).sandboxCode || null,
      }
    });

    // Create initial Version v1.0
    const version = await prisma.promptVersion.create({
      data: {
        promptId: prompt.id,
        versionNumber: 'v1.0',
        title: 'Initial Release',
        promptText: p.fullPrompt,
        parametersJson: JSON.stringify(p.parameters),
        changelog: 'Initial verified benchmark release with sample output.',
        editorId: authorUser.id,
      }
    });

    // Create Media
    if (p.media && p.media.length > 0) {
      for (let i = 0; i < p.media.length; i++) {
        const m = p.media[i];
        await prisma.promptMedia.create({
          data: {
            promptId: prompt.id,
            versionId: version.id,
            mediaType: m.type,
            url: m.url,
            thumbnailUrl: (m as any).thumbnailUrl || m.url,
            caption: m.caption,
            orderIndex: i,
          }
        });
      }
    }

    // Create Tags
    for (const tagName of p.tags) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: { name: tagName, slug: tagSlug }
      });
      await prisma.promptTag.create({
        data: { promptId: prompt.id, tagId: tag.id }
      }).catch(() => {});
    }

    // Real stats: prompts start with 0 stars until real users star them!
    createdPromptsList.push(prompt);
  }

  // Create Fork lineage relationships on some prompts!
  console.log('🌱 Creating GitHub-style fork relationships and lineage...');
  const bySlug = (slug: string) => createdPromptsList.find((p) => p.slug === slug);
  const parentPrompt = bySlug('cinematic-35mm-cyberpunk-street-portrait-tokyo-rain');
  const childPrompt = bySlug('hyper-realistic-macro-studio-microchips-ice'); // Remix of the portrait prompt
  if (parentPrompt && childPrompt) {
    await prisma.prompt.update({
      where: { id: childPrompt.id },
      data: { forkedFromPromptId: parentPrompt.id }
    });
    await prisma.fork.create({
      data: {
        parentPromptId: parentPrompt.id,
        childPromptId: childPrompt.id,
      }
    });
  }

  // Create Edit Suggestions (Pull Requests)
  console.log('🌱 Creating PR-style Edit Suggestions...');
  if (createdPromptsList.length > 0) {
    await prisma.editSuggestion.create({
      data: {
        promptId: createdPromptsList[0].id,
        authorId: createdUsers.marcus_dev.id,
        proposedTitle: 'Cinematic 35mm Cyberpunk Street Portrait (Refined Skin Texture)',
        proposedPromptText: createdPromptsList[0].fullPrompt.replace('--style raw', '--style raw --c 5 --stylize 120'),
        proposedParameters: JSON.stringify({ stylize: 120, chaos: 5 }),
        notes: 'Reduces excessive neon glare on cheekbones while preserving razor-sharp 35mm lens grain.',
        status: 'OPEN',
      }
    });

    // Create Feedback Thread (Issue)
    const thread = await prisma.feedbackThread.create({
      data: {
        promptId: createdPromptsList[0].id,
        authorId: createdUsers.elena_v.id,
        title: 'Works surprisingly well with Midjourney v7 alpha upscale',
        tag: 'feedback',
        status: 'OPEN',
      }
    });

    await prisma.comment.create({
      data: {
        promptId: createdPromptsList[0].id,
        threadId: thread.id,
        userId: createdUsers.elena_v.id,
        bodyMd: 'Tested this with the new subtle upscaler on MJ v7. Rain droplets on the coat gained incredible specular highlights! Highly recommended.',
      }
    });

    await prisma.comment.create({
      data: {
        promptId: createdPromptsList[0].id,
        threadId: thread.id,
        userId: createdUsers.sarah_connor.id,
        bodyMd: 'Thanks @elena_v! Merged your parameter suggestions into our recommended preset.',
      }
    });
  }

  // Create Collections / Boards
  console.log('🌱 Creating Curated Collections...');
  const collectionsData = [
    {
      user: createdUsers.alexchen,
      name: 'Production Ready Next.js & Agent Stacks',
      slug: 'production-ready-nextjs-agent-stacks',
      description: 'Battle-tested scaffolding prompts for engineering teams shipping autonomous software.',
      items: [bySlug('fullstack-nextjs-15-app-router-prisma-stripe-scaffolding')?.id, bySlug('autonomous-competitor-intelligence-agent-multi-step')?.id]
    },
    {
      user: createdUsers.sarah_connor,
      name: 'Cinematic Camera Moves & Film Emulation',
      slug: 'cinematic-camera-moves-film-emulation',
      description: 'Sora, Runway Gen-3, and Midjourney prompt formulations inspired by 35mm film directors.',
      items: [bySlug('cinematic-35mm-cyberpunk-street-portrait-tokyo-rain')?.id, bySlug('hyper-realistic-macro-studio-microchips-ice')?.id, bySlug('fpv-drone-dive-misty-alpine-waterfall-dawn')?.id]
    }
  ];

  for (const c of collectionsData) {
    const col = await prisma.collection.create({
      data: {
        userId: c.user.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        isPublic: true,
      }
    });

    for (const pId of c.items) {
      if (pId) {
        await prisma.collectionItem.create({
          data: { collectionId: col.id, promptId: pId }
        }).catch(() => {});
      }
    }
  }

  // Create Prompt Packs
  console.log('🌱 Creating Downloadable Prompt Packs...');
  const packsData = [
    {
      title: '50 Cinematic Sora & Runway Director Shots',
      slug: '50-cinematic-sora-runway-director-shots',
      description: 'A curated bundle of camera moves: FPV dives, 360 orbits, crane hyperlapses, and film stock emulations.',
      icon: 'Film',
      category: 'Videos',
      isFeatured: true,
      downloadsCount: 0,
      prompts: [bySlug('hyper-realistic-macro-studio-microchips-ice')?.id, bySlug('fpv-drone-dive-misty-alpine-waterfall-dawn')?.id].filter(Boolean)
    },
    {
      title: 'Modern SaaS UI & Bento Grid Systems',
      slug: 'modern-saas-ui-bento-grid-systems',
      description: 'Ready-to-use component prompts generating responsive Tailwind CSS and accessible React interfaces.',
      icon: 'Layout',
      category: 'UI/UX',
      isFeatured: true,
      downloadsCount: 0,
      prompts: [bySlug('modern-neo-fintech-wealth-dashboard-glassmorphism')?.id, bySlug('bento-grid-design-system-saas-landing-page')?.id].filter(Boolean)
    }
  ];

  for (const pk of packsData) {
    const pack = await prisma.promptPack.create({
      data: {
        title: pk.title,
        slug: pk.slug,
        description: pk.description,
        icon: pk.icon,
        category: pk.category,
        isFeatured: pk.isFeatured,
        downloadsCount: pk.downloadsCount,
      }
    });

    for (let i = 0; i < pk.prompts.length; i++) {
      await prisma.promptPackItem.create({
        data: {
          packId: pack.id,
          promptId: pk.prompts[i],
          orderIndex: i
        }
      }).catch(() => {});
    }
  }

  // Create Weekly Community Challenge
  console.log('🌱 Creating Weekly Community Challenge...');
  const challenge = await prisma.challenge.create({
    data: {
      title: 'Challenge #14: The Ultimate 2026 AI Fintech Interface',
      slug: 'challenge-14-ultimate-2026-fintech-interface',
      description: 'Design the most intuitive, beautiful, and accessible financial dashboard prompt. Must feature dark-mode glassmorphism, portfolio breakdown, and micro-interactions.',
      theme: 'Autonomous Finance & Wealth Management',
      prize: '$1,000 Compute Credits + Obsidian Elite Badge',
      startsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      isActive: true,
    }
  });

  const fintechPrompt = bySlug('modern-neo-fintech-wealth-dashboard-glassmorphism');
  if (fintechPrompt) {
    await prisma.challengeSubmission.create({
      data: {
        challengeId: challenge.id,
        promptId: fintechPrompt.id,
        userId: createdUsers.elena_v.id,
        votesCount: 89
      }
    }).catch(() => {});
  }

  console.log(`✅ Seed completed: ${createdPromptsList.length} prompts plus users, models, packs and a challenge. Run \`npm run import:open-data\` for the open-dataset prompts.`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
