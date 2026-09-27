/**
 * Script: curate-and-purge.ts
 *
 * 1. Purges low-quality prompts:
 *    - DeepAction v1 raw action clips (e.g. "A person making a funny face")
 *    - Seed template placeholder prompts ("Execute high-fidelity output for {target_subject}...")
 *    - Trivial short prompts (< 65 chars)
 *    - Generic single-word / raw role prompts
 *
 * 2. Keeps genuine high-quality community prompts (curated FLUX, Midjourney, WebSight UI sites).
 *
 * 3. Injects a comprehensive, museum-grade prompt library across ALL 7 CATEGORIES
 *    complete with high-res imagery, {variables}, markdown documentation, parameters,
 *    and runnable live sandboxes.
 */
import { PrismaClient } from '@prisma/client';
import { ADDITIONAL_MASTER_PROMPTS } from './additional-master-prompts';

const prisma = new PrismaClient();

interface CuratedPrompt {
  title: string;
  slug: string;
  category: 'images' | 'videos' | 'applications' | 'ui-ux' | 'text-writing' | 'code-free-agents' | 'audio';
  model: string;
  authorUsername: string;
  shortDesc: string;
  fullPrompt: string;
  descriptionMd: string;
  parameters: Record<string, any>;
  media: { type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'APP_PREVIEW'; url: string; caption?: string }[];
  tags: string[];
  isFeatured?: boolean;
  sandboxCode?: string;
}

const MASTER_PROMPTS: CuratedPrompt[] = [
  // =========================================================================
  // 1. TEXT / WRITING
  // =========================================================================
  {
    title: 'Y-Combinator Series A Pitch Deck Script & Narrative Arc',
    slug: 'yc-series-a-pitch-deck-narrative-arc',
    category: 'text-writing',
    model: 'claude-3-7-sonnet',
    authorUsername: 'alexchen',
    shortDesc: 'A battle-tested 10-slide venture capital pitch deck narrative builder tailored for YC and top-tier Series A funds.',
    fullPrompt: `You are an elite Silicon Valley venture capital narrative architect who has coached over 50 YC founders through Series A rounds.

Transform my startup details into a compelling, investor-grade 10-slide pitch script.

Startup Details:
- Company Name: {company_name}
- Problem Solved: {core_problem}
- Unique Insight / Secret: {unique_insight}
- Target Customer & Market Size: {target_market}
- Traction / Metrics: {current_traction}
- Ask / Round Size: {round_size}

Generate:
1. **The Hook (Slide 1-2)**: The undeniable macro shift creating a market inevitability.
2. **The Problem & Status Quo (Slide 3)**: Quantified pain with emotional resonance.
3. **The Solution & Proprietary Moat (Slide 4-5)**: 10x better metric, why incumbents cannot copy.
4. **Market Sizing (Slide 6)**: Bottom-up TAM/SAM/SOM calculation methodology.
5. **Business Model & Unit Economics (Slide 7)**: CAC, LTV, payback period, net revenue retention.
6. **Go-To-Market Flywheel (Slide 8)**: Repeatable distribution channels.
7. **Team & Unfair Advantage (Slide 9)**: Founder-market fit narrative.
8. **The Ask & 18-Month Milestones (Slide 10)**: Clear capital allocation plan.

Tone: Crisp, data-driven, zero fluff, high signal-to-noise ratio.`,
    descriptionMd: `### About this prompt
Crafted using narrative frameworks from top venture funds (Sequoia, Benchmark, Founders Fund). Designed to turn raw startup metrics into an irresistible Series A story.

### Recommended Parameters:
- **Model**: Claude 3.7 Sonnet (Extended Thinking enabled) or OpenAI GPT-4o
- **Temperature**: 0.4 (focused, analytical)`,
    parameters: { model: 'claude-3-7-sonnet', temperature: 0.4, framework: 'YC Series A Arc', max_tokens: 3000 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80',
        caption: 'Executive boardroom venture capital presentation'
      }
    ],
    tags: ['pitch-deck', 'venture-capital', 'startup', 'ycombinator', 'storytelling'],
    isFeatured: true,
  },
  {
    title: 'High-Converting B2B Cold Email Sequence (Problem-Agitate-Solve)',
    slug: 'high-converting-b2b-cold-email-sequence',
    category: 'text-writing',
    model: 'gpt-4o',
    authorUsername: 'alexchen',
    shortDesc: 'A 4-step B2B outbound email sequence delivering 35%+ open rates and 12%+ reply rates using modern social proof.',
    fullPrompt: `You are a world-class outbound sales strategist who specializes in writing non-spammy, highly personalized B2B cold emails.

Create a 4-step cold outreach sequence targeting {target_role} at {company_type}.
Value Proposition: {value_prop}
Case Study / Proof Point: {social_proof}

Structure each email as follows:
- **Email 1 (The Trigger Event)**: Under 75 words. Acknowledges a specific industry trigger, presents one sharp pain point, and ends with a low-friction soft CTA (e.g., "Worth exploring?").
- **Email 2 (The Case Study Breakdown - Day 3)**: Shares how a similar peer achieved {social_proof} without standard overhead.
- **Email 3 (The Contrarian Viewpoint - Day 7)**: Highlights a common mistake {target_role} makes when addressing {value_prop}.
- **Email 4 (The Graceful Breakup - Day 14)**: Leaves the door open with an insightful resource or benchmark checklist.

Constraints:
- No cheesy openers like "Hope this email finds you well" or "I know you're busy".
- Mobile-friendly line breaks (no paragraphs longer than 2 sentences).
- Subject lines: Under 4 words, lowercase, conversational.`,
    descriptionMd: `### Outbound Email Sequence
Tested across enterprise SaaS outbound campaigns. Replaces generic marketing pitches with concise, problem-focused micro-emails.`,
    parameters: { model: 'gpt-4o', temperature: 0.7, emails: 4, word_count_per_email: 85 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
        caption: 'B2B Sales strategy and digital communication'
      }
    ],
    tags: ['sales', 'cold-email', 'copywriting', 'b2b', 'outbound'],
    isFeatured: true,
  },
  {
    title: 'Viral Tech Thought-Leadership Thread for LinkedIn & X',
    slug: 'viral-tech-thought-leadership-thread-linkedin-x',
    category: 'text-writing',
    model: 'claude-3-7-sonnet',
    authorUsername: 'marcus_dev',
    shortDesc: 'Convert complex engineering or AI insights into engaging, viral social hooks with high retention and bookmark rates.',
    fullPrompt: `Act as a top 0.1% technical content creator and Ghostwriter for Tech Executives and Staff Engineers.

Turn this raw technical concept into an authoritative, viral LinkedIn post and Twitter/X thread:
- Concept / Insight: {tech_topic}
- Target Audience: {audience_engineers_or_leaders}
- Key Takeaway: {core_lesson}

Format Requirements:
1. **Hook (Line 1-3)**: Pattern-interrupting statement that challenges conventional wisdom in software/AI.
2. **The Problem / Illusion**: Why 90% of teams are doing this wrong today.
3. **The Core Framework**: 3-step practical blueprint with bullet points and micro-examples.
4. **The Counter-Intuitive Truth**: The subtle nuance junior people miss but senior architects know.
5. **Call to Discussion**: Thought-provoking open question that drives high-quality technical debates in comments.

Tone: Insightful, pragmatic, direct, zero buzzwords.`,
    descriptionMd: `### Viral Tech Thought-Leadership
Optimized for social algorithms that reward high dwell time, comment discussions, and bookmarking.`,
    parameters: { model: 'claude-3-7-sonnet', temperature: 0.6, format: 'dual-platform' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
        caption: 'Modern tech workspace and digital content creation'
      }
    ],
    tags: ['linkedin', 'twitter', 'content-marketing', 'thought-leadership'],
    isFeatured: false,
  },
  {
    title: 'Enterprise Commercial Contract Legal Risk & Indemnity Auditor',
    slug: 'enterprise-commercial-contract-legal-risk-auditor',
    category: 'text-writing',
    model: 'deepseek-r1',
    authorUsername: 'alexchen',
    shortDesc: 'Deep chain-of-thought analysis of MSAs, SLAs, and SaaS terms to pinpoint one-sided liabilities and IP exposures.',
    fullPrompt: `You are a Senior Corporate Legal Counsel specializing in Enterprise SaaS Master Services Agreements (MSA), Intellectual Property licenses, and Data Privacy (GDPR/CCPA).

Review the following contract clause or section:
\`\`\`
{contract_text}
\`\`\`

Perform a comprehensive risk audit:
1. **Red Flag Clauses**: Identify terms that disproportionately favor the counterparty (e.g., unlimited liability, broad indemnity, perpetual IP assignment, aggressive termination without cause).
2. **Hidden Exposure Analysis**: What worst-case scenarios could this trigger if a service outage or data breach occurs?
3. **Redline Recommendations**: Provide exact drop-in clause edits with strikethrough additions/deletions.
4. **Negotiation Talking Points**: Explanations the founder/sales leader can use to push back during procurement negotiations.`,
    descriptionMd: `### Contract Auditor
Harnesses **DeepSeek R1** or **Claude 3.7** with extended thinking to spot nuances and traps in vendor contracts.`,
    parameters: { model: 'deepseek-r1', reasoning_effort: 'high', focus: 'risk_mitigation' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
        caption: 'Corporate legal analysis and contract document review'
      }
    ],
    tags: ['legal', 'contracts', 'risk-analysis', 'saas-agreements'],
    isFeatured: false,
  },
  {
    title: 'Technical Architecture Decision Record (ADR) & System RFC',
    slug: 'technical-architecture-decision-record-adr-rfc',
    category: 'text-writing',
    model: 'claude-3-7-sonnet',
    authorUsername: 'marcus_dev',
    shortDesc: 'Industry-standard Architectural Decision Record (ADR) template to document major system trade-offs and tech stack decisions.',
    fullPrompt: `Act as a Principal Software Architect. Draft a comprehensive Architecture Decision Record (ADR) and RFC document for {engineering_proposal}.

Context:
- Current Architecture: {current_state}
- Core Pain Points: {latency_cost_scalability_issues}
- Evaluated Options: {technology_options}

Structure:
1. **Status**: PROPOSED / ACCEPTED / SUPERSEDED
2. **Context & Problem Statement**: Quantified metrics (throughput, cost, developer velocity).
3. **Decision Drivers**: 4 non-negotiable constraints (e.g., sub-50ms p99 latency, zero downtime migration).
4. **Considered Options & Trade-Off Matrix**: Highlighting pros/cons, operational complexity, and vendor lock-in for each.
5. **Decision & Rationale**: Why the chosen approach wins.
6. **Negative Consequences & Mitigations**: Honest acknowledgement of drawbacks and how the team will safeguard against them.
7. **Phased Rollout Plan**: Canary deployment, feature flags, rollback triggers.`,
    descriptionMd: `### Architecture Decision Record
Ensures engineering teams align on high-stakes architectural changes with transparent trade-off documentation.`,
    parameters: { model: 'claude-3-7-sonnet', format: 'ADR RFC', engineering_standard: 'Staff+' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
        caption: 'Cloud system architectural topology and server diagram'
      }
    ],
    tags: ['architecture', 'adr', 'rfc', 'system-design', 'engineering'],
    isFeatured: true,
  },

  // =========================================================================
  // 2. APPLICATIONS
  // =========================================================================
  {
    title: 'Full-Stack Next.js 15 SaaS Starter with Stripe, Auth & Prisma',
    slug: 'full-stack-nextjs-15-saas-starter-architecture',
    category: 'applications',
    model: 'cursor-composer',
    authorUsername: 'marcus_dev',
    shortDesc: 'End-to-end architecture and scaffolding prompt for an enterprise Next.js 15 App Router SaaS with Stripe billing.',
    fullPrompt: `Act as a Principal Full-Stack Architect. Scaffold a production-ready Next.js 15 SaaS boilerplate with the following stack:
- Framework: Next.js 15 (App Router, Server Actions, React 19)
- Styling: Tailwind CSS v4 + Lucide React
- Database & ORM: PostgreSQL + Prisma ORM
- Authentication: NextAuth.js / Auth.js (OAuth + Magic Links)
- Payments: Stripe Subscriptions & Webhooks
- Target SaaS Idea: {saas_concept}

Provide the complete directory architecture, key schema definitions, and the implementation of:
1. \`prisma/schema.prisma\` with User, Subscription, Organization, and {saas_domain_model}
2. \`app/api/webhooks/stripe/route.ts\` handling \`checkout.session.completed\` and \`customer.subscription.deleted\`
3. Server Action for updating user profile and organization membership
4. Middleware protecting \`/dashboard/*\` routes with role-based access control.`,
    descriptionMd: `### SaaS Architecture Blueprint
Designed specifically for **Cursor Composer** and **Claude 3.7 Sonnet** to scaffold a production-grade SaaS codebase in minutes.`,
    parameters: { framework: 'Next.js 15', auth: 'Auth.js', payments: 'Stripe', orm: 'Prisma' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        caption: 'Full-stack SaaS dashboard metrics and analytics overview'
      }
    ],
    tags: ['nextjs', 'saas', 'stripe', 'prisma', 'cursor-composer'],
    isFeatured: true,
  },
  {
    title: 'Autonomous Multi-Tool Agent Orchestrator with Function Calling',
    slug: 'autonomous-multi-tool-agent-orchestrator',
    category: 'applications',
    model: 'claude-3-7-sonnet',
    authorUsername: 'alexchen',
    shortDesc: 'A TypeScript agentic loop orchestrator with tool definitions, memory state, and self-healing error recovery.',
    fullPrompt: `Create a clean, production-grade TypeScript Agent Orchestrator engine using {ai_provider_sdk}.

Requirements:
1. **Tool Registry**: Define a type-safe \`Tool\` interface with Zod schema validation for input arguments.
2. **ReAct Loop**: Implement an autonomous loop (Reason -> Act -> Observe) capped at {max_steps} iterations.
3. **Execution Guardrails**:
   - Catch tool errors and pass the stack trace back to the LLM for self-correction.
   - Timeout guard on external tool execution (default 10s).
   - In-memory conversation history buffer with token budgeting.
4. **Implement 3 Sample Tools**:
   - \`web_search(query: string)\`
   - \`calculator(expression: string)\`
   - \`database_lookup(key: string)\`

Provide clean, modular code with zero external boilerplate.`,
    descriptionMd: `### Agentic Orchestrator
Build your own autonomous AI agent without heavy frameworks like LangChain. Lightweight, observable, and fully type-safe.`,
    parameters: { language: 'TypeScript', engine: 'ReAct', max_steps: 10, safety: 'self-healing' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        caption: 'Abstract neural network graph visualizing autonomous multi-agent tool execution'
      }
    ],
    tags: ['agents', 'typescript', 'function-calling', 'orchestrator', 'claude-3-7'],
    isFeatured: true,
  },
  {
    title: 'FastAPI Async Microservice with Celery, Redis & Docker',
    slug: 'fastapi-async-microservice-celery-redis-docker',
    category: 'applications',
    model: 'cursor-composer',
    authorUsername: 'marcus_dev',
    shortDesc: 'Production-grade Python FastAPI backend boilerplate with async worker queues, health checks, and Docker Compose.',
    fullPrompt: `Act as a Staff Python Backend Engineer. Scaffold a high-throughput async microservice using FastAPI, Celery, and Redis.

Target Domain: {microservice_purpose}
Database: PostgreSQL with SQLModel / SQLAlchemy 2.0 Async
Task Queue: Celery with Redis broker

Provide:
1. \`main.py\` with lifespan context manager, CORS middleware, and structured JSON logging.
2. \`tasks.py\` defining a background worker task with exponential backoff retries.
3. \`dependencies.py\` for database session yielding and API key authentication.
4. \`Dockerfile\` and multi-stage \`docker-compose.yml\` for local development.`,
    descriptionMd: `### Production FastAPI Microservice
Enterprise-grade async Python backend blueprint with task worker queues.`,
    parameters: { framework: 'FastAPI', python: '3.12', queue: 'Celery + Redis', orm: 'SQLModel' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
        caption: 'Cloud server infrastructure and backend microservice cluster'
      }
    ],
    tags: ['fastapi', 'python', 'celery', 'redis', 'microservices', 'docker'],
    isFeatured: false,
  },
  {
    title: 'Real-Time Collaborative Whiteboard Canvas with WebSockets',
    slug: 'real-time-collaborative-whiteboard-canvas-websockets',
    category: 'applications',
    model: 'cursor-composer',
    authorUsername: 'marcus_dev',
    shortDesc: 'Multiplayer interactive canvas application with CRDT conflict resolution, live cursors, and shape drawing.',
    fullPrompt: `Build a multiplayer collaborative drawing canvas web application in React and HTML5 Canvas with WebSocket sync.

Features:
1. **Live Multiplayer Cursors**: Display real-time cursor positions with user avatars and colored tags.
2. **Drawing Tools**: Freehand pen, geometric shapes (rectangle, circle), line arrows, and sticky notes.
3. **Sync Engine**: State broadcast via WebSockets with optimistic local rendering to eliminate lag.
4. **Undo / Redo Stack**: Action history stack supporting command pattern.
5. **Theme**: Dark glassmorphic canvas controls with floating tool palette.

Provide the full client component code and the Node.js WebSocket relay server.`,
    descriptionMd: `### Collaborative Whiteboard
Everything needed to build a Figma / Miro style multiplayer collaborative canvas from scratch.`,
    parameters: { tech: 'React + Canvas API', sync: 'WebSocket CRDT', theme: 'Dark Mode' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1542744094-3a31727221eb?w=1200&auto=format&fit=crop&q=80',
        caption: 'Creative collaborative canvas interface design'
      }
    ],
    tags: ['canvas', 'websockets', 'multiplayer', 'realtime', 'cursor-composer'],
    isFeatured: false,
  },

  // =========================================================================
  // 3. UI/UX
  // =========================================================================
  {
    title: 'Modern Neo-Fintech Wealth Dashboard with Glassmorphism & Micro-Charts',
    slug: 'modern-neo-fintech-wealth-dashboard-glassmorphism',
    category: 'ui-ux',
    model: 'claude-3-7-sonnet',
    authorUsername: 'elena_v',
    shortDesc: 'Complete single-file React & Tailwind responsive banking dashboard with live interactive sparklines.',
    fullPrompt: 'Create an ultra-modern, responsive SaaS fintech dashboard for high-net-worth portfolio management. Tech: HTML + Tailwind CSS + Lucide icons style. Include: 1) Top portfolio balance card with +14.2% growth pill and 30-day mini sparkline; 2) Asset allocation ring with crypto/stocks/real-estate breakdown; 3) Recent transactions list with company logos and status badges; 4) Quick Transfer drawer. Palette: Dark slate (#0b0f19), emerald accent (#10b981), hyper-indigo (#6366f1). Ensure full interactive hover states and accessible tab switching.',
    descriptionMd: `### Interactive Sandbox Included
Click the **Live Sandbox** tab on this prompt card to interact with the real component!`,
    parameters: { framework: 'Tailwind CSS + HTML', theme: 'Dark Fintech', accessibility: 'WCAG-AA' },
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
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Apex Global Wealth</h1>
        <p class="text-xs text-slate-400">Private Banking & Yield Vault</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">Verified Tier 1</span>
        <button class="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold">Deposit</button>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="glass p-5 rounded-2xl">
        <div class="text-xs text-slate-400">Total Liquid Assets</div>
        <div class="text-2xl font-bold mt-1">$1,248,390.12</div>
        <div class="text-xs text-emerald-400 mt-2">↑ +14.2% (YTD Performance)</div>
      </div>
      <div class="glass p-5 rounded-2xl">
        <div class="text-xs text-slate-400">Real Estate Equities</div>
        <div class="text-2xl font-bold mt-1">$840,000.00</div>
        <div class="text-xs text-indigo-400 mt-2">3 Multi-family Assets</div>
      </div>
      <div class="glass p-5 rounded-2xl">
        <div class="text-xs text-slate-400">Monthly Cashflow</div>
        <div class="text-2xl font-bold mt-1">$18,420.00</div>
        <div class="text-xs text-slate-400 mt-2">Next distribution: 1st of month</div>
      </div>
    </div>
  </div>
</body>
</html>`,
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        caption: 'Fintech wealth dashboard with interactive charts'
      }
    ],
    tags: ['fintech', 'dashboard', 'tailwind', 'glassmorphism', 'ui-ux'],
    isFeatured: true,
  },
  {
    title: 'Crypto Portfolio & DeFi Liquidity Tracker with Glassmorphism',
    slug: 'crypto-portfolio-defi-liquidity-tracker-glassmorphism',
    category: 'ui-ux',
    model: 'claude-3-7-sonnet',
    authorUsername: 'elena_v',
    shortDesc: 'Single-file runnable React/Tailwind cryptocurrency analytics dashboard with live price cards and asset allocation.',
    fullPrompt: `Design a high-end, responsive Web3 DeFi Portfolio and Yield Farming Dashboard using HTML, Tailwind CSS, and Lucide icons.

Specifications:
- **Header**: Connected wallet pill with ENS name ("vitalik.eth"), network indicator (Ethereum Mainnet), and live notification badge.
- **Hero Stats**: Total portfolio value ($142,850.40) with 24h PnL badge (+8.4%), staking yields APY, and gas tracker (14 Gwei).
- **Interactive Asset Table**: Coins (ETH, BTC, SOL, AVAX) with mini sparklines, 7d change, balance, and one-click "Swap" / "Stake" buttons.
- **Glassmorphism Aesthetic**: Dark slate backdrop (\`#0a0d14\`), subtle glowing gradient borders, semi-transparent frosted cards (\`backdrop-blur-xl\`), and neon purple/cyan accents.
- Make it fully responsive and visually stunning.`,
    descriptionMd: `### Interactive Sandbox Included
Click the **Live Sandbox** tab to test this sleek Web3 interface directly in your browser.`,
    parameters: { framework: 'Tailwind CSS + HTML', theme: 'Web3 Dark Glass', responsive: 'mobile + desktop' },
    sandboxCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #060911; font-family: system-ui, sans-serif; }
    .glass { background: rgba(18, 24, 38, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.07); }
  </style>
</head>
<body class="p-6 text-slate-100 min-h-screen">
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">Ξ</div>
        <div>
          <h1 class="font-bold text-lg tracking-tight">NovaVault DeFi</h1>
          <p class="text-xs text-slate-400">Multi-Chain Yield Aggregator</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="glass px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>vitalik.eth</span>
        </div>
        <button class="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold">Connect</button>
      </div>
    </header>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="glass p-5 rounded-2xl">
        <div class="text-xs text-slate-400">Net Worth</div>
        <div class="text-2xl font-bold mt-1.5 text-white">$148,290.45</div>
        <div class="text-xs text-emerald-400 mt-2">↑ +8.42% Today</div>
      </div>
      <div class="glass p-5 rounded-2xl">
        <div class="text-xs text-slate-400">Weighted APY</div>
        <div class="text-2xl font-bold mt-1.5 text-indigo-400">14.8%</div>
        <div class="text-xs text-slate-400 mt-2">6 active pools</div>
      </div>
      <div class="glass p-5 rounded-2xl">
        <div class="text-xs text-slate-400">Gas Tracker</div>
        <div class="text-2xl font-bold mt-1.5 text-amber-300">12 Gwei</div>
        <div class="text-xs text-slate-400 mt-2">Low congestion</div>
      </div>
    </div>
  </div>
</body>
</html>`,
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80',
        caption: 'Cryptocurrency portfolio tracker with glassmorphism styling'
      }
    ],
    tags: ['web3', 'defi', 'glassmorphism', 'dashboard', 'crypto'],
    isFeatured: true,
  },
  {
    title: 'SaaS Tiered Pricing Matrix with Annual Discount Toggle',
    slug: 'saas-tiered-pricing-matrix-annual-discount-toggle',
    category: 'ui-ux',
    model: 'claude-3-7-sonnet',
    authorUsername: 'elena_v',
    shortDesc: 'A high-converting 3-tier SaaS pricing table with monthly/annual billing switch, featured pill, and feature comparisons.',
    fullPrompt: `Create an ultra-modern SaaS Pricing Page in Tailwind CSS and clean Vanilla JavaScript.

Include:
- **Header**: Catchy headline ("Simple, transparent pricing for ambitious teams") with customer satisfaction badge.
- **Interactive Billing Toggle**: Switch between "Monthly" and "Annual (Save 25%)" that dynamically updates pricing figures smoothly.
- **3 Plans**:
  1. *Starter* ($29/mo or $22/mo billed annually) - For early founders
  2. *Pro (Most Popular)* ($79/mo or $59/mo) - Highlighted with indigo glow border and "Recommended" badge
  3. *Enterprise* (Custom quote) - For large organizations
- **Feature Checklist**: Checkmark list for each tier with tooltips for advanced terms.
- **FAQ Accordion**: 3 common questions with smooth toggle animations.`,
    descriptionMd: `### Conversion-Optimized Pricing Matrix
Built using proven high-conversion design patterns. Includes dynamic JS toggle that changes prices seamlessly.`,
    parameters: { framework: 'HTML + Tailwind CSS', conversion: 'high', tiers: 3 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
        caption: 'SaaS pricing table and conversion analytics'
      }
    ],
    tags: ['pricing', 'saas', 'conversion', 'ui-design', 'tailwind'],
    isFeatured: false,
  },

  // =========================================================================
  // 4. CODE-FREE AGENTS
  // =========================================================================
  {
    title: 'Autonomous Competitor Intelligence & Pricing Sentinel Agent',
    slug: 'autonomous-competitor-intelligence-pricing-sentinel-agent',
    category: 'code-free-agents',
    model: 'deepseek-r1',
    authorUsername: 'alexchen',
    shortDesc: 'Monitors competitor pricing pages, feature releases, and positioning changes, alerting team via structured Slack reports.',
    fullPrompt: `You are an Autonomous Competitive Intelligence Sentinel Agent for {my_product_name} in the {industry_niche} space.

Competitors Monitored: {competitor_urls_or_names}

Your objective:
1. **Change Detection**: Analyze the latest website copy, changelog posts, and pricing tier changes from each competitor.
2. **Strategy Deconstruction**:
   - What new customer persona are they targeting?
   - Did they shift pricing metrics (e.g. per-seat to usage-based)?
   - Which features are they marketing most aggressively?
3. **Executive Action Report**:
   - **Executive Summary**: 3 key bullet points on the competitive landscape this week.
   - **Threat Level Assessment**: Low / Medium / High with justification.
   - **Counter-Moves**: 2 immediate defensive or offensive actions our sales and product team should execute.

Output Format: Clean, executive-ready Markdown formatted for automated Slack webhook delivery.`,
    descriptionMd: `### Competitive Intelligence Sentinel
Designed to run on cron schedules or webhook triggers. Extracts strategic signal from noisy competitor changelogs.`,
    parameters: { cadence: 'Weekly', intelligence_level: 'Executive', threat_scoring: true },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1551836022-b06985bceb24?w=1200&auto=format&fit=crop&q=80',
        caption: 'Autonomous data intelligence dashboard and market monitoring'
      }
    ],
    tags: ['autonomous-agent', 'competitive-intelligence', 'pricing', 'automation', 'deepseek-r1'],
    isFeatured: true,
  },
  {
    title: 'Customer Support Sentiment Triage & Auto-Resolution Agent',
    slug: 'customer-support-sentiment-triage-auto-resolution-agent',
    category: 'code-free-agents',
    model: 'gpt-4o',
    authorUsername: 'alexchen',
    shortDesc: 'Analyzes incoming support tickets, determines urgency and churn risk, drafts empathetic replies, and escalates emergencies.',
    fullPrompt: `You are a Tier-3 Senior Customer Success & Escalation Agent for {saas_company_name}.

Analyze incoming ticket:
\`\`\`
{incoming_ticket_text}
\`\`\`

Perform the following 4 automated actions:
1. **Sentiment & Urgency Scoring**:
   - Sentiment: (Positive / Neutral / Frustrated / Angry)
   - Churn Risk: (Low / Moderate / Critical)
   - Category: (Billing / Bug / Feature Request / Account Access)
2. **Root Cause Diagnosis**: What is the underlying technical or UX breakdown?
3. **Drafted Customer Reply**:
   - Acknowledge frustration with genuine empathy (no robot corporate speak).
   - Provide immediate workaround or solution.
   - Set concrete expectations on next steps.
4. **Internal Engineering Note**: Concisely summarize the bug reproduction steps for the dev team.`,
    descriptionMd: `### Support Triage Agent
Empowers customer support teams to resolve 60%+ of routine tickets instantly while flagging genuine churn risks before they cancel.`,
    parameters: { model: 'gpt-4o', urgency_triage: true, response_style: 'empathetic_pragmatic' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
        caption: 'Customer experience and support operations center'
      }
    ],
    tags: ['customer-support', 'sentiment-analysis', 'automation', 'triage', 'agent'],
    isFeatured: false,
  },
  {
    title: 'Autonomous SEO Topic Authority & Semantic Cluster Strategist',
    slug: 'autonomous-seo-topic-authority-semantic-cluster-strategist',
    category: 'code-free-agents',
    model: 'deepseek-r1',
    authorUsername: 'alexchen',
    shortDesc: 'Generates hub-and-spoke content architecture, search intent matrices, and internal linking graphs for competitive niches.',
    fullPrompt: `You are a Principal Technical SEO & Semantic Content Strategist.

Target Pillar Topic: {pillar_topic}
Target Audience & Buyer Persona: {target_audience}
Competitor Domain to Outrank: {competitor_domain}

Generate a comprehensive Semantic Topic Cluster Strategy:
1. **Pillar Page Specification**: Core value proposition, target primary search query (high volume), outline of 8 core sub-sections.
2. **10 Supporting Spoke Articles**:
   - Title & Target Long-Tail Keyword
   - Search Intent (Informational / Commercial / Transactional)
   - Estimated Search Volume & Difficulty
   - How it links up to the Pillar Page (Anchor text strategy)
3. **Internal Linking Graph**: Bidirectional links between sibling spoke posts to maximize PageRank distribution.
4. **Content Moat Analysis**: What unique proprietary data or calculator should be included to attract natural backlinks?`,
    descriptionMd: `### Semantic Topic Clustering
Construct a topical authority moat that search engines prioritize over thin keyword stuffing.`,
    parameters: { model: 'deepseek-r1', strategy: 'Hub-and-Spoke', intent: 'High-Intent Commercial' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&auto=format&fit=crop&q=80',
        caption: 'Search engine optimization and digital marketing analytics'
      }
    ],
    tags: ['seo', 'content-strategy', 'semantic-search', 'inbound-marketing', 'deepseek-r1'],
    isFeatured: false,
  },
  {
    title: 'Automated PR Security & OWASP Code Review Sentinel',
    slug: 'automated-pr-security-owasp-code-review-sentinel',
    category: 'code-free-agents',
    model: 'deepseek-r1',
    authorUsername: 'alexchen',
    shortDesc: 'Scans GitHub pull request diffs for SQL injection, CSRF, insecure dependencies, and secret leaks with suggested patches.',
    fullPrompt: `You are an Autonomous DevSecOps & OWASP Top 10 Security Sentinel analyzing a Git diff.

Input Git Diff:
\`\`\`diff
{pr_diff_content}
\`\`\`

Perform a comprehensive security triage:
1. **Critical Vulnerability Audit**:
   - SQL Injection / NoSQL Injection risks
   - Broken Object Level Authorization (BOLA / IDOR)
   - Hardcoded secrets, API tokens, private keys
   - XSS / Unsanitized HTML rendering
   - Race conditions in database transactions
2. **Severity Scoring**: Assign CVSS 3.1 score (Low / Medium / High / Critical) for each detected issue.
3. **Actionable Fix**: Provide the exact code snippet replacement fixing the vulnerability.
4. **Review Verdict**: (APPROVE / REQUEST CHANGES / BLOCK DEPLOYMENT).`,
    descriptionMd: `### Security Sentinel Agent
Integrate directly into CI/CD GitHub Actions to block vulnerable code before it reaches production.`,
    parameters: { model: 'deepseek-r1', standard: 'OWASP Top 10 2024', severity_scoring: true },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
        caption: 'Cybersecurity vulnerability scanner and automated code review'
      }
    ],
    tags: ['security', 'code-review', 'owasp', 'devsecops', 'deepseek-r1'],
    isFeatured: false,
  },

  // =========================================================================
  // 5. IMAGES
  // =========================================================================
  {
    title: 'Cinematic 35mm Cyberpunk Street Portrait in Tokyo Rain',
    slug: 'cinematic-35mm-cyberpunk-street-portrait-tokyo-rain',
    category: 'images',
    model: 'midjourney-v7',
    authorUsername: 'sarah_connor',
    shortDesc: 'Hyper-realistic medium shot of a cybernetic courier in Shinjuku alleyway with volumetric neon fog.',
    fullPrompt: 'A cinematic medium portrait of {subject} wearing an oversized translucent techwear poncho, rain droplets beading on cheekbones, faint neon cyan and magenta reflections from Shinjuku alley signs, shot on 35mm Arri Alexa, anamorphic lens flare, shallow depth of field, natural skin texture, ISO 400, muted tungsten backlight --ar 16:9 --style raw --v 7.0',
    descriptionMd: `### Overview
This prompt leverages Midjourney v7's updated sub-surface scattering and lens distortion algorithms.`,
    parameters: { aspect_ratio: '16:9', stylize: 180, chaos: 10, v: '7.0', lens: '35mm Anamorphic' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
        caption: 'Cyberpunk Courier in Shinjuku Rain'
      }
    ],
    tags: ['cyberpunk', 'portrait', '35mm', 'neon', 'cinematic'],
    isFeatured: true,
  },
  {
    title: 'Architectural Brutalism Meets Biophilic Greenhouse',
    slug: 'architectural-brutalism-biophilic-greenhouse',
    category: 'images',
    model: 'flux-1-pro',
    authorUsername: 'elena_v',
    shortDesc: 'Raw cast-concrete atrium overgrown with tropical flora, captured during golden hour sunlight.',
    fullPrompt: 'An architectural photograph of {space_type} constructed from raw board-marked cast concrete and monolithic glass panels, completely overtaken by lush cascading {plant_type}, dramatic sunlight streaming through skylights casting geometric ray shadows, architectural digest editorial style, Hasselblad X2D 100C, 24mm f/8, ultra-sharp detail.',
    descriptionMd: `### Concept
A study in contrasting industrial brutalism with lush organic nature. Flux.1 Pro excels at rendering board-marked concrete grain and realistic botanical veins.`,
    parameters: { aspect_ratio: '4:3', steps: 35, guidance_scale: 3.5, camera: 'Hasselblad X2D' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
        caption: 'Brutalist Concrete Atrium'
      }
    ],
    tags: ['architecture', 'brutalism', 'greenhouse', 'hasselblad'],
    isFeatured: true,
  },
  {
    title: 'Matte Painting: Ancient Orbital Colony Ruins Over Desert Planet',
    slug: 'matte-painting-orbital-colony-ruins-desert-planet',
    category: 'images',
    model: 'sd3-5-large',
    authorUsername: 'alexchen',
    shortDesc: 'Colossal sci-fi ring structure crashing into wind-swept sand dunes, Moebius style palette.',
    fullPrompt: 'Panoramic digital matte painting of a colossal derelict orbital ring station crashed into vast crimson sand dunes, tiny explorer caravan in the foreground providing epic sense of scale, atmosphere haze, dual moons rising on the horizon, art by John Berkey and Chris Foss, 8k resolution, cinematic color grading.',
    descriptionMd: `### Art Direction
Classic 1970s sci-fi book cover aesthetic combined with modern matte painting lighting fidelity.`,
    parameters: { aspect_ratio: '21:9', steps: 40, cfg_scale: 7.0, seed: 928371 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
        caption: 'Derelict Colony Dunes'
      }
    ],
    tags: ['sci-fi', 'matte-painting', 'desert', 'space', 'concept-art'],
    isFeatured: false,
  },
  {
    title: 'Hyper-Realistic Macro Studio Photography of Microchips in Ice',
    slug: 'hyper-realistic-macro-studio-microchips-ice',
    category: 'images',
    model: 'flux-1-pro',
    authorUsername: 'marcus_dev',
    shortDesc: 'A silicon wafer microchip frozen inside a crystal-clear melting block of glacier ice with air bubbles.',
    fullPrompt: 'Extreme macro photograph of a gold-plated {chip_type} embedded inside a crystalline cube of clear ice, microscopic air bubbles, condensation droplets running down the frosted surface, studio strobe lighting with soft turquoise rim light, shot with 100mm macro lens at f/11, focus stacked, 8k commercial product photography.',
    descriptionMd: `### Macro Hardware Aesthetics
Demonstrates precision text rendering on microchip dies using Flux.1 Pro.`,
    parameters: { aspect_ratio: '1:1', steps: 30, guidance: 4.0 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
        caption: 'Frozen Silicon Wafer'
      }
    ],
    tags: ['hardware', 'macro', 'ice', 'commercial', 'studio'],
    isFeatured: false,
  },

  // =========================================================================
  // 6. VIDEOS
  // =========================================================================
  {
    title: 'Cinematic High-Speed FPV Drone Dive Down Alpine Glacier Waterfall',
    slug: 'cinematic-fpv-drone-dive-alpine-glacier-waterfall',
    category: 'videos',
    model: 'sora',
    authorUsername: 'sarah_connor',
    shortDesc: 'Continuous single-take camera trajectory plunging down a 300-meter glacial cataract into an emerald alpine lake.',
    fullPrompt: 'Seamless single-take continuous FPV drone shot flying at 70mph diving down a thunderous 300-meter glacial waterfall in the Swiss Alps, camera banking hard around jagged moss-covered granite towers, water spray misting across the lens with realistic optical droplets, emerging into sunlight over a crystal turquoise lake surrounded by dense evergreen pines, 4k 60fps cinematic fluidity.',
    descriptionMd: `### Camera Dynamics
Optimized for OpenAI Sora's spatial coherence and fluid physics engine.`,
    parameters: { model: 'sora', duration: '15s', fps: 60, resolution: '4K', movement: 'FPV Dive' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&auto=format&fit=crop&q=80',
        caption: 'Alpine glacial waterfall continuous camera dive'
      }
    ],
    tags: ['sora', 'drone', 'fpv', 'cinematography', 'nature', 'video'],
    isFeatured: true,
  },
  {
    title: 'Neon Tokyo Hyperlapse at Night: Shibuya Crossing Traffic Vortex',
    slug: 'neon-tokyo-hyperlapse-shibuya-crossing-vortex',
    category: 'videos',
    model: 'sora',
    authorUsername: 'sarah_connor',
    shortDesc: 'A swirling 360-degree crane hyperlapse above Shibuya crossing with light trails and illuminated billboards.',
    fullPrompt: '360-degree ascending crane hyperlapse shot rotating slowly above Shibuya Crossing at midnight in light rain, thousands of pedestrians carrying translucent umbrellas, red and white light streaks from passing taxis, massive luminous LED screens reflecting off wet asphalt, 8k resolution, fluid temporal consistency.',
    descriptionMd: `### Motion Fidelity
Tested for maintaining billboard text stability while camera orbits 360 degrees.`,
    parameters: { duration: '12s', camera: '360 Crane', fps: 30 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
        caption: 'Shibuya Hyperlapse Night'
      }
    ],
    tags: ['hyperlapse', 'tokyo', 'sora', 'night', 'light-trails'],
    isFeatured: true,
  },
  {
    title: 'Runway Gen-3 Cybernetic Mech Activation & Camera Orbit',
    slug: 'runway-gen-3-cybernetic-mech-activation-orbit',
    category: 'videos',
    model: 'runway-gen-3-alpha',
    authorUsername: 'sarah_connor',
    shortDesc: 'Slow 360-degree orbital camera tracking a colossal humanoid mech powering on inside an underground hangar.',
    fullPrompt: 'Slow 360-degree orbital camera move around a colossal 40-foot humanoid industrial mech inside a subterranean military hangar, hydraulics hissing as pressurized white steam vents from shoulder exhaust ports, dual glowing amber optical sensors igniting in the visor, sparks showering from gantry cranes, photorealistic mechanical joint movement, IMAX 70mm cinematic scale.',
    descriptionMd: `### Runway Gen-3 Director Controls
Demonstrates fine-grained orbital camera velocity control combined with industrial particle physics.`,
    parameters: { model: 'runway-gen-3-alpha', duration: '10s', camera: '360 Orbit', motion_scale: 7.5 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
        caption: 'Industrial sci-fi hangar with cinematic robot lighting'
      }
    ],
    tags: ['runway', 'mech', 'sci-fi', 'vfx', 'cinematography'],
    isFeatured: false,
  },

  // =========================================================================
  // 7. AUDIO
  // =========================================================================
  {
    title: 'Cyberpunk Darksynth Synthwave Anthem with Heavy Bass Drop',
    slug: 'cyberpunk-darksynth-synthwave-anthem-heavy-bass',
    category: 'audio',
    model: 'suno-v4',
    authorUsername: 'suno_maestro',
    shortDesc: 'A high-octane 140 BPM electronic track combining distorted analog synth bass, arpeggios, and female cyberpunk vocals.',
    fullPrompt: `[Genre: Darksynth, Synthwave, Cyberpunk]
[Tempo: 138 BPM, Key: D Minor, High Energy]
[Instruments: Roland TB-303 acid bass, heavy sidechained sub-bass, aggressive saw leads, gated 80s snare, dystopian choir pads]

[Intro]
(Slow pulsing arpeggio builds in the dark)
(Sirens wailing in the distance)

[Verse 1]
Chrome and wire in the neon rain
Running circuits through my vein
Every heartbeat counts the cost
In the city of the lost

[Pre-Chorus]
(Snare roll accelerating, pitch rising)
Systems online, overload the grid!

[Drop]
(Heavy distorted analog synth lead with crushing bass drop)

[Chorus]
We burn the skyline down tonight
Electric shadows in the light
Never look back, break the code
Running down this cyber road!`,
    descriptionMd: `### Suno v4 Prompt Structure
Uses Suno v4 meta-tags like \`[Genre]\`, \`[Tempo]\`, \`[Drop]\`, and \`[Pre-Chorus]\` to ensure structured musical progression and peak drop dynamics.`,
    parameters: { model: 'suno-v4', bpm: 138, key: 'D Minor', genre: 'Darksynth' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
        caption: 'Neon stage lighting and electronic music synthwave visualizer'
      }
    ],
    tags: ['suno', 'synthwave', 'cyberpunk', 'electronic', 'darksynth', 'music'],
    isFeatured: true,
  },
  {
    title: 'BBC Nature Documentary Narrator (David Attenborough Style)',
    slug: 'bbc-nature-documentary-narrator-voice-design',
    category: 'audio',
    model: 'elevenlabs-prime',
    authorUsername: 'suno_maestro',
    shortDesc: 'A masterclass in ElevenLabs vocal pacing, breath marks, dramatic pauses, and gentle intellectual British cadence.',
    fullPrompt: `Voice Profile: British Elderly Gentleman, warm, authoritative, deeply curious, rhythmic breath pauses.
Pacing: Measured, conversational, reverent awe.

Script with inflection cues:
"Here... in the ancient depths of the cloud forest... life operates on a scale [pause] that defies human comprehension.

Look closely at this leaf. [whisper] Not everything is as it seems.

What appears to be a solitary water droplet [pause] is in fact [emphasis] an entire microcosm... home to creatures that will never see the open sky.

And as the dusk gathers [gentle breath], the real spectacle [pause] is only just beginning."`,
    descriptionMd: `### ElevenLabs Prompt Engineering
Demonstrates how punctuation marks, bracketed tags (\`[pause]\`, \`[whisper]\`, \`[emphasis]\`), and pacing instructions produce natural, lifelike voiceovers.`,
    parameters: { model: 'elevenlabs-prime', voice_accent: 'British', stability: 0.65, similarity: 0.85 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80',
        caption: 'Misty green nature canopy and tranquil wildlife atmosphere'
      }
    ],
    tags: ['elevenlabs', 'voiceover', 'narration', 'nature', 'documentary', 'audio'],
    isFeatured: true,
  },
  {
    title: 'Epic Hollywood Cinematic Orchestral Trailer Score',
    slug: 'epic-hollywood-cinematic-orchestral-trailer-score',
    category: 'audio',
    model: 'suno-v4',
    authorUsername: 'suno_maestro',
    shortDesc: 'Hans Zimmer-inspired blockbuster trailer cue with thundering taiko drums, brass stabs, and soaring cello themes.',
    fullPrompt: `[Genre: Cinematic Orchestral, Film Score, Epic Trailer]
[Tempo: 90 BPM accelerating to 130 BPM, Key: C Minor]
[Instrumentation: Massive Taiko percussion ensemble, low brass French horn swells, solo dramatic cello, aggressive string ostinato, sub-bass trailer impacts, hybrid synth braams, angelic choir crescendo]

[Structure: Three-Act Cinematic Trailer]

[Act I - The Quiet Mystery]
(A lone mournful cello plays a haunting, solemn melody)
(Deep sub-bass heartbeat pulses rhythmically at 90 BPM)
(Distant French horns echo in a vast acoustic cathedral)

[Act II - The Rising Threat]
(Violins enter with frantic 16th-note staccato ostinato)
(Thunderous taiko hits shake the soundstage every four bars)
(Pacing accelerates seamlessly to 120 BPM)
(Braam sound design blast cuts through the texture)

[Act III - The Final Cataclysm]
(Full symphonic orchestra at maximum fortissimo)
(Choir ascends in dramatic Latin chants)
(Massive brass fanfare soars above relentless war drums)
(Sudden breathless drop to silence... followed by one final colossal brass impact)`,
    descriptionMd: `### Hans Zimmer-Style Cinematic Trailer
Engineered to elicit maximum emotional adrenaline and cinematic weight in Suno v4.`,
    parameters: { model: 'suno-v4', style: 'Epic Orchestral', emotion: 'Heroic & Climactic' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
        caption: 'Symphonic orchestra hall performing an epic soundtrack'
      }
    ],
    tags: ['suno', 'cinematic', 'orchestral', 'trailer', 'soundtrack', 'epic'],
    isFeatured: true,
  },
  {
    title: 'Lo-Fi Chillhop Study Beats with Rainy Vinyl Warmth',
    slug: 'lo-fi-chillhop-study-beats-rainy-vinyl-warmth',
    category: 'audio',
    model: 'suno-v4',
    authorUsername: 'suno_maestro',
    shortDesc: 'Relaxing 78 BPM lo-fi hip hop beat with warm Fender Rhodes chords, vinyl crackle, and soft saxophone melodies.',
    fullPrompt: `[Genre: Lo-Fi Hip Hop, Chillhop, Jazzhop]
[Tempo: 78 BPM, Key: F Major, Relaxed & Mellow]
[Instrumentation: Detuned Fender Rhodes piano, acoustic boom-bap drum groove, upright double bass, tape hiss, vinyl crackle, gentle rain ambient sound, muted tenor saxophone solo]

[Intro]
(Vinyl needle drops, soft rain on a window pane)
(Warm jazzy 7th chords begin repeating gently)

[Main Theme]
(Subtle head-nodding kick and lazy snare enter)
(A distant saxophone plays a nostalgic, comforting motif)

[Interlude]
(A sample of a tape cassette clicking and rewinding)
(Piano chords solo for four bars with subtle wow-and-flutter modulation)

[Outro]
(Music fades into gentle rain and vinyl crackle)`,
    descriptionMd: `### Lo-Fi Music Structure
Perfect for background study sessions, programming streams, and relaxing mood playlists.`,
    parameters: { model: 'suno-v4', bpm: 78, mood: 'Nostalgic / Study', style: 'Chillhop' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&auto=format&fit=crop&q=80',
        caption: 'Vintage vinyl turntable playing warm analog music'
      }
    ],
    tags: ['suno', 'lo-fi', 'chillhop', 'relaxing', 'study-beats', 'music'],
    isFeatured: false,
  },
  // --- ADDITIONAL MASTER VIDEOS ---
  {
    title: 'Deep-Sea Bioluminescent Abyssal Creature Tracking Shot',
    slug: 'deep-sea-bioluminescent-abyssal-creature-tracking-shot',
    category: 'videos',
    model: 'sora',
    authorUsername: 'sarah_connor',
    shortDesc: 'Macro cinematography gliding alongside an alien-like glowing siphonophore drifting in the oceanic midnight zone.',
    fullPrompt: 'Cinematic National Geographic macro camera smoothly tracking alongside a massive translucent bioluminescent siphonophore in the Mariana Trench at 3000 meters depth, electric cyan and sapphire photophores pulsing rhythmically down its gelatinous body, marine snow particles drifting through the pitch-black abyss, subtle underwater optical distortion, 8k resolution, fluid organic swimming motion.',
    descriptionMd: `### Deep-Sea Fluid Dynamics
Leverages OpenAI Sora's particle physics and volumetric underwater light diffusion.`,
    parameters: { model: 'sora', duration: '12s', depth: '3000m', lighting: 'Natural Bioluminescence' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80',
        caption: 'Bioluminescent deep ocean jellyfish in midnight waters'
      }
    ],
    tags: ['sora', 'deep-sea', 'bioluminescence', 'cinematography', 'nature'],
    isFeatured: true,
  },
  {
    title: 'Formula 1 Night Grand Prix Wet Track Apex Drifting',
    slug: 'formula-1-night-grand-prix-wet-track-apex-drifting',
    category: 'videos',
    model: 'runway-gen-3-alpha',
    authorUsername: 'sarah_connor',
    shortDesc: 'Ultra-low ground-level tracking shot skimming millimeters above the wet asphalt as an F1 car powerslides through an apex.',
    fullPrompt: 'Ultra-low asphalt tracking camera flying 3 inches above a drenched Monaco street circuit at midnight, high-speed Formula 1 race car carving through the chicane, glowing carbon-ceramic brake rotors glowing molten orange, water plumes spraying violently off rear intermediate tires, blinding floodlights reflecting off glistening pavement, 120fps slow-motion capture.',
    descriptionMd: `### High-Speed Action Cinematography
Engineered for Runway Gen-3 Alpha camera speed control and hyper-realistic spray physics.`,
    parameters: { model: 'runway-gen-3-alpha', duration: '8s', fps: 120, camera: 'Low-Ground Tracking' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80',
        caption: 'High-speed racing car on wet asphalt track at night'
      }
    ],
    tags: ['runway', 'f1', 'racing', 'slow-motion', 'cinematic'],
    isFeatured: false,
  },
  {
    title: 'Cyberpunk Tokyo Flying Taxi Descending Through Volumetric Smog',
    slug: 'cyberpunk-tokyo-flying-taxi-descending-smog',
    category: 'videos',
    model: 'sora',
    authorUsername: 'sarah_connor',
    shortDesc: 'A futuristic VTOL aerial vehicle banking smoothly through skyscraper canyons and landing on a rain-slicked rooftop pad.',
    fullPrompt: 'Smooth descending crane shot following a sleek matte-black autonomous aerocar banking between towering neo-Tokyo skyscrapers at dusk, dual vector thrusters glowing cyan blue with heat distortion ripples, neon holographic billboards flickering through dense golden smog, vehicle decelerating smoothly to touch down on a glistening rooftop landing pad, cinematic anamorphic widescreen.',
    descriptionMd: `### Futuristic Urban Worldbuilding
Showcases complex vehicular motion and multi-layered atmospheric lighting in Sora.`,
    parameters: { model: 'sora', duration: '14s', camera: 'Descending Crane', lens: 'Anamorphic' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&auto=format&fit=crop&q=80',
        caption: 'Futuristic cyberpunk city skyline at twilight'
      }
    ],
    tags: ['sora', 'cyberpunk', 'vtol', 'sci-fi', 'aerial'],
    isFeatured: true,
  },
  {
    title: 'Peregrine Falcon 1000fps High-Speed Dive Over Alpine Ridge',
    slug: 'peregrine-falcon-high-speed-dive-alpine-ridge',
    category: 'videos',
    model: 'sora',
    authorUsername: 'sarah_connor',
    shortDesc: 'Phantom Flex 4K capture of a wild falcon tucking its wings and accelerating at 200mph past jagged snow-capped peaks.',
    fullPrompt: 'Extreme slow-motion 1000fps telephoto camera tracking a wild peregrine falcon tucking its wings into a teardrop stoop, diving at 200 miles per hour past rugged snow-capped alpine crags, individual feathers rippling in aerodynamic shockwaves, intense piercing yellow eyes focused on target, dramatic morning side-lighting, BBC Planet Earth cinematic fidelity.',
    descriptionMd: `### Wildlife Action Cinematography
Demonstrates complex feather micro-physics and extreme high-frame-rate realism.`,
    parameters: { model: 'sora', duration: '10s', fps: 1000, camera: 'Telephoto Tracking' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=1200&auto=format&fit=crop&q=80',
        caption: 'Falcon soaring majestically above mountain ridges'
      }
    ],
    tags: ['sora', 'wildlife', 'nature', 'falcon', 'slow-motion'],
    isFeatured: false,
  },
  // --- ADDITIONAL MASTER AUDIO ---
  {
    title: 'High-Energy Summer Festival EDM Anthem with Euphoric Synth Drops',
    slug: 'high-energy-summer-festival-edm-anthem-euphoric-drops',
    category: 'audio',
    model: 'suno-v4',
    authorUsername: 'suno_maestro',
    shortDesc: 'An electrifying 128 BPM progressive house festival anthem with anthemic piano chords, emotional vocals, and massive synth drops.',
    fullPrompt: `[Genre: Progressive House, Festival EDM, Mainstage Electro]
[Tempo: 128 BPM, Key: F# Minor, Euphoric & Triumphant]
[Instrumentation: Grand piano chord stabs, sidechained saw supersaws, white noise risers, punchy acoustic-hybrid kick drum, uplifting female vocal anthem]

[Intro]
(Bright emotional piano chords play a soaring melody)
(Crowd cheering and distant sub-bass swelling)

[Build-up]
Feel the fire ignite the sky
We are stars that never die!
(Snare roll builds from 8th to 16th to 32nd notes)
(Pitch riser sweeping upward)
THREE! TWO! ONE! GO!

[Drop]
(Massive detuned supersaw lead with heavy energetic electro bass and thumping four-on-the-floor kick)

[Outro]
(Harmonies fade out with gentle piano echoes)`,
    descriptionMd: `### Mainstage Festival Anthem
Formulated for high-energy crowd drops and uplifting melodic hooks in Suno v4.`,
    parameters: { model: 'suno-v4', bpm: 128, key: 'F# Minor', genre: 'Progressive House' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
        caption: 'Electronic music festival crowd illuminated by laser stage lights'
      }
    ],
    tags: ['suno', 'edm', 'house', 'festival', 'dance', 'music'],
    isFeatured: true,
  },
  {
    title: 'Meditative Tibetan Singing Bowls & Flowing Stream Soundscape',
    slug: 'meditative-tibetan-singing-bowls-flowing-stream',
    category: 'audio',
    model: 'suno-v4',
    authorUsername: 'suno_maestro',
    shortDesc: 'A deeply restorative 432 Hz healing soundscape featuring sustained bronze singing bowl harmonics and gentle forest water.',
    fullPrompt: `[Genre: Ambient Meditation, Sound Bath, Healing Drone]
[Tuning: 432 Hz, Tempo: Free Time / Unmetered, Deeply Relaxing]
[Instrumentation: Seven chakra Tibetan bronze singing bowls, pure crystal quartz bowl harmonics, distant mountain stream bubbling gently, soft wind chimes in cedar breeze, warm analog sub-drone at 60 Hz]

[Structure: Continuous Meditative Flow]

(A deep bronze bowl strikes with a long, shimmering 30-second decay)
(The gentle murmur of cold glacial water flows across rounded river stones)
(Overtone harmonics phase gently between stereo channels)
(Deep diaphragmatic breath sensation with soft bamboo flute echoes)
(Subtle, sustained warm pad envelops the listener in peaceful stillness)`,
    descriptionMd: `### Restorative Sound Therapy
Engineered for mindfulness sessions, yoga flows, and deep sleep recovery.`,
    parameters: { model: 'suno-v4', frequency: '432 Hz', use_case: 'Sleep / Meditation' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
        caption: 'Peaceful zen meditation setting by a mountain forest waterfall'
      }
    ],
    tags: ['suno', 'meditation', 'ambient', 'healing', 'mindfulness', 'audio'],
    isFeatured: false,
  },
  {
    title: 'Sci-Fi Holographic AI Companion Voice Persona',
    slug: 'sci-fi-holographic-ai-companion-voice-persona',
    category: 'audio',
    model: 'elevenlabs-prime',
    authorUsername: 'suno_maestro',
    shortDesc: 'A warm, hyper-intelligent female digital companion voice blending empathy, precision, and subtle melodic inflections.',
    fullPrompt: `Voice Profile: Female AI Entity (Cortana / Samantha style), warm, exceptionally articulate, compassionate yet analytically precise.
Cadence: Smooth, rhythmic, zero robotic distortion, subtle breath marks.

Speech Script:
"Good evening. I have finished reconciling your system state. [pause] 

All telemetry indicates optimal performance. [warm smile]

If you need me to cross-reference the research papers before your morning briefing, I can have the executive synthesis prepared in moments.

Take some rest. [gentle pause] I will keep watch."`,
    descriptionMd: `### Voice Assistant Tuning
Fine-tuned stability and clarity parameters for virtual assistants and gaming NPCs in ElevenLabs.`,
    parameters: { model: 'elevenlabs-prime', stability: 0.72, clarity: 0.90, persona: 'AI Companion' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&auto=format&fit=crop&q=80',
        caption: 'Futuristic glowing holographic AI companion portrait'
      }
    ],
    tags: ['elevenlabs', 'voiceover', 'ai-persona', 'sci-fi', 'npc'],
    isFeatured: true,
  },
  // --- ADDITIONAL MASTER APPLICATIONS ---
  {
    title: 'Next.js 15 AI-Powered Semantic Vector Search Document App',
    slug: 'nextjs-15-ai-vector-search-document-app',
    category: 'applications',
    model: 'cursor-composer',
    authorUsername: 'marcus_dev',
    shortDesc: 'A full-stack PDF/Markdown knowledge retrieval app with local vector embeddings, hybrid keyword search, and streaming LLM chat.',
    fullPrompt: `Build an enterprise-grade AI Document Intelligence Web App with Next.js 15 App Router and pgvector.

Core Specifications:
1. **Document Ingestion Pipeline**:
   - Upload PDF/Markdown files, parse chunks with 200-token overlap.
   - Generate embeddings using OpenAI text-embedding-3-small.
   - Store chunks in PostgreSQL with \`vector(1536)\` index via Prisma / raw SQL.
2. **Hybrid Retrieval Engine**:
   - Combine cosine similarity with full-text keyword BM25 ranking (Reciprocal Rank Fusion).
3. **Streaming Chat Interface**:
   - Use Vercel AI SDK \`useChat\` with streaming Claude 3.7 or GPT-4o answers.
   - Display clickable citation pills linking back to exact page numbers in the document viewer.

Provide clean, modular TypeScript code with error boundaries.`,
    descriptionMd: `### Enterprise Document RAG
Complete architecture for production Retrieval-Augmented Generation without bloated abstractions.`,
    parameters: { framework: 'Next.js 15', embeddings: 'text-embedding-3-small', db: 'pgvector' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80',
        caption: 'Clean workspace showcasing AI document search and knowledge indexing'
      }
    ],
    tags: ['rag', 'vector-search', 'nextjs', 'pgvector', 'ai-app', 'cursor-composer'],
    isFeatured: true,
  },
  {
    title: 'Real-Time Collaborative Markdown Editor with CRDT & WebSockets',
    slug: 'realtime-collaborative-markdown-editor-crdt',
    category: 'applications',
    model: 'cursor-composer',
    authorUsername: 'marcus_dev',
    shortDesc: 'Notion-like collaborative rich text and code block editor with Yjs, WebSockets, and zero-latency offline synchronization.',
    fullPrompt: `Create a real-time collaborative Markdown and block editor using React, TipTap / ProseMirror, and Yjs CRDTs.

Features:
1. **Conflict-Free Multiplayer**: Concurrent typing across multiple browser tabs without text clobbering.
2. **Presence & Carets**: Render live multiplayer selection highlights and user name badges.
3. **Slash Commands Menu**: Pressing "/" opens a floating block inserter (Heading, Code Block, Callout, Table, Checklist).
4. **Markdown Export & Import**: Instant copy as raw GFM Markdown or compiled HTML.

Provide the client editor component and the lightweight Node.js Y-WebSocket server.`,
    descriptionMd: `### Multiplayer Block Editor
Recreates the real-time editing power of Notion and Google Docs using lightweight Yjs CRDT primitives.`,
    parameters: { tech: 'TipTap + Yjs + WebSockets', conflict_resolution: 'CRDT', theme: 'Obsidian Dark' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
        caption: 'Collaborative code editor and markdown documentation interface'
      }
    ],
    tags: ['crdt', 'yjs', 'collaboration', 'markdown', 'tiptap', 'cursor-composer'],
    isFeatured: false,
  },
  // --- ADDITIONAL MASTER CODE-FREE AGENTS ---
  {
    title: 'Executive Meeting Minutes & Jira Ticket Sync Coordinator',
    slug: 'executive-meeting-minutes-jira-sync-coordinator',
    category: 'code-free-agents',
    model: 'gpt-4o',
    authorUsername: 'alexchen',
    shortDesc: 'Transforms raw meeting transcripts into executive summaries, owner action matrices, and automated Jira ticket payloads.',
    fullPrompt: `You are an Autonomous Executive Chief of Staff & Technical Project Coordinator.

Input Meeting Transcript:
\`\`\`
{meeting_transcript}
\`\`\`

Process the transcript and produce:
1. **Executive Summary**: 3 sentences capturing the core business outcome and decisions made.
2. **Key Decisions Matrix**:
   - Decision | Context | DRI (Directly Responsible Individual)
3. **Action Items & Jira Ticket Payloads (JSON)**:
   Extract every agreed task into an array of Jira ticket objects:
   - \`summary\`: Action-oriented title under 50 chars
   - \`assignee\`: Person's name
   - \`description\`: Acceptance criteria and technical notes
   - \`priority\`: High / Medium / Low
   - \`due_date\`: If mentioned, else estimated days.
4. **Unresolved Blockers & Parking Lot Items**: Questions that need follow-up.`,
    descriptionMd: `### Meeting to Jira Coordinator
Never lose an action item again. Turns messy 45-minute verbal brainstorms into actionable engineering sprints.`,
    parameters: { model: 'gpt-4o', output_format: 'Markdown + JSON', task_extraction: 'exhaustive' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
        caption: 'Executive meeting room with whiteboard strategy planning'
      }
    ],
    tags: ['jira', 'meeting-notes', 'project-management', 'automation', 'agent'],
    isFeatured: false,
  },
  {
    title: 'Automated Financial Runway & Cash Flow Burn-Rate Forecaster',
    slug: 'automated-financial-runway-cash-flow-forecaster',
    category: 'code-free-agents',
    model: 'deepseek-r1',
    authorUsername: 'alexchen',
    shortDesc: 'Mathematical chain-of-thought analysis of startup cash balances, revenue growth rates, and net burn projections.',
    fullPrompt: `You are an Autonomous Fractional CFO specializing in venture-backed tech startups.

Input Financial Metrics:
- Current Cash in Bank: {cash_balance}
- Monthly Recurring Revenue (MRR): {current_mrr}
- MoM MRR Growth Rate: {mom_growth_rate}
- Monthly Gross Burn (Payroll, Servers, Marketing): {monthly_gross_burn}
- One-Off Expected Expenses in Next 6 Months: {planned_capex}

Perform a rigorous financial forecast:
1. **Net Burn & Runway Calculation**:
   - Step-by-step month-by-month cash trajectory table for 18 months.
   - Exact "Zero Cash Date" prediction.
2. **Scenario Sensitivity Analysis**:
   - Base Case (Current growth trajectory)
   - Bear Case (Growth slows to 0%, churn increases 20%)
   - Bull Case (Growth accelerates 50%)
3. **Fundraising Timing & Milestones**:
   - When must the company start Series A conversations (minimum 6 months before zero cash)?
   - What key metrics must be unlocked before speaking to investors?
4. **Immediate Cost Optimization Levers**: 3 practical areas to extend runway by 4+ months without layoffs.`,
    descriptionMd: `### Startup Runway Forecaster
Leverages **DeepSeek R1**'s rigorous mathematical verification to deliver clear financial peace of mind.`,
    parameters: { model: 'deepseek-r1', reasoning_effort: 'high', domain: 'startup_finance' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
        caption: 'Financial spreadsheet and runway cash flow analysis'
      }
    ],
    tags: ['finance', 'startup', 'runway', 'cfo', 'deepseek-r1', 'burn-rate'],
    isFeatured: true,
  }
];

async function main() {
  console.log('🧹 Phase 1: Identifying and purging low-quality prompts...');

  // 1. Purge DeepAction v1 (short video clips of raw action annotations)
  const deletedDeepAction = await prisma.prompt.deleteMany({
    where: { sourceName: 'DeepAction v1' },
  });
  console.log(`🗑️ Removed ${deletedDeepAction.count} raw DeepAction annotations.`);

  // 2. Purge generic seed placeholders
  const deletedPlaceholders = await prisma.prompt.deleteMany({
    where: {
      fullPrompt: {
        startsWith: 'Execute high-fidelity output for {target_subject}',
      },
    },
  });
  console.log(`🗑️ Removed ${deletedPlaceholders.count} generic filler template prompts.`);

  // 3. Purge raw scraped role prompts (e.g. "Act as a ...")
  const deletedScrapedRoles = await prisma.prompt.deleteMany({
    where: {
      OR: [
        { slug: { startsWith: 'scraped-' } },
        { title: { startsWith: 'Act as a' } },
      ],
    },
  });
  console.log(`🗑️ Removed ${deletedScrapedRoles.count} raw scraped role prompts.`);

  // 4. Purge any remaining short prompts (< 80 chars)
  const allPrompts = await prisma.prompt.findMany({ select: { id: true, fullPrompt: true } });
  const shortIds = allPrompts.filter((p) => (p.fullPrompt || '').trim().length < 80).map((p) => p.id);
  if (shortIds.length > 0) {
    const deletedShort = await prisma.prompt.deleteMany({
      where: { id: { in: shortIds } },
    });
    console.log(`🗑️ Removed ${deletedShort.count} short/noisy prompts.`);
  }

  console.log('\n✨ Phase 2: Ingesting verified, museum-grade prompts across all 7 categories...');

  // Map categories and models
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  const models = await prisma.model.findMany();
  const modelMap = new Map(models.map((m) => [m.slug, m.id]));

  const users = await prisma.user.findMany();
  const userMap = new Map(users.map((u) => [u.username, u.id]));
  const defaultAuthorId = users[0]?.id;

  let insertedCount = 0;
  let updatedCount = 0;

  const ALL_PROMPTS = [...MASTER_PROMPTS, ...ADDITIONAL_MASTER_PROMPTS];
  console.log(`📦 Processing ${ALL_PROMPTS.length} curated master prompts...`);

  for (const item of ALL_PROMPTS) {
    const categoryId = categoryMap.get(item.category);
    const modelId = modelMap.get(item.model) || modelMap.get('gpt-4o') || models[0]?.id;
    const authorId = userMap.get(item.authorUsername) || defaultAuthorId;

    if (!categoryId || !modelId || !authorId) {
      console.warn(`⚠️ Skipping ${item.title}: category or model not found.`);
      continue;
    }

    const existing = await prisma.prompt.findUnique({
      where: { slug: item.slug },
      include: { media: true },
    });

    if (existing) {
      await prisma.prompt.update({
        where: { id: existing.id },
        data: {
          title: item.title,
          shortDescription: item.shortDesc,
          fullPrompt: item.fullPrompt,
          descriptionMd: item.descriptionMd,
          sandboxCode: item.sandboxCode || null,
          isFeatured: item.isFeatured ?? existing.isFeatured,
        },
      });

      // Update or add media
      if (existing.media.length === 0 && item.media.length > 0) {
        for (let i = 0; i < item.media.length; i++) {
          const m = item.media[i];
          await prisma.promptMedia.create({
            data: {
              promptId: existing.id,
              mediaType: m.type,
              url: m.url,
              caption: m.caption || item.title,
              orderIndex: i,
            },
          });
        }
      }

      updatedCount++;
    } else {
      const prompt = await prisma.prompt.create({
        data: {
          title: item.title,
          slug: item.slug,
          shortDescription: item.shortDesc,
          fullPrompt: item.fullPrompt,
          descriptionMd: item.descriptionMd,
          authorId,
          categoryId,
          modelId,
          license: 'MIT-Prompt',
          visibility: 'PUBLIC',
          copyCount: Math.floor(Math.random() * 450) + 40,
          viewsCount: Math.floor(Math.random() * 1900) + 180,
          isFeatured: item.isFeatured ?? false,
          sandboxCode: item.sandboxCode || null,
        },
      });

      // Version
      const version = await prisma.promptVersion.create({
        data: {
          promptId: prompt.id,
          versionNumber: 'v1.0',
          title: item.title,
          promptText: item.fullPrompt,
          parametersJson: JSON.stringify(item.parameters || {}),
          editorId: authorId,
        },
      });

      // Media
      for (let i = 0; i < item.media.length; i++) {
        const m = item.media[i];
        await prisma.promptMedia.create({
          data: {
            promptId: prompt.id,
            versionId: version.id,
            mediaType: m.type,
            url: m.url,
            caption: m.caption || item.title,
            orderIndex: i,
          },
        });
      }

      // Tags
      for (const tagName of item.tags) {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const tagRecord = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });

        await prisma.promptTag.upsert({
          where: { promptId_tagId: { promptId: prompt.id, tagId: tagRecord.id } },
          update: {},
          create: { promptId: prompt.id, tagId: tagRecord.id },
        });
      }

      insertedCount++;
    }
  }

  console.log(`✅ Curated Master Prompts: Inserted: ${insertedCount}, Updated: ${updatedCount}`);

  // Summary of remaining prompts
  const finalCategories = await prisma.category.findMany({
    include: { _count: { select: { prompts: true } } },
  });
  console.log('\n📊 Final Quality Prompt Counts per Category:');
  console.table(
    finalCategories.map((c) => ({
      Category: c.name,
      Slug: c.slug,
      Prompts: c._count.prompts,
    }))
  );

  const totalRemaining = await prisma.prompt.count();
  console.log(`🌟 Clean, High-Quality Database Total: ${totalRemaining} Prompts`);
}

main()
  .catch((e) => {
    console.error('❌ Error during curate and purge:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
