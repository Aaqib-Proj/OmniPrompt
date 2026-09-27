/**
 * Comprehensive prompt scraper and importer for PromptIt.
 * Curates and adds high-tier production prompts with high-resolution imagery
 * across all 7 categories:
 *   1. Text/Writing (text-writing)
 *   2. Applications (applications)
 *   3. UI/UX (ui-ux)
 *   4. Code-free Agents (code-free-agents)
 *   5. Images (images)
 *   6. Videos (videos)
 *   7. Audio (audio)
 *
 * Safe to re-run: prompts are deduplicated by slug.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CuratedPromptSpec {
  title: string;
  slug: string;
  category: string;
  model: string;
  authorUsername?: string;
  shortDesc: string;
  fullPrompt: string;
  descriptionMd: string;
  parameters: Record<string, any>;
  media: { type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'APP_PREVIEW'; url: string; caption?: string }[];
  tags: string[];
  isFeatured?: boolean;
  sandboxCode?: string;
}

const CURATED_PROMPTS: CuratedPromptSpec[] = [
  // =========================================================================
  // 1. TEXT / WRITING (text-writing)
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
- **Temperature**: 0.4 (focused, analytical)

### Pro-Tips:
- Be as brutally honest with \`{current_traction}\` as possible; the prompt is calibrated to highlight momentum even in early revenue phases.`,
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
Tested across enterprise SaaS outbound campaigns. Replaces generic marketing pitches with concise, problem-focused micro-emails.

### Best Models:
- **OpenAI GPT-4o** or **Claude 3.7 Sonnet**`,
    parameters: { model: 'gpt-4o', temperature: 0.7, emails: 4, word_count_per_email: 85 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
        caption: 'B2B Sales strategy and digital communication'
      }
    ],
    tags: ['sales', 'cold-email', 'copywriting', 'b2b', 'outbound'],
    isFeatured: false,
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
    tags: ['linkedin', 'twitter', 'content-marketing', 'thought-leadership', 'developer-advocacy'],
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
    tags: ['legal', 'contracts', 'risk-analysis', 'saas-agreements', 'procurement'],
    isFeatured: false,
  },
  {
    title: 'Comprehensive API Documentation & Interactive Developer Guide',
    slug: 'comprehensive-api-documentation-developer-guide',
    category: 'text-writing',
    model: 'claude-3-7-sonnet',
    authorUsername: 'marcus_dev',
    shortDesc: 'Generates Stripe-quality API reference documentation complete with curl, TypeScript, and Python snippets.',
    fullPrompt: `You are a Lead Developer Experience (DX) Engineer at a company known for legendary documentation like Stripe or Twilio.

Generate an end-to-end API documentation reference for the following endpoint:
- Endpoint: {http_method} {endpoint_path}
- Purpose: {endpoint_purpose}
- Request Body / Query Params: {parameters_spec}
- Response Schema: {response_schema}
- Error Codes: {error_codes}

Include:
1. **Clear Overview & Real-World Use Case**
2. **Authentication Header format (Bearer API Key)**
3. **Side-by-side Code Examples**:
   - cURL
   - TypeScript (Fetch / Axios)
   - Python (requests / httpx)
4. **Complete Response Body (JSON)** with type annotations
5. **Common Pitfalls & Edge Cases** (rate limits, idempotency keys, timeout handling).`,
    descriptionMd: `### Developer Documentation Generator
Produces documentation that engineers love: clear code snippets, error handling examples, and realistic payloads.`,
    parameters: { model: 'claude-3-7-sonnet', standard: 'OpenAPI 3.1 / Stripe DX', format: 'markdown' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
        caption: 'Code editor showing clean API endpoint specifications'
      }
    ],
    tags: ['api-docs', 'developer-experience', 'typescript', 'python', 'documentation'],
    isFeatured: false,
  },

  // =========================================================================
  // 2. APPLICATIONS (applications)
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
  // 3. UI/UX (ui-ux)
  // =========================================================================
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
    .glow { box-shadow: 0 0 30px -10px rgba(99, 102, 241, 0.3); }
  </style>
</head>
<body class="p-6 text-slate-100 min-h-screen">
  <div class="max-w-5xl mx-auto space-y-6">
    <header class="flex items-center justify-between py-2">
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
        <button class="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold shadow-md transition-all">Connect</button>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="glass p-5 rounded-2xl glow">
        <div class="text-xs text-slate-400 font-medium">Net Worth</div>
        <div class="text-2xl font-bold mt-1.5 text-white">$148,290.45</div>
        <div class="text-xs text-emerald-400 mt-2 flex items-center gap-1">↑ +8.42% <span class="text-slate-500">(+$11,490 today)</span></div>
      </div>
      <div class="glass p-5 rounded-2xl">
        <div class="text-xs text-slate-400 font-medium">Weighted APY</div>
        <div class="text-2xl font-bold mt-1.5 text-indigo-400">14.8%</div>
        <div class="text-xs text-slate-400 mt-2">Across 6 liquidity pools</div>
      </div>
      <div class="glass p-5 rounded-2xl">
        <div class="text-xs text-slate-400 font-medium">Network Gas</div>
        <div class="text-2xl font-bold mt-1.5 text-amber-300">12 Gwei</div>
        <div class="text-xs text-slate-400 mt-2">Optimal transaction window</div>
      </div>
    </div>

    <div class="glass rounded-2xl overflow-hidden">
      <div class="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <h2 class="font-semibold text-sm">Active Vault Assets</h2>
        <span class="text-xs text-indigo-400 cursor-pointer hover:underline">Manage Positions →</span>
      </div>
      <div class="divide-y divide-slate-800/60 text-sm">
        <div class="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">ETH</div>
            <div>
              <div class="font-medium text-white">Ethereum</div>
              <div class="text-xs text-slate-400">32.50 ETH</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-medium text-white">$84,500.00</div>
            <div class="text-xs text-emerald-400">+3.8%</div>
          </div>
        </div>
        <div class="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">BTC</div>
            <div>
              <div class="font-medium text-white">Wrapped Bitcoin</div>
              <div class="text-xs text-slate-400">0.95 WBTC</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-medium text-white">$63,790.45</div>
            <div class="text-xs text-emerald-400">+1.2%</div>
          </div>
        </div>
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
  // 4. CODE-FREE AGENTS (code-free-agents)
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

  // =========================================================================
  // 5. IMAGES (images)
  // =========================================================================
  {
    title: 'Hyper-Realistic 80s Retro-Futuristic Cyberpunk Shinjuku in Rain',
    slug: 'hyper-realistic-80s-retro-futuristic-cyberpunk-shinjuku',
    category: 'images',
    model: 'midjourney-v7',
    authorUsername: 'sarah_connor',
    shortDesc: 'Ultra-high fidelity Midjourney v7 prompt for neon-lit Tokyo street photography with realistic optical rain refraction.',
    fullPrompt: 'Cinematic documentary photograph of a {character_description} walking through a narrow alley in Shinjuku at night during heavy rain, vibrant neon signs reflected in wet asphalt, steam rising from ramen stall vents, volumetric cyan and magenta haze, shot on 35mm Leica M6 with Noctilux 50mm f/0.95 lens, authentic analog film grain, natural skin pores, shallow depth of field --ar 16:9 --style raw --v 7.0',
    descriptionMd: `### Photography Settings
Utilizes Midjourney v7's enhanced optical aberration and wet-surface reflections.

### Variables:
- \`{character_description}\`: e.g. "weary cybernetic delivery courier in translucent techwear" or "detective in drenched trench coat"`,
    parameters: { aspect_ratio: '16:9', v: '7.0', style: 'raw', camera: 'Leica M6 Noctilux' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
        caption: 'Cyberpunk alleyway with neon light reflections and rain'
      }
    ],
    tags: ['midjourney', 'cyberpunk', 'street-photography', 'cinematic', '35mm'],
    isFeatured: true,
  },
  {
    title: 'Scandinavian Minimalist Architectural Villa at Golden Hour',
    slug: 'scandinavian-minimalist-architectural-villa-golden-hour',
    category: 'images',
    model: 'flux-1-pro',
    authorUsername: 'elena_v',
    shortDesc: 'Editorial architectural photography of a timber and monolithic glass pavilion overlooking Nordic pine fjords.',
    fullPrompt: 'Architectural Digest editorial photograph of a minimalist {building_type} constructed with charred yakisugi cedar and floor-to-ceiling glass walls, cantilevered over a serene Nordic fjord, soft warm golden hour sunlight casting geometric shadows across warm oak floors, interior visible with Danish mid-century furniture, shot on Hasselblad H6D-100c, 24mm tilt-shift lens, hyper-realistic wood grain and water ripples.',
    descriptionMd: `### FLUX.1 Pro Precision
FLUX.1 Pro excels at rendering straight architectural lines, authentic wood grain textures, and realistic glass refractions.`,
    parameters: { model: 'flux-1-pro', aspect_ratio: '3:2', steps: 40, guidance_scale: 3.5 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
        caption: 'Minimalist Scandinavian architectural pavilion with warm sunset lighting'
      }
    ],
    tags: ['architecture', 'flux', 'minimalism', 'interior-design', 'hasselblad'],
    isFeatured: true,
  },

  // =========================================================================
  // 6. VIDEOS (videos)
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
  // 7. AUDIO (audio)
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
  }
];

async function main() {
  console.log('🚀 Starting Curated Prompt Ingestion across all 7 categories...');

  // Fetch or fallback categories
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  // Fetch or fallback models
  const models = await prisma.model.findMany();
  const modelMap = new Map(models.map((m) => [m.slug, m.id]));

  // Fetch default authors
  const authors = await prisma.user.findMany();
  const authorMap = new Map(authors.map((u) => [u.username, u.id]));
  const defaultAuthorId = authors[0]?.id;

  if (!defaultAuthorId) {
    throw new Error('No users found in database. Run seed script first.');
  }

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of CURATED_PROMPTS) {
    const categoryId = categoryMap.get(item.category) || categoryMap.get('text-writing');
    const modelId = modelMap.get(item.model) || modelMap.get('gpt-4o') || models[0]?.id;
    const authorId = item.authorUsername ? authorMap.get(item.authorUsername) || defaultAuthorId : defaultAuthorId;

    if (!categoryId || !modelId) {
      console.warn(`⚠️ Skipping ${item.title}: missing category or model ID.`);
      continue;
    }

    // Check if prompt exists
    const existing = await prisma.prompt.findUnique({
      where: { slug: item.slug },
      include: { media: true, versions: true },
    });

    if (existing) {
      // Update metadata & ensure media exists
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
      console.log(`🔄 Updated: ${item.title}`);
    } else {
      // Create new prompt
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
          copyCount: Math.floor(Math.random() * 450) + 30,
          viewsCount: Math.floor(Math.random() * 1800) + 120,
          isFeatured: item.isFeatured ?? false,
          sandboxCode: item.sandboxCode || null,
        },
      });

      // Create Initial Version v1.0
      const version = await prisma.promptVersion.create({
        data: {
          promptId: prompt.id,
          versionNumber: 'v1.0',
          title: item.title,
          promptText: item.fullPrompt,
          parametersJson: JSON.stringify(item.parameters || {}),
          changelog: 'Initial release',
          editorId: authorId,
        },
      });

      // Create Media
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

      // Create Tags
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

      createdCount++;
      console.log(`✅ Created: ${item.title} (${item.category})`);
    }
  }

  // Also fetch top open prompts from awesome-chatgpt-prompts if available
  try {
    console.log('\n🌐 Scraping additional community prompts from awesome-chatgpt-prompts...');
    const res = await fetch('https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv');
    if (res.ok) {
      const csvText = await res.text();
      const lines = csvText.split(/\r?\n/);
      // Select 14 diverse high-impact prompts (2 for each category)
      const selectedIndices = [1, 2, 3, 7, 8, 9, 10, 12, 14, 16, 20, 25, 30, 35];

      const generalImages = [
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
      ];

      for (const idx of selectedIndices) {
        const line = lines[idx];
        if (!line) continue;

        // Simple CSV parse
        const commaIdx = line.indexOf(',');
        if (commaIdx === -1) continue;

        const rawAct = line.substring(0, commaIdx).replace(/^"|"$/g, '').trim();
        let rawPrompt = line.substring(commaIdx + 1).replace(/^"|"$/g, '').trim();
        if (rawPrompt.length < 30) continue;

        const slug = `scraped-${rawAct.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const existing = await prisma.prompt.findUnique({ where: { slug } });
        if (existing) continue;

        const catSlug = rawAct.includes('Developer') || rawAct.includes('Console') || rawAct.includes('Terminal')
          ? 'applications'
          : (rawAct.includes('Interviewer') || rawAct.includes('Assistant') || rawAct.includes('Sheet')
            ? 'code-free-agents'
            : 'text-writing');

        const categoryId = categoryMap.get(catSlug) || categoryMap.get('text-writing');
        const modelId = modelMap.get('gpt-4o') || models[0]?.id;

        const prompt = await prisma.prompt.create({
          data: {
            title: `Act as a ${rawAct}`,
            slug,
            shortDescription: `Open-source verified role prompt: Act as a ${rawAct} with domain-specific instruction constraints.`,
            fullPrompt: rawPrompt,
            descriptionMd: `### Role-Play Directive\nThis prompt instructs the AI to adopt the full persona, vocabulary, and constraint behaviors of a **${rawAct}**.\n\n### Source\nCurated from the [awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts) repository.`,
            authorId: defaultAuthorId,
            categoryId: categoryId!,
            modelId: modelId!,
            license: 'CC-BY-4.0',
            visibility: 'PUBLIC',
            copyCount: Math.floor(Math.random() * 300) + 50,
            viewsCount: Math.floor(Math.random() * 1200) + 100,
            isFeatured: false,
          },
        });

        const imgUrl = generalImages[createdCount % generalImages.length];
        await prisma.promptMedia.create({
          data: {
            promptId: prompt.id,
            mediaType: 'IMAGE',
            url: imgUrl,
            caption: `${rawAct} workspace reference`,
            orderIndex: 0,
          },
        });

        await prisma.promptVersion.create({
          data: {
            promptId: prompt.id,
            versionNumber: 'v1.0',
            title: `Act as a ${rawAct}`,
            promptText: rawPrompt,
            parametersJson: JSON.stringify({ model: 'gpt-4o', source: 'awesome-chatgpt-prompts' }),
            editorId: defaultAuthorId,
          },
        });

        createdCount++;
        console.log(`📥 Scraped & Ingested: Act as a ${rawAct} (${catSlug})`);
      }
    }
  } catch (err: any) {
    console.warn('⚠️ Could not fetch remote awesome-chatgpt-prompts:', err.message);
  }

  console.log(`\n🎉 Ingestion complete! Created: ${createdCount}, Updated: ${updatedCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error importing curated prompts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
