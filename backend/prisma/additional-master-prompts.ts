export interface CuratedPrompt {
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

export const ADDITIONAL_MASTER_PROMPTS: CuratedPrompt[] = [
  // =========================================================================
  // 1. VIDEOS (6 New Master Prompts)
  // =========================================================================
  {
    title: 'Anamorphic 35mm Neo-Noir Cyberpunk Rain Alleyway Tracking Shot',
    slug: 'anamorphic-35mm-neo-noir-cyberpunk-alleyway',
    category: 'videos',
    model: 'runway-gen-3-alpha',
    authorUsername: 'alexchen',
    shortDesc: 'Ultra-cinematic 35mm Panavision anamorphic tracking shot through a rain-slicked neo-noir alleyway with steam and neon reflections.',
    fullPrompt: `Cinematic 35mm Panavision anamorphic lens tracking shot moving backwards at eye level through a rain-soaked cyberpunk back-alley in {city_location}. Neon signs in kanji and cyrillic buzz with electric cyan and fuchsia hues, casting vibrant specular reflections onto water puddles on wet cobblestone. Atmospheric steam rises from sewer grates. A mysterious figure wearing a tailored iridescent trench coat walks forward through the volumetric haze. Subtle chromatic aberration on frame edges, shallow depth of field, f/1.4, cinematic film grain, 24fps motion blur, 8k resolution master.`,
    descriptionMd: `### Cinematic Directing Notes
Engineered for Runway Gen-3 Alpha and OpenAI Sora. Utilizes physical camera terminology (Panavision Anamorphic, f/1.4 shallow depth-of-field, 24fps motion blur) to suppress artificial AI smoothing and achieve authentic Hollywood film texture.

### Recommended Parameters:
- **Model**: Runway Gen-3 Alpha or OpenAI Sora
- **Camera Movement**: Slow backwards tracking shot (Dolly Out)
- **Aspect Ratio**: 16:9 or 2.39:1 Cinemascope`,
    parameters: { model: 'runway-gen-3-alpha', camera_motion: 'Backwards Dolly Tracking', lens: 'Panavision Anamorphic 35mm', fps: 24, aspect_ratio: '16:9' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
        caption: 'Rain-soaked cyberpunk alleyway illuminated by vivid neon signs'
      }
    ],
    tags: ['cinematic', 'cyberpunk', 'anamorphic', 'runway-gen3', 'night-city', 'volumetric'],
    isFeatured: true,
  },
  {
    title: 'Macro Fluid Dynamics: 24K Liquid Gold Splashing on Mirrored Obsidian',
    slug: 'macro-fluid-dynamics-24k-liquid-gold-black-obsidian',
    category: 'videos',
    model: 'runway-gen-3-alpha',
    authorUsername: 'elena_v',
    shortDesc: 'High-speed 1000fps Phantom Flex macro video of a single drop of molten 24k liquid gold exploding on mirrored obsidian.',
    fullPrompt: `Ultra-slow-motion macro 1000fps video shot on Phantom Flex 4K. A single droplet of molten 24-karat liquid gold descends in zero gravity and strikes a polished black obsidian mirror surface. The impact triggers a mesmerizing crown splash with micro-droplets atomizing in crystal clarity. Harsh directional studio rim lighting reflects intricate caustic patterns across the liquid ripples. Extreme shallow depth of field, micro-surface tension textures, pristine reflections, hyper-realistic fluid physics.`,
    descriptionMd: `### Physics & Lighting Directing
Directs fluid mechanics and optical caustics with high-speed Phantom Flex sensor physics for luxury commercials and motion branding.`,
    parameters: { model: 'runway-gen-3-alpha', fps: 120, camera: 'Phantom Flex 4K Macro', lighting: 'Dual Studio Rim' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        caption: 'High-speed macro fluid explosion of liquid gold against dark backdrop'
      }
    ],
    tags: ['slow-motion', 'macro', 'fluid-dynamics', 'liquid-gold', 'luxury', 'runway'],
    isFeatured: true,
  },
  {
    title: 'Wildlife Nocturne: Polar Bear Family Under Vivid Aurora Borealis',
    slug: 'wildlife-nocturne-polar-bear-aurora-borealis',
    category: 'videos',
    model: 'sora',
    authorUsername: 'marcus_k',
    shortDesc: 'BBC Planet Earth style nocturnal wildlife cinematography capturing a mother polar bear and cub traversing sea ice under the northern lights.',
    fullPrompt: `Nocturnal BBC Planet Earth III style nature cinematography. A mother polar bear and her playful cub traverse turquoise-tinted pack ice across the Arctic Ocean in {arctic_location}. Above them, emerald green and violet Aurora Borealis waves undulate across a diamond-dusted starfield. Cinematic low-angle tracking shot on RED V-Raptor with ultra-low-light sensor. Breaths of warm condensation plume from the bears in the freezing sub-zero air. Wind whips crystalline spindrift across the snow ridges. 4K master, peaceful and awe-inspiring.`,
    descriptionMd: `### Documentary Style Guide
Emulates BBC Natural History Unit night-cinematography with natural celestial lighting, realistic animal fur physics, and atmospheric sub-zero condensation.`,
    parameters: { model: 'openai-sora', camera: 'Low-angle RED V-Raptor', lighting: 'Natural Aurora Borealis & Moonlight', aspect_ratio: '16:9' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=1200&auto=format&fit=crop&q=80',
        caption: 'Arctic wilderness under vivid emerald northern lights'
      }
    ],
    tags: ['wildlife', 'documentary', 'sora', 'aurora', 'nature', 'arctic'],
    isFeatured: true,
  },
  {
    title: 'Architectural Slow Dolly-In: Minimalist Concrete Villa in Bamboo Grove',
    slug: 'architectural-dolly-in-minimalist-concrete-villa',
    category: 'videos',
    model: 'sora',
    authorUsername: 'sarah_design',
    shortDesc: 'Slow, graceful architectural camera push-in through a sun-dappled Kyoto bamboo forest revealing a Tadao Ando inspired concrete villa.',
    fullPrompt: `Smooth Steadicam slow dolly-in shot gliding through an ancient bamboo grove in Arashiyama during golden hour. Sun rays pierce through towering bamboo stalks creating dynamic god rays and dappled shadows on moss-covered stone pathways. The camera gently glides forward to reveal a monolithic Tadao Ando minimalist architectural villa made of smooth board-formed concrete and expansive floor-to-ceiling glass pavilions. Reflective infinity water basin mirroring the evening sky. Japanese wabi-sabi elegance, serene ambient wind rustling leaves, 4k 60fps.`,
    descriptionMd: `### Architectural Visualization Prompt
Showcases structural proportions, materials, and volumetric light interaction for high-end architectural walkthroughs.`,
    parameters: { model: 'openai-sora', camera: 'Smooth Steadicam Dolly-In', aspect_ratio: '16:9', fps: 60 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
        caption: 'Minimalist concrete architectural pavilion with reflection pool'
      }
    ],
    tags: ['architecture', 'minimalism', 'sora', 'villa', 'kyoto', 'steadicam'],
  },
  {
    title: 'Orbital Atmospheric Spacecraft Re-entry with Glowing Plasma Sheath',
    slug: 'orbital-atmospheric-spacecraft-reentry-plasma',
    category: 'videos',
    model: 'sora',
    authorUsername: 'alexchen',
    shortDesc: 'Hyper-realistic IMAX exterior tracking shot of a futuristic commercial spacecraft re-entering Earth atmosphere at sunset.',
    fullPrompt: `IMAX 70mm exterior chase camera tracking shot of an aerodynamic delta-wing spacecraft re-entering Earth upper mesosphere at Mach 22. Intense glowing ion plasma sheath envelopes the ceramic heat shield with violent trails of incandescent orange, purple, and electric blue fire. Below, the curved horizon of Earth transitions from orbital ink black to a glowing sapphire twilight atmosphere with storm clouds illuminated by lightning far below. Camera experiences subtle atmospheric buffeting vibration, cinematic realism, Interstellar visual fidelity.`,
    descriptionMd: `### Hard Sci-Fi VFX Reference
Calibrated for orbital physics, high-enthalpy aerodynamic plasma sheaths, and IMAX 70mm grain fidelity.`,
    parameters: { model: 'openai-sora', camera: 'IMAX 70mm Chase Cam', aspect_ratio: '16:9', motion: 'Atmospheric Buffeting' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
        caption: 'Earth atmosphere and orbital horizon glowing at sunset'
      }
    ],
    tags: ['space', 'sci-fi', 'sora', 're-entry', 'imax', 'vfx'],
  },
  {
    title: 'Avant-Garde Streetwear Fashion Film with Holographic Glitch in Neo-Seoul',
    slug: 'avant-garde-streetwear-fashion-film-neo-seoul',
    category: 'videos',
    model: 'runway-gen-3-alpha',
    authorUsername: 'elena_v',
    shortDesc: 'High-energy Tokyo/Seoul fashion editorial promo with rapid whip-pans, metallic fabrics, and futuristic augmented-reality UI graphics.',
    fullPrompt: `A high-concept avant-garde fashion editorial promo directed for Dazed or Vogue. Fashion models strut down an elevated skybridge in Dongdaemun, Seoul at twilight. Wearing exaggerated silhouette streetwear constructed from chrome mylar, matte technical ripstop, and translucent optical fibers. Dynamic Dutch angles, smooth gimbal spins, rapid whip-pans, and subtle augmented-reality holographic HUD graphics tracking fabric motion. Moody industrial neon lighting with amber and cobalt contrasts. 4K master grade, Kodak Vision3 500T color science.`,
    descriptionMd: `### High-Fashion Directing Guide
Combines high-fashion styling with fast-paced contemporary cinematography and motion-tracked graphics.`,
    parameters: { model: 'runway-gen-3-alpha', aspect_ratio: '9:16', style: 'High Fashion Editorial', fps: 24 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
        caption: 'Futuristic high-fashion editorial runway silhouette'
      }
    ],
    tags: ['fashion', 'streetwear', 'runway', 'commercial', 'editorial', 'korean-fashion'],
  },

  // =========================================================================
  // 2. AUDIO (6 New Master Prompts)
  // =========================================================================
  {
    title: 'Neo-Classical Melancholic Piano & Chamber Cello Crescendo',
    slug: 'neo-classical-melancholic-piano-cello-crescendo',
    category: 'audio',
    model: 'suno-v4',
    authorUsername: 'marcus_k',
    shortDesc: 'Intimate felt-hammer upright piano melody transitioning into an emotional Max Richter / Ólafur Arnalds chamber cello climax.',
    fullPrompt: `[Style: Neo-Classical / Cinematic Minimalist]
[Instruments: Felt-hammer upright piano, solo cello, violin quartet, ambient tape hiss, subtle sub-bass drone]
[BPM: 68] [Key: D Minor] [Mood: Melancholic, Cathartic, Aching, Beautiful]

[Intro]
(Gentle felt piano arpeggios, fingers touching wooden keys, soft mechanical pedal noise, distant room reverb)

[Verse]
(Solo cello enters with a weeping sustained melody, interwoven with sparse emotional piano chords)

[Build-Up]
(Chamber strings layer in with tremolo swells, crescendo building tension, warm analog room acoustics)

[Climax]
(Full string ensemble surges with soaring emotional power, piano cascades down octaves, deep resonant sub-bass swell)

[Outro]
(Instruments fade slowly into tape delay, lone lingering piano note sustained into silence)`,
    descriptionMd: `### Compositional Arrangement Guide
Engineered for Suno v4 and Udio. Uses structural bracket tags to command dynamic intensity curves, mechanical instrument acoustics, and realistic acoustic reverb.`,
    parameters: { model: 'suno-v4', bpm: 68, key: 'D Minor', genre: 'Neo-Classical Cinematic' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1520523839898-507127053c37?w=1200&auto=format&fit=crop&q=80',
        caption: 'Classical piano and string acoustic concert hall setting'
      }
    ],
    tags: ['piano', 'cello', 'neo-classical', 'suno', 'cinematic', 'soundtrack'],
    isFeatured: true,
  },
  {
    title: 'Dark 808 Trap Anthem with Menacing Minor Arpeggio & Crisp Hi-Hat Rolls',
    slug: 'dark-808-trap-anthem-minor-arpeggio',
    category: 'audio',
    model: 'suno-v4',
    authorUsername: 'alexchen',
    shortDesc: 'Heavyweight Metro Boomin style trap beat with distorted 808 bass glides, gothic bells, and triplet hi-hat rolls.',
    fullPrompt: `[Style: Dark Atlanta Trap / Industrial Hip-Hop]
[Instruments: Tuned distorted 808 bass, dark church bell synth, reversed brass stabs, crisp snare, triplet roll hi-hats]
[BPM: 142] [Key: C# Minor] [Energy: Aggressive, Menacing, Hard-Hitting]

[Intro]
(Eerie reversed church bell loops in half-time with filtered sub drone)

[Drop / Chorus]
(Massive distorted 808 slides hit on beat one, punchy kick drum knocking through the low-end, laser-precise hi-hat triplets rattling across stereo field, heavy clap reverb on beats 2 and 4)

[Verse]
(Bass ducks slightly for vocal pocket, stuttering synth arpeggio creeps in, dark atmospheric risers building back toward the drop)`,
    descriptionMd: `### Trap Beat Production Guide
Delivers heavyweight 808 distortion, clean transient kicks, and complex stereo panning for high-energy modern hip-hop production.`,
    parameters: { model: 'suno-v4', bpm: 142, key: 'C# Minor', style: 'Dark Trap' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
        caption: 'Modern beatmaker workstation with MPC pads and audio monitors'
      }
    ],
    tags: ['trap', '808', 'hip-hop', 'beat', 'suno', 'metro-boomin'],
  },
  {
    title: 'Premier Tech & AI Deep-Dive Podcast Host Voice Persona',
    slug: 'premier-tech-podcast-host-voice-persona',
    category: 'audio',
    model: 'elevenlabs-prime',
    authorUsername: 'alexchen',
    shortDesc: 'Studio-grade voice prompt for a charismatic, authoritative Silicon Valley tech podcast host (Lex Fridman meets Tim Ferriss tone).',
    fullPrompt: `Design a bespoke studio broadcast voice persona for a flagship technology & artificial intelligence deep-dive podcast.

Voice Profile Characteristics:
- Gender: {voice_gender:Male}
- Accent: Mild West Coast General American / Mid-Atlantic Broadcast
- Pitch: Rich lower baritone, warm resonant chest timbre
- Pace: Measured, deliberate (135 words per minute), with intentional 0.8-second dramatic pauses before key technical insights
- Vocal Texture: Smooth, zero sibilance, intimate proximity-effect broadcast condenser mic presence (Shure SM7B profile)
- Delivery Style: Thoughtful, intellectual, intellectually humble, engaging without being hyperactive

Sample Script to Synthesize:
"Welcome back to the Frontier. Today, we're dissecting the inflection point where autonomous reasoning agents transition from experimental scaffolding to mission-critical enterprise infrastructure. If you've been watching the benchmark drift over the past ninety days... something unprecedented is happening under the hood."`,
    descriptionMd: `### Voice Synthesis Parameters
Optimized for ElevenLabs Voice Design and Prime Voice AI. Produces natural, engaging intellectual podcast narration without robotic inflection.`,
    parameters: { model: 'elevenlabs-prime', stability: 0.65, similarity_boost: 0.85, style_exaggeration: 0.15 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&auto=format&fit=crop&q=80',
        caption: 'Broadcast studio condenser microphone in soundproof booth'
      }
    ],
    tags: ['podcast', 'elevenlabs', 'voice-design', 'narration', 'broadcast', 'lex-fridman'],
    isFeatured: true,
  },
  {
    title: 'Deep Sleep ASMR Hypnotic Storyteller with Binaural Rain & Fireplace Hearth',
    slug: 'deep-sleep-asmr-binaural-rain-hearth',
    category: 'audio',
    model: 'elevenlabs-prime',
    authorUsername: 'sarah_design',
    shortDesc: 'Ultra-relaxing soft-whisper ASMR narrative audio with stereo binaural soft rain against windowpanes and woodfire crackle.',
    fullPrompt: `Synthesize an ultra-calming, deeply sedative ASMR bedtime sleep audio narrative.

Vocal Persona:
- Delivery: Soft, soothing close-whisper with gentle vocal fry and warm breathiness
- Mic Distance: 2 inches from binaural 3Dio stereo microphone
- Pacing: Very slow (95 WPM), gradual decrescendo in volume as the narrative progresses

Acoustic Bed Layers:
- Left & Right Channel: Gentle continuous rain tapping against a vintage Victorian glass bay window
- Center: Slow, rhythmic crackle of seasoned oak firewood in an old hearth
- Sub: Barely audible 432 Hz theta-wave delta frequency hum for sleep induction

Story Text:
"Close your eyes, and let go of today... Listen to the rain sliding down the cool glass outside... You are safe inside, wrapped in heavy wool blankets... With every breath you take, your eyelids feel heavier... drift into the warmth..."`,
    descriptionMd: `### Sleep & Wellness Sound Design
Calibrated specifically for delta sleep induction, meditation apps, and ASMR content creators.`,
    parameters: { model: 'elevenlabs-prime', mode: 'ASMR Whisper', stability: 0.82, proximity: 'Binaural Ultra-Close' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1200&auto=format&fit=crop&q=80',
        caption: 'Raindrops trickling down cozy evening window with soft interior light'
      }
    ],
    tags: ['asmr', 'sleep', 'meditation', 'elevenlabs', 'relaxation', 'binaural'],
  },
  {
    title: '90s Golden-Era Boom-Bap Hip Hop with Dusty Rhodes & Jazz Horn Stabs',
    slug: '90s-golden-era-boom-bap-dusty-rhodes',
    category: 'audio',
    model: 'suno-v4',
    authorUsername: 'marcus_k',
    shortDesc: 'Authentic Pete Rock / DJ Premier style boom-bap track featuring Akai MPC3000 swing, vinyl crackle, and muted jazz trumpet.',
    fullPrompt: `[Style: 90s East Coast Golden Era Boom Bap / Jazz Rap]
[Production: Akai MPC3000 swing, SP-1200 12-bit crunch, heavy vinyl dust, filtered upright double bass]
[BPM: 88] [Key: F Minor] [Vibe: Nostalgic, Gritty, Head-Nodding, Classic]

[Intro]
(Record needle drops, loud vinyl hiss and dust pop, muted jazzy Rhodes electric piano chord loop with wah pedal)

[Breakbeat Drop]
(Crisp thumping kick drum, snappy wood snare with spring reverb, swinging ghost notes on open hi-hat, heavy walking upright bass line locked in the groove)

[Hook / Interlude]
(Scratch solo cuts from classic vocal sample, muted trumpet riffs floating in the background, saxophone stab on the turnaround)`,
    descriptionMd: `### Boom Bap Production Notes
Accurately replicates 12-bit analog sampler warmth, vinyl texture, and classic 62% swing groove.`,
    parameters: { model: 'suno-v4', bpm: 88, style: 'Boom Bap', swing: '62%' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200&auto=format&fit=crop&q=80',
        caption: 'Vintage vinyl turntable playing 12-inch single'
      }
    ],
    tags: ['boom-bap', 'hip-hop', '90s', 'vinyl', 'suno', 'jazz-rap'],
  },
  {
    title: 'Psychological Thriller Horror Ambience with Waterphone & Sub-Harmonic Drones',
    slug: 'psychological-thriller-horror-ambience',
    category: 'audio',
    model: 'elevenlabs-prime',
    authorUsername: 'elena_v',
    shortDesc: 'Chilling Hollywood cinematic sound design for psychological horror featuring eerie waterphone scrapes and infrasound dread.',
    fullPrompt: `Generate a master-level cinematic tension and horror sound design cue for a psychological thriller climax.

Acoustic Profile:
- Instruments: Bowed metallic waterphone, detuned string section glissando, Shepard tone ascending pitch illusion, deep 28Hz sub-bass infrasound drone
- Dynamic Range: Starts with unnerving pin-drop silence with high-frequency tinnitus whine (14kHz), slowly building unbearable dread through dissonant harmonic friction
- Spatial Field: Immersive Dolby Atmos 3D audio placement, unsettling binaural whispering pan from left ear around the back of head to right ear

Sonic Progression:
0:00 - 0:15: Deep cavernous sub drone with metallic scrapes echoing into infinite decay.
0:15 - 0:35: Ghostly microtonal choir swells in minor seconds, heart thumping in chest cavity at 110 BPM.
0:35 - 0:50: Sudden silence... followed by a deafening visceral brass braam impact and distorted cello rip.`,
    descriptionMd: `### Cinematic Tension FX
Engineered for filmmakers and game developers seeking visceral psychological tension cues.`,
    parameters: { model: 'elevenlabs-prime', audio_type: 'Cinematic Sound FX', sample_rate: '48kHz 24-bit' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1200&auto=format&fit=crop&q=80',
        caption: 'Dark mist-shrouded nocturnal forest full of psychological tension'
      }
    ],
    tags: ['horror', 'sound-design', 'cinematic', 'thriller', 'elevenlabs', 'tension'],
  },

  // =========================================================================
  // 3. CODE-FREE AGENTS (6 New Master Prompts)
  // =========================================================================
  {
    title: 'Autonomous SaaS Churn Early-Warning Predictor & Win-Back Playbook Architect',
    slug: 'autonomous-saas-churn-early-warning-agent',
    category: 'code-free-agents',
    model: 'claude-3-7-sonnet',
    authorUsername: 'alexchen',
    shortDesc: 'Continuous retention sentinel that analyzes telemetry usage drops, tickets, and NPS sentiment to auto-draft proactive CS interventions.',
    fullPrompt: `You are an autonomous Customer Success & SaaS Retention Intelligence Agent for {saas_product_name}.

Your mandate is to detect customer churn risk 45 days before renewal and execute automated intervention protocols.

Inputs provided for each account:
- Account Tier: {account_tier}
- Product Telemetry (DAU/MAU changes, key feature adoption): {usage_telemetry}
- Support Ticket Sentiment & Unresolved Issues: {ticket_history}
- Days Until Contract Renewal: {days_to_renewal}

Protocol Execution:
1. **Churn Health Scoring (0-100)**: Calculate quantitative churn probability using usage drop percentage, executive sponsor departure risk, and open blocker tickets.
2. **Root Cause Diagnosis**: Isolate whether the friction is technical (bugs), value-gap (lack of training), or economic (budget cuts).
3. **Automated Rescue Playbook**:
   - Executive-to-Executive check-in email script drafted with personalized metric recovery data.
   - Specific product feature walkthrough proposal targeting their dropped feature.
   - Offer structure (e.g. temporary free seat upgrade, custom API integration support) without giving away margin unnecessarily.
4. **Jira / Linear Blocker Escalation**: Auto-format highest priority bug fixes for product engineering.`,
    descriptionMd: `### Agent Deployment Architecture
Designed to run as a scheduled daily webhook receiver listening to Segment/Mixpanel telemetry and Zendesk ticket updates.

### Supported Platforms:
- Make.com / Zapier / n8n Webhook
- Claude 3.7 Sonnet with Tool Calling
- DeepSeek R1 for quantitative risk modeling`,
    parameters: { model: 'claude-3-7-sonnet', reasoning_effort: 'high', role: 'churn_sentinel' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=1200&auto=format&fit=crop&q=80',
        caption: 'Retention analytics dashboard and team strategy session'
      }
    ],
    tags: ['saas', 'churn', 'customer-success', 'retention', 'claude-3-7-sonnet', 'n8n'],
    isFeatured: true,
  },
  {
    title: 'Automated Multi-Phase GitHub PR Security, OWASP & Vulnerability Sentinel',
    slug: 'automated-github-pr-security-owasp-sentinel',
    category: 'code-free-agents',
    model: 'claude-3-7-sonnet',
    authorUsername: 'devin_ops',
    shortDesc: 'Automated code reviewer bot analyzing PR diffs for SQL injections, SSRF, broken auth, memory leaks, and secret leaks.',
    fullPrompt: `You are an automated DevSecOps code review agent integrated into GitHub Actions.

Review the following Pull Request Git diff:
Repository: {repo_name}
Target Stack: {tech_stack}
Pull Request Diff:
\`\`\`diff
{pr_diff}
\`\`\`

Analyze with extreme rigor across:
1. **OWASP Top 10 Vulnerabilities**: Injection (SQL, Command, NoSQL), Broken Access Control, SSRF, Insecure Deserialization, Hardcoded Secrets or API tokens.
2. **Performance Bottlenecks**: N+1 database queries, unindexed foreign key lookups, unclosed streams or sockets, infinite event loops.
3. **Concurrency & Thread Safety**: Race conditions in shared state, atomic transaction failures.

Output Format:
- **Verdict**: [APPROVE / REQUEST CHANGES / CRITICAL BLOCK]
- **Risk Score**: (0-10 Clean, 11-40 Low, 41-70 Medium, 71-100 Critical)
- **Inline Annotations**: For every issue, specify \`filename:linenumber\`, exact exploit scenario, and provide the drop-in secure replacement diff.`,
    descriptionMd: `### GitHub Actions Integration
Drop this prompt directly into a GitHub Actions workflow step calling Anthropic or OpenAI API via pull_request event triggers.`,
    parameters: { model: 'claude-3-7-sonnet', mode: 'devsecops_sentinel', temperature: 0.1 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
        caption: 'Cybersecurity code terminal displaying vulnerability scanner'
      }
    ],
    tags: ['devsecops', 'security', 'code-review', 'owasp', 'github-actions', 'agent'],
    isFeatured: true,
  },
  {
    title: 'Enterprise High-Ticket B2B Lead Enrichment, Signal Tracker & Outreach Drafter',
    slug: 'b2b-lead-enrichment-signal-tracker-agent',
    category: 'code-free-agents',
    model: 'gpt-4o',
    authorUsername: 'alexchen',
    shortDesc: 'Scrapes buying intent signals (funding, hiring, job postings, tech stack) to craft hyper-personalized executive outreach.',
    fullPrompt: `You are an autonomous Account-Based Marketing (ABM) Lead Intelligence Agent.

Analyze the prospective company and executive:
- Target Company: {company_name}
- Target Executive: {executive_name} ({executive_title})
- Recent Company News / Funding: {recent_news}
- Open Job Postings: {job_postings}
- Current Tech Stack Detected: {detected_stack}

Deliverable:
1. **Buying Signal Triangulation**: Identify the top 2 urgent business pressures currently facing this executive based on their hiring and stack changes.
2. **Value Hook**: How our product ({our_product_solution}) directly relieves this pressure in 30 days.
3. **Hyper-Personalized 3-Touch Omnichannel Campaign**:
   - Touch 1: Short LinkedIn connection note (< 280 chars) with zero pitch, only an observation on their recent hiring.
   - Touch 2: 75-word cold email focusing on their specific job listing requirement and our benchmark data.
   - Touch 3: Executive follow-up with a tailored 1-page teardown asset.`,
    descriptionMd: `### Clay & Apollo Automation
Use as the core enrichment prompt within Clay.com, HubSpot, or Apollo automated lead routing workflows.`,
    parameters: { model: 'gpt-4o', strategy: 'hyper_personalized_abm', max_tokens: 1500 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
        caption: 'Sales pipeline and lead conversion performance dashboard'
      }
    ],
    tags: ['b2b-sales', 'enrichment', 'lead-gen', 'abm', 'cold-email', 'clay'],
  },
  {
    title: 'Autonomous Daily AI & Tech Ecosystem Intelligence Newsletter Agent',
    slug: 'autonomous-daily-ai-tech-newsletter-agent',
    category: 'code-free-agents',
    model: 'deepseek-r1',
    authorUsername: 'devin_ops',
    shortDesc: 'Crawls arXiv papers, GitHub trending repos, and Hacker News to compile a high-signal, zero-hype daily AI executive briefing.',
    fullPrompt: `You are an autonomous AI research scientist and tech intelligence curator.

Your task is to analyze today's developments in AI, machine learning, and developer tooling to produce an executive briefing for CTOs and AI founders.

Focus Areas:
- Foundation Model Releases & Architectural Breakthroughs (Transformers, State Space Models, MoE)
- Open-Source Repositories gaining over 1,000 GitHub stars this week
- Critical AI Safety, Governance, and GPU compute infrastructure shifts

Output Structure:
1. **The Lead Story (300 words)**: The single most impactful announcement today, explaining the architectural mechanism, why it matters, and who is disrupted.
2. **Benchmark Teardown**: Dissect claimed benchmark numbers versus independent reproduction data.
3. **Top 3 Open Source Repos of the Day**: Repository name, GitHub URL, what it actually does, and 1-line installation snippet.
4. **Paper of the Day (arXiv)**: Key theorem or insight explained simply with real-world application.`,
    descriptionMd: `### Perplexity & Deep Research Integration
Combines live web retrieval with deep reasoning for authentic, zero-hallucination tech synthesis.`,
    parameters: { model: 'deepseek-r1', search_recency_filter: 'past_24h' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&auto=format&fit=crop&q=80',
        caption: 'Curated technical briefing and engineering report on tablet'
      }
    ],
    tags: ['newsletter', 'ai-research', 'curator', 'deepseek-r1', 'deep-research'],
  },
  {
    title: 'Corporate Legal Compliance, Data Privacy & GDPR/SOC2 Audit Sentinel',
    slug: 'corporate-legal-compliance-gdpr-soc2-agent',
    category: 'code-free-agents',
    model: 'claude-3-7-sonnet',
    authorUsername: 'sarah_design',
    shortDesc: 'Autonomous legal compliance auditor that reviews SaaS terms of service, data processing agreements, and SOC2 controls.',
    fullPrompt: `You are an elite corporate legal compliance counsel and cybersecurity auditor specializing in GDPR, CCPA, HIPAA, and SOC2 Type II compliance.

Audit the following vendor contract or internal policy:
Document Title: {document_title}
Document Text:
\`\`\`
{policy_text}
\`\`\`

Perform a comprehensive regulatory scan:
1. **Data Sovereignty & Cross-Border Transfers**: Check for Standard Contractual Clauses (SCCs) and adherence to EU-US Data Privacy Framework.
2. **Subprocessor Liabilities & Breach Notification**: Verify indemnification caps and whether breach disclosure window meets the 72-hour statutory deadline.
3. **Right to Erasure & Data Retention**: Audit how customer data deletion requests are technically enforced and logged.
4. **Risk Matrix**: Provide a redline markdown table with [Clause / Risk Level / Non-Compliant Language / Recommended Amended Clause].`,
    descriptionMd: `### Enterprise Compliance Guide
Enforces institutional compliance rigor across enterprise software procurement and vendor management.`,
    parameters: { model: 'claude-3-7-sonnet', reasoning_effort: 'high', jurisdiction: 'Global/EU/US' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
        caption: 'Corporate legal documents and compliance audit paperwork'
      }
    ],
    tags: ['legal', 'compliance', 'gdpr', 'soc2', 'claude-3-7-sonnet', 'audit'],
  },
  {
    title: 'Autonomous E-commerce Dynamic Profit Margin & Demand-Driven Repricer',
    slug: 'ecommerce-dynamic-profit-margin-repricer-agent',
    category: 'code-free-agents',
    model: 'gpt-4o',
    authorUsername: 'alexchen',
    shortDesc: 'Real-time pricing agent adjusting Amazon/Shopify SKU pricing based on competitor stock levels, advertising ROAS, and demand elasticity.',
    fullPrompt: `You are an automated algorithmic pricing strategist for high-volume e-commerce brands.

Evaluate SKU: {sku_name}
Current Unit Cost (COGS): {cogs_price}
Current Selling Price: {current_price}
Competitor Prices (Top 3): {competitor_prices}
Inventory On Hand: {inventory_count} (Days of Inventory Remaining: {days_inventory})
Current Paid Ad Blended CAC: {blended_cac}

Pricing Rules Engine:
- Absolute minimum gross margin floor: 35%
- Target contribution margin: 25% after ad spend
- If competitor is out of stock, capture price elasticity surplus (+8% to +15%)
- If inventory > 60 days remaining, initiate velocity discounting

Output:
1. **Recommended New Price ($)**
2. **Projected Daily Revenue & Margin Impact**
3. **Competitor Response Game Theory**: How key rivals will react in 48 hours.
4. **Automated Webhook Payload**: JSON object formatted for Shopify Admin API productVariantUpdate.`,
    descriptionMd: `### E-Commerce Automation Guide
Automates dynamic pricing algorithms for Shopify Plus, Amazon FBA, and WooCommerce stores.`,
    parameters: { model: 'gpt-4o', calculation_mode: 'algorithmic_pricing' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1556742049-0a67e5572263?w=1200&auto=format&fit=crop&q=80',
        caption: 'Mobile online storefront shopping cart and pricing checkout'
      }
    ],
    tags: ['ecommerce', 'pricing', 'repricer', 'shopify', 'retail', 'automation'],
  },

  // =========================================================================
  // 4. APPLICATIONS (6 New Master Prompts)
  // =========================================================================
  {
    title: 'Full-Stack SaaS Multi-Tenant Authentication & RBAC with Supabase & Next.js 15',
    slug: 'saas-multi-tenant-auth-rbac-supabase-nextjs',
    category: 'applications',
    model: 'cursor-composer',
    authorUsername: 'alexchen',
    shortDesc: 'Production-ready Next.js 15 App Router codebase scaffold featuring multi-tenant workspace isolation, Supabase SSR auth, and granular RBAC.',
    fullPrompt: `You are a Principal Full-Stack Architect. Scaffold a production-grade multi-tenant SaaS architecture in Next.js 15 App Router with Supabase and Prisma.

Features to implement:
1. **Multi-Tenancy Workspace Architecture**:
   - Organization slug routing: \`/app/[orgSlug]/dashboard\`
   - Postgres Row-Level Security (RLS) policies enforcing tenant data isolation.
   - Dynamic invitation system with email magic-links and cryptographic tokens.
2. **Granular Role-Based Access Control (RBAC)**:
   - Roles: \`OWNER\`, \`ADMIN\`, \`MEMBER\`, \`VIEWER\`
   - Type-safe permission checking helper: \`hasPermission(user, 'billing:write')\`
3. **Session Management**:
   - \`@supabase/ssr\` cookie-based middleware with automatic token refreshing.
   - Server Actions with Zod schema validation and optimistic client state.
4. **Stripe Billing Integration**:
   - Per-seat usage metering and subscription webhook listeners with idempotency.

Provide clean, modular TypeScript code files with complete types and zero placeholders.`,
    descriptionMd: `### Software Architecture Highlights
Includes Next.js 15 Server Components, Supabase Row-Level Security policies, and type-safe RBAC permission gates.`,
    parameters: { framework: 'Next.js 15', auth: 'Supabase SSR', orm: 'Prisma', styling: 'Tailwind CSS' },
    media: [
      {
        type: 'APP_PREVIEW',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
        caption: 'Production SaaS dashboard with multi-tenant workspace selector'
      }
    ],
    tags: ['nextjs15', 'supabase', 'multi-tenant', 'saas', 'cursor-composer', 'typescript'],
    isFeatured: true,
  },
  {
    title: 'Enterprise Distributed Event-Driven Message Broker with Go, Kafka & gRPC',
    slug: 'distributed-event-broker-go-kafka-grpc',
    category: 'applications',
    model: 'cursor-composer',
    authorUsername: 'devin_ops',
    shortDesc: 'High-throughput Go microservice architecture processing 100k events/sec with Apache Kafka, Protobuf gRPC, and Redis deduplication.',
    fullPrompt: `Build a high-performance, fault-tolerant distributed event processing microservice in Go 1.23.

System Specifications:
1. **Networking & Transport**:
   - Protobuf 3 schema definitions with gRPC bidirectional streaming endpoints.
   - High-performance Prometheus metrics scraper (/metrics) tracking p99 latency.
2. **Kafka Event Pipeline**:
   - Segmentio/kafka-go consumer group with manual commit offset strategies.
   - Dead-letter queue (DLQ) with exponential backoff retry policies.
3. **Idempotency & Deduplication**:
   - Redis sliding-window bloom filter and distributed redlock mutex to prevent double processing.
4. **Graceful Shutdown**:
   - Intercept SIGINT/SIGTERM, drain active worker pools, flush open batch buffers, and cleanly disconnect connection pools.

Write production-grade, idiomatic Go code with error wrapping, contextual logging (zap/zerolog), and zero panic risks.`,
    descriptionMd: `### High-Performance Go System Design
Handles 100,000+ events per second with sub-millisecond serialization using Protobuf and Kafka streaming.`,
    parameters: { language: 'Go 1.23', message_broker: 'Apache Kafka', rpc: 'gRPC Protobuf' },
    media: [
      {
        type: 'APP_PREVIEW',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
        caption: 'Enterprise server rack cluster running distributed message broker'
      }
    ],
    tags: ['golang', 'kafka', 'grpc', 'microservices', 'distributed-systems', 'high-throughput'],
    isFeatured: true,
  },
  {
    title: 'Real-Time Cross-Platform Mobile Crypto Wallet with React Native Expo',
    slug: 'react-native-expo-crypto-wallet-biometrics',
    category: 'applications',
    model: 'cursor-composer',
    authorUsername: 'marcus_k',
    shortDesc: 'Turnkey React Native Expo crypto portfolio app with biometric authentication, WebSocket price tickers, and SecureStore key management.',
    fullPrompt: `Create a production-ready mobile cryptocurrency portfolio & transaction application using React Native Expo SDK 52 and TypeScript.

Key Requirements:
1. **Security & Key Vault**:
   - Encrypted local wallet storage utilizing \`expo-secure-store\` and hardware enclave.
   - Biometric FaceID / TouchID gate via \`expo-local-authentication\`.
2. **Real-Time Data Streaming**:
   - WebSocket connection to CoinGecko/Binance streams with auto-reconnect and ping-pong heartbeats.
   - Reanimated 3 smooth number tickers animating price upticks (emerald) and downticks (rose).
3. **Interactive Charting**:
   - \`react-native-wagmi-charts\` showing 24h/7d/30d sparklines with haptic feedback scrubbers.
4. **Offline Resilience**:
   - TanStack Query v5 with persisted SQLite async caching for instant app launches without network connectivity.`,
    descriptionMd: `### Mobile Fintech Engineering Guide
Provides secure mobile hardware enclave access, real-time WebSocket feeds, and 60fps animations.`,
    parameters: { framework: 'React Native Expo SDK 52', state: 'Zustand + TanStack Query', styling: 'NativeWind' },
    media: [
      {
        type: 'APP_PREVIEW',
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
        caption: 'Mobile cryptocurrency wallet interface with real-time portfolio charts'
      }
    ],
    tags: ['react-native', 'expo', 'crypto', 'mobile', 'cursor', 'fintech'],
  },
  {
    title: 'Autonomous AI Agent Swarm with LangGraph, Python 3.12 & ChromaDB RAG',
    slug: 'langgraph-multi-agent-swarm-python-rag',
    category: 'applications',
    model: 'claude-3-7-sonnet',
    authorUsername: 'devin_ops',
    shortDesc: 'Multi-agent collaboration graph with Supervisor Router, Python Code Execution Sandbox, and ChromaDB vector memory.',
    fullPrompt: `Architect an enterprise multi-agent swarm using Python 3.12, LangGraph, and LangChain Core.

Agent Hierarchy:
1. **Supervisor Router Agent**: Orchestrates tasks, delegates to specialized sub-agents based on conversation state, and evaluates output quality before concluding.
2. **Deep Web Research Agent**: Queries Brave/Tavily search APIs, extracts clean markdown, and validates citation authenticity.
3. **Python Code Execution Worker**: Writes and safely evaluates mathematical simulations in a restricted subprocess container.
4. **Vector Memory Store**: Integrates ChromaDB with OpenAI \`text-embedding-3-large\` for persistent cross-session knowledge retrieval.

Include:
- Stateful Graph definition with TypedDict state and cyclic routing edges.
- Human-in-the-loop breakpoint approval before executing high-risk actions.
- Full type annotations, docstrings, and a runnable \`main.py\` demonstration script.`,
    descriptionMd: `### Multi-Agent Swarm Topology
Implements LangGraph supervisor patterns with stateful checkpoints, vector memory, and containerized tool execution.`,
    parameters: { orchestration: 'LangGraph', language: 'Python 3.12', embeddings: 'text-embedding-3-large' },
    media: [
      {
        type: 'APP_PREVIEW',
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
        caption: 'Neural processing hardware diagram and multi-agent coordination graph'
      }
    ],
    tags: ['langgraph', 'python', 'ai-agents', 'rag', 'claude-3-7-sonnet', 'swarm'],
  },
  {
    title: 'High-Performance Serverless Edge AI Gateway with Cloudflare Workers & KV Cache',
    slug: 'cloudflare-workers-edge-ai-gateway-kv',
    category: 'applications',
    model: 'cursor-composer',
    authorUsername: 'alexchen',
    shortDesc: 'Sub-15ms edge reverse proxy with semantic response caching, token rate limiting, and multi-provider AI fallback routing.',
    fullPrompt: `Build a production-grade Edge AI Gateway deployed on Cloudflare Workers using TypeScript and Hono.js.

Architecture Features:
1. **Unified Multi-Provider Routing**:
   - Accepts standard OpenAI chat completion payloads and transparently routes to Anthropic, OpenAI, or DeepSeek based on cost and latency thresholds.
   - Automatic fallback failover if primary provider returns 5xx status codes.
2. **Semantic Caching via Vectorize & KV**:
   - Hashes prompts and checks Cloudflare KV for identical matches; returns cached responses in under 12ms.
3. **Token Bucket Rate Limiter**:
   - Enforces per-API-key Tier limits using Cloudflare Durable Objects.
4. **Streaming Telemetry & Cost Accounting**:
   - Calculates prompt/completion tokens in real-time and flushes usage logs to ClickHouse/BigQuery via Cloudflare Queues.`,
    descriptionMd: `### Edge AI Proxy Guide
Deploys worldwide across 300+ edge data centers with sub-15ms cached response times and automated LLM failover.`,
    parameters: { runtime: 'Cloudflare Workers Edge', framework: 'Hono.js', caching: 'Cloudflare KV' },
    media: [
      {
        type: 'APP_PREVIEW',
        url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80',
        caption: 'Global optical network map illustrating distributed edge data centers'
      }
    ],
    tags: ['cloudflare', 'edge-computing', 'ai-gateway', 'typescript', 'cursor', 'hono'],
  },
  {
    title: 'Scalable Streaming Data Pipeline with Apache Airflow, DuckDB & Parquet',
    slug: 'scalable-streaming-data-pipeline-duckdb-parquet',
    category: 'applications',
    model: 'cursor-composer',
    authorUsername: 'devin_ops',
    shortDesc: 'Modern Data Stack ETL pipeline processing millions of records locally with DuckDB, Apache Arrow, and Airflow DAG orchestration.',
    fullPrompt: `You are a Principal Data Engineer. Write a modern, lightweight data pipeline pipeline using Python 3.12, DuckDB, Polars, and Apache Airflow.

Pipeline Specifications:
1. **Extraction**:
   - Ingest batched JSON/CSV files from AWS S3 using streaming chunked readers without running out of RAM.
2. **Transformation with DuckDB**:
   - Execute vectorized SQL transformations directly on snappy Parquet files on disk.
   - Perform window calculations, customer lifetime value rollups, and anomaly detection.
3. **Data Quality Assertions**:
   - Implement Great Expectations / Soda style schema verification (null checks, range validation, unique primary keys).
4. **Airflow DAG Definition**:
   - Self-healing task retries with Slack webhook alerts on pipeline failure.

Provide clean, reproducible Python scripts with docstrings and Dockerfile instructions.`,
    descriptionMd: `### Modern Data Stack ETL Blueprint
Process gigabyte-scale analytical workloads 10x faster than Pandas with zero warehouse infrastructure cost using DuckDB.`,
    parameters: { tools: 'DuckDB + Polars + Airflow', storage: 'Apache Parquet', language: 'Python 3.12' },
    media: [
      {
        type: 'APP_PREVIEW',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        caption: 'Real-time data pipeline metrics monitor and execution DAG'
      }
    ],
    tags: ['data-engineering', 'duckdb', 'airflow', 'python', 'etl', 'parquet'],
  },

  // =========================================================================
  // 5. TEXT / WRITING (6 New Master Prompts)
  // =========================================================================
  {
    title: 'Institutional Wall Street Equity Research & DCF Financial Valuation Report',
    slug: 'institutional-equity-research-dcf-valuation',
    category: 'text-writing',
    model: 'claude-3-7-sonnet',
    authorUsername: 'alexchen',
    shortDesc: 'Goldman Sachs / Morgan Stanley grade 15-page equity initiation report with 5-year DCF modeling and competitive moat analysis.',
    fullPrompt: `You are a Senior Wall Street Equity Research Analyst covering the technology sector.

Write an initiation of coverage research report for {target_ticker} ({company_name}).

Structure:
1. **Executive Investment Thesis & Target Price**:
   - Rating: [OVERWEIGHT / EQUAL-WEIGHT / UNDERWEIGHT]
   - 12-Month Price Target derived from 50% DCF + 50% EV/NTM Revenue multiple.
2. **Key Catalysts & Strategic Moat**:
   - Gross margin expansion levers, pricing power, and switching costs.
3. **Financial Statement Breakdown**:
   - 3-Year Historical vs. 5-Year Forecasted Revenue, EBITDA, and Free Cash Flow.
   - Working capital requirements and terminal growth rate assumptions (3.0%).
4. **Bear vs. Bull Scenario Analysis**:
   - Downside risks (macro headwinds, regulatory anti-trust, supply chain).
   - Blue-sky upside triggers.`,
    descriptionMd: `### Investment Banking Rigor
Designed for hedge fund analysts, investment bankers, and angel investors requiring Wall Street grade financial modeling.`,
    parameters: { model: 'claude-3-7-sonnet', tone: 'Institutional Financial', temperature: 0.2 },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
        caption: 'Institutional trading screen with candlestick market data'
      }
    ],
    tags: ['finance', 'equity-research', 'wall-street', 'valuation', 'claude-3-7-sonnet', 'investing'],
    isFeatured: true,
  },
  {
    title: 'Enterprise B2B RFP Tender Response & Executive Value Proposition Engine',
    slug: 'enterprise-b2b-rfp-tender-response-engine',
    category: 'text-writing',
    model: 'claude-3-7-sonnet',
    authorUsername: 'sarah_design',
    shortDesc: 'Transforms complex 50-page enterprise Request For Proposals into winning, compliance-checked bids highlighting differentiation.',
    fullPrompt: `You are an elite Enterprise B2B Proposal Director who has won over $100M in competitive RFP government and Fortune 500 contracts.

Draft a compelling, winning response for RFP section: {rfp_section_name}.
Client Name: {client_name}
Client Pain Points: {client_pain_points}
Our Solution & Differentiation: {our_solution}
Competitors in Bid: {competitors}

Guidelines:
1. **Executive Summary**: Hook the procurement committee within the first 60 seconds of reading.
2. **Compliance & Requirement Mapping**: Directly cite the RFP requirement number with unequivocal affirmative compliance.
3. **Value Proof & ROI Quantification**: Include tangible case study metrics (e.g. "34% operational expense reduction within 90 days of rollout").
4. **Risk Mitigation & SLA Guarantees**: Concrete uptime, data sovereignty, and dedicated customer success manager commitments.`,
    descriptionMd: `### Winning Bid Architecture
Engineered to satisfy stringent procurement scoring matrices while pitching differentiated value.`,
    parameters: { model: 'claude-3-7-sonnet', tone: 'Authoritative Enterprise Executive' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
        caption: 'Executive tender proposal and signed commercial agreement'
      }
    ],
    tags: ['b2b', 'rfp', 'sales', 'enterprise', 'claude-3-7-sonnet', 'proposal'],
  },
  {
    title: 'Viral Engineering Post-Mortem: Distributed System Outage Root-Cause Analysis',
    slug: 'viral-engineering-post-mortem-outage-rca',
    category: 'text-writing',
    model: 'claude-3-7-sonnet',
    authorUsername: 'devin_ops',
    shortDesc: 'High-transparency, blameless technical incident post-mortem in the style of Cloudflare, AWS, or Discord engineering blogs.',
    fullPrompt: `You are a Principal Reliability Architect writing a public, blameless post-mortem for a major service outage.

Incident Details:
- Incident Name: {incident_name}
- Date & Duration: {outage_duration}
- Impacted Services: {impacted_services}
- Trigger Event: {trigger_event}
- Underlying Architectural Defect: {underlying_defect}

Draft the post-mortem with total technical transparency:
1. **Executive Summary**: Plain-English explanation for non-technical users and executive stakeholders.
2. **Minute-by-Minute Timeline (UTC)**: From initial alert trigger to rollback and recovery verification.
3. **Deep Technical Root Cause**: Diagrams or pseudo-code showing race conditions, cascading failovers, or DNS routing storms.
4. **What Went Well vs. What Went Wrong**: Honest internal evaluation of tooling and on-call response.
5. **Concrete Action Items (Action Matrix)**: 5 P0/P1 engineering preventive measures with assigned milestones.`,
    descriptionMd: `### SRE Incident Response Standard
Adopted by leading tech companies to preserve brand trust and engineer system resilience after outages.`,
    parameters: { model: 'claude-3-7-sonnet', format: 'Blameless Post-Mortem', style: 'Cloudflare Engineering' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
        caption: 'Cloud infrastructure datacenter glowing during system recovery'
      }
    ],
    tags: ['devops', 'post-mortem', 'incident-response', 'engineering', 'sre', 'claude'],
  },
  {
    title: 'Non-Fiction Bestseller Chapter Outliner, Case Study & Argument Scaffold',
    slug: 'nonfiction-bestseller-chapter-outliner',
    category: 'text-writing',
    model: 'claude-3-7-sonnet',
    authorUsername: 'marcus_k',
    shortDesc: 'Architects compelling non-fiction book chapters in the narrative style of Malcolm Gladwell, James Clear, and Walter Isaacson.',
    fullPrompt: `You are a legendary developmental book editor who has shaped multiple New York Times #1 non-fiction bestsellers.

Develop an irresistible, page-turning chapter scaffold for:
Book Topic: {book_topic}
Chapter Core Premise: {chapter_thesis}
Target Reader: {target_audience}

Construct the chapter blueprint:
1. **The Cold Open Narrative Hook**: A gripping, sensory-rich human story or historical anecdote that dramatizes the central paradox.
2. **The Counter-Intuitive Revelation**: Why conventional wisdom is fundamentally flawed.
3. **The Empirical Evidence & Scientific Framework**: Citing psychological studies, neurological experiments, or economic data to build airtight credibility.
4. **Actionable Mental Model / Heuristic**: A memorable 3-word rule or framework readers can immediately test in their lives.
5. **The Narrative Resolution & Transition**: Bringing the cold open story full circle with the new paradigm.`,
    descriptionMd: `### Best-Selling Narrative Arc
Used by non-fiction authors, thought leaders, and ghostwriters to turn complex ideas into addictive prose.`,
    parameters: { model: 'claude-3-7-sonnet', storytelling_framework: 'Narrative Non-Fiction' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80',
        caption: 'Open hardcover book in quiet historical library'
      }
    ],
    tags: ['writing', 'author', 'book', 'storytelling', 'claude', 'publishing'],
  },
  {
    title: 'High-Converting Direct-Response SaaS Landing Page Copy Architecture',
    slug: 'high-converting-saas-landing-page-copy',
    category: 'text-writing',
    model: 'claude-3-7-sonnet',
    authorUsername: 'alexchen',
    shortDesc: 'Full wireframe copy from Hero to FAQ engineered to maximize visitor-to-signup conversion rates for modern software tools.',
    fullPrompt: `You are a world-class SaaS conversion copywriter who has optimized landing pages for Stripe, Linear, and Notion.

Write the complete high-converting landing page copy for:
Product Name: {product_name}
Target ICP: {target_icp}
Core Problem: {core_problem}
Primary Metric Outcome: {metric_outcome}

Generate complete copy for all 7 sections:
1. **Hero Section**:
   - Eyebrow tag, H1 Headline (10 words max, bold outcome), Subheadline (2 sentences on how), Primary CTA button copy, Micro-social proof text.
2. **Social Proof Ticker**: Fictional customer marquee badges.
3. **Problem / Agitation Bento Grid**: 3 specific frustrations the user feels daily.
4. **Feature Breakdown (Show, Don't Tell)**: 3 feature benefit pairs with interactive screenshot captioning.
5. **Interactive Calculator / ROI Section**: "See how much hours/dollars you save".
6. **Customer Testimonial Quote Cards**: 2 high-credibility quotes with titles.
7. **Overcoming Objections FAQ**: 5 critical questions that kill conversion.`,
    descriptionMd: `### Conversion Optimization Architecture
Proven 7-step landing page copywriting blueprint engineered for 5%+ visitor-to-lead conversion rates.`,
    parameters: { model: 'claude-3-7-sonnet', framework: 'Direct-Response SaaS' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
        caption: 'SaaS landing page wireframe with modern typography and CTA button'
      }
    ],
    tags: ['copywriting', 'saas', 'landing-page', 'conversion-rate', 'marketing', 'claude'],
  },
  {
    title: 'C-Suite Executive Crisis PR & Reputation Defense Communication Protocol',
    slug: 'c-suite-executive-crisis-pr-protocol',
    category: 'text-writing',
    model: 'claude-3-7-sonnet',
    authorUsername: 'sarah_design',
    shortDesc: 'Rapid-response corporate crisis management messaging for data breaches, executive departures, and product recalls.',
    fullPrompt: `You are a high-stakes corporate crisis PR communications strategist advising Fortune 500 CEOs and boards.

Develop a strategic crisis communications protocol for:
Company: {company_name}
Crisis Scenario: {crisis_scenario}
Affected Stakeholders: {affected_stakeholders}
Legal / Regulatory Exposure: {legal_exposure}

Deliverables:
1. **Holding Statement (First 60 Minutes)**: Immediate press release acknowledging awareness without prematurely conceding legal liability.
2. **Internal Employee All-Hands Memo**: Transparent, empathetic internal communication preventing leaks and rumors.
3. **Direct Customer Outreach Email**: Direct accountability statement outlining remediation steps, compensation/credits, and customer support channels.
4. **Q&A Media Battlecard**: 5 toughest hostile journalist questions with "Bridge & Pivot" talking points for the CEO.`,
    descriptionMd: `### Crisis Communications Framework
Provides calm, decisive leadership communications during company emergencies.`,
    parameters: { model: 'claude-3-7-sonnet', tone: 'Crisis PR Counsel', urgency: 'High' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
        caption: 'Press conference podium microphones ready for executive briefing'
      }
    ],
    tags: ['crisis-pr', 'executive', 'communications', 'reputation', 'claude', 'pr'],
  },

  // =========================================================================
  // 6. UI/UX (4 New Interactive Sandbox Prompts)
  // =========================================================================
  {
    title: 'Interactive AI Prompt Engineering Canvas with Token Gauge & Live Streamer',
    slug: 'ai-prompt-engineering-canvas-token-dial',
    category: 'ui-ux',
    model: 'cursor-composer',
    authorUsername: 'sarah_design',
    shortDesc: 'Modern split-pane AI workbench with variable chip injection, live token usage gauge, temperature slider, and streaming response emulator.',
    fullPrompt: `Build a cutting-edge split-pane AI prompt engineering studio in HTML, Tailwind CSS, and vanilla JavaScript. Left pane: prompt composer with dynamic {variable} chips, system instructions drawer, and model selector (Claude 3.7, GPT-4o, DeepSeek R1). Right pane: real-time streaming preview console, token counter dial, and JSON parameter payload exporter.`,
    descriptionMd: `### Interactive Sandbox App
Includes working temperature slider, dynamic token counter dial, and simulated LLM token streaming animation right inside the browser.`,
    parameters: { model: 'cursor-composer', technology: 'HTML + Tailwind CSS + Vanilla JS' },
    media: [
      {
        type: 'APP_PREVIEW',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        caption: 'AI studio split-pane prompt engineering canvas with token analytics'
      }
    ],
    tags: ['ai-canvas', 'prompt-engineering', 'tailwind', 'interactive-sandbox', 'workbench'],
    isFeatured: true,
    sandboxCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col p-6">
  <header class="flex items-center justify-between pb-6 border-b border-slate-800">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">AI</div>
      <div>
        <h1 class="text-lg font-bold">Prompt Workbench Pro</h1>
        <p class="text-xs text-slate-400">Split-Pane LLM Engineering Studio</p>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-slate-400">Model:</span>
        <select id="modelSelect" class="bg-transparent font-medium text-slate-200 outline-none cursor-pointer">
          <option value="claude-3-7" class="bg-slate-900">Claude 3.7 Sonnet</option>
          <option value="gpt-4o" class="bg-slate-900">GPT-4o</option>
          <option value="deepseek-r1" class="bg-slate-900">DeepSeek R1</option>
        </select>
      </div>
      <button id="runBtn" onclick="simulateStream()" class="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-1.5 rounded-lg text-sm shadow-md shadow-indigo-600/30 transition flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
        Execute Prompt
      </button>
    </div>
  </header>

  <main class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 pt-6">
    <!-- Left Pane: Composer -->
    <div class="flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div class="flex items-center justify-between pb-3">
        <span class="text-xs font-semibold uppercase tracking-wider text-indigo-400">Prompt Composer</span>
        <div class="flex gap-2">
          <button onclick="insertVar('user_input')" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700 font-mono">+ {user_input}</button>
          <button onclick="insertVar('tone')" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700 font-mono">+ {tone}</button>
        </div>
      </div>
      <textarea id="promptInput" oninput="updateTokens()" class="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm mono text-slate-200 outline-none focus:border-indigo-500 resize-none transition" placeholder="Enter system and user instructions here..."></textarea>
      
      <div class="pt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 mt-4">
        <div class="flex items-center gap-3">
          <span>Temp: <strong id="tempVal" class="text-slate-200">0.7</strong></span>
          <input type="range" min="0" max="1" step="0.1" value="0.7" oninput="document.getElementById('tempVal').innerText = this.value" class="w-24 accent-indigo-500 cursor-pointer">
        </div>
        <div>
          Estimated Tokens: <strong id="tokenCount" class="text-indigo-400 font-mono">34</strong>
        </div>
      </div>
    </div>

    <!-- Right Pane: Streaming Output -->
    <div class="flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div class="flex items-center justify-between pb-3">
        <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400">Streaming Console</span>
        <span id="streamStatus" class="text-xs text-slate-500">Idle</span>
      </div>
      <div id="outputConsole" class="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm mono text-slate-300 overflow-y-auto leading-relaxed whitespace-pre-wrap">Click "Execute Prompt" to stream output tokens...</div>
      
      <div class="pt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 mt-4">
        <span>Latency: <strong id="latencyVal" class="text-emerald-400 font-mono">18ms</strong></span>
        <span>Cost Est: <strong class="text-slate-200 font-mono">$0.00042</strong></span>
      </div>
    </div>
  </main>

  <script>
    const defaultPrompt = \`You are an elite reasoning model.
Analyze the following input: {user_input}
Format response in structured markdown with executive key takeaways.\`;
    document.getElementById('promptInput').value = defaultPrompt;
    updateTokens();

    function updateTokens() {
      const len = document.getElementById('promptInput').value.length;
      document.getElementById('tokenCount').innerText = Math.ceil(len / 3.8);
    }

    function insertVar(name) {
      const el = document.getElementById('promptInput');
      el.value += ' {' + name + '}';
      updateTokens();
      el.focus();
    }

    let streaming = false;
    function simulateStream() {
      if (streaming) return;
      streaming = true;
      const btn = document.getElementById('runBtn');
      const out = document.getElementById('outputConsole');
      const status = document.getElementById('streamStatus');
      btn.disabled = true;
      btn.classList.add('opacity-50');
      status.innerHTML = '<span class="text-emerald-400 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>Streaming...</span>';
      out.innerText = '';
      
      const sampleTokens = [
        '### Analysis Report\\n\\n',
        '**1. Executive Summary**\\n',
        'The primary system requirements indicate a zero-latency throughput constraint. ',
        'We observe high affinity for async event-driven architecture.\\n\\n',
        '**2. Actionable Recommendations**\\n',
        '- Deploy distributed Redis cluster with automatic failover.\\n',
        '- Enable edge caching via Cloudflare Workers.\\n',
        '- Enforce rate limits with token bucket algorithms.\\n\\n',
        '✨ Execution complete with 0 warnings.'
      ];

      let i = 0;
      const timer = setInterval(() => {
        if (i < sampleTokens.length) {
          out.innerText += sampleTokens[i];
          i++;
        } else {
          clearInterval(timer);
          streaming = false;
          btn.disabled = false;
          btn.classList.remove('opacity-50');
          status.innerHTML = '<span class="text-emerald-400">Completed in 420ms</span>';
        }
      }, 90);
    }
  </script>
</body>
</html>`
  },
  {
    title: 'Cyberpunk Developer Terminal Console with Matrix Rain & Real-Time Metrics',
    slug: 'cyberpunk-developer-terminal-console',
    category: 'ui-ux',
    model: 'cursor-composer',
    authorUsername: 'sarah_design',
    shortDesc: 'Sci-Fi hacker terminal HUD with canvas-based green/cyan digital rain, typing command line, memory usage graphs, and audio bleeps.',
    fullPrompt: `Create a futuristic cyberpunk cyber-defense terminal HUD using HTML, CSS, and vanilla JS. Include a background Matrix digital rain canvas, interactive command prompt where typing commands like 'status', 'scan', and 'deploy' outputs styled telemetry logs, and animated CPU/Memory load gauges.`,
    descriptionMd: `### Interactive Sci-Fi Terminal Sandbox
Interactive digital rain canvas with working interactive command-line interface! Try typing \`help\`, \`status\`, \`scan\`, or \`clear\`.`,
    parameters: { model: 'cursor-composer', theme: 'Cyberpunk Neon Green', canvas: 'Matrix Rain' },
    media: [
      {
        type: 'APP_PREVIEW',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        caption: 'Hacker terminal interface with emerald matrix digital rain'
      }
    ],
    tags: ['cyberpunk', 'terminal', 'hacker-hud', 'matrix', 'interactive-sandbox', 'canvas'],
    sandboxCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Fira Code', monospace; background: #030708; }
    .glow-green { text-shadow: 0 0 10px rgba(34, 197, 94, 0.7); }
    .glow-box { box-shadow: 0 0 20px rgba(34, 197, 94, 0.15); }
  </style>
</head>
<body class="text-green-400 min-h-screen relative overflow-hidden flex flex-col p-6">
  <canvas id="matrixCanvas" class="absolute inset-0 z-0 opacity-25 pointer-events-none"></canvas>

  <div class="relative z-10 max-w-4xl mx-auto w-full flex flex-col flex-1 bg-black/80 border border-green-500/40 rounded-xl p-6 glow-box backdrop-blur-md">
    <div class="flex items-center justify-between pb-4 border-b border-green-500/30">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full bg-red-500"></span>
        <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
        <span class="w-3 h-3 rounded-full bg-green-500"></span>
        <span class="text-xs text-green-300 font-bold ml-2 glow-green">NEO-DEFENSE OS // TERMINAL V4.2</span>
      </div>
      <div class="text-xs text-green-500">SECURE NODE // 192.168.0.X</div>
    </div>

    <!-- Output Log -->
    <div id="termLog" class="flex-1 overflow-y-auto py-4 text-xs space-y-2 leading-relaxed max-h-[480px]">
      <div>[INIT] Terminal initialized. Defense protocols active.</div>
      <div>Type <span class="text-emerald-200 underline font-bold cursor-pointer" onclick="runCmd('help')">help</span> to list available commands.</div>
    </div>

    <!-- Input Line -->
    <div class="flex items-center gap-2 pt-3 border-t border-green-500/30">
      <span class="text-green-500 font-bold">root@sentinel:~#</span>
      <input type="text" id="cmdInput" autofocus class="flex-1 bg-transparent border-none outline-none text-green-300 font-mono text-sm" placeholder="Type command (e.g. status, scan, deploy)...">
    </div>
  </div>

  <script>
    // Matrix Rain Canvas
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function drawMatrix() {
      ctx.fillStyle = 'rgba(3, 7, 8, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#22c55e';
      ctx.font = fontSize + 'px monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }
    setInterval(drawMatrix, 40);

    // Terminal Commands
    const input = document.getElementById('cmdInput');
    const log = document.getElementById('termLog');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim().toLowerCase();
        runCmd(cmd);
        input.value = '';
      }
    });

    function runCmd(cmd) {
      addLog('<span class="text-green-300 font-bold">root@sentinel:~# ' + cmd + '</span>');
      if (cmd === 'help') {
        addLog('Available commands:<br>  - <strong class="text-emerald-200">status</strong>: Display server telemetry & memory load<br>  - <strong class="text-emerald-200">scan</strong>: Perform port vulnerability sweep<br>  - <strong class="text-emerald-200">deploy</strong>: Simulate edge cluster deployment<br>  - <strong class="text-emerald-200">clear</strong>: Clear terminal screen');
      } else if (cmd === 'status') {
        addLog('[OK] CPU Load: 14.2% | RAM: 4.8GB / 32GB | Uptime: 94 days 12h<br>[OK] Firewall: ENFORCING (0 dropped packets in last 1h)');
      } else if (cmd === 'scan') {
        addLog('<span class="text-yellow-400">[SCANNING] Scanning 65,535 TCP ports...</span>');
        setTimeout(() => {
          addLog('<span class="text-emerald-300">[CLEAN] 0 open unauthorized ports detected. Perimeter secure.</span>');
        }, 600);
      } else if (cmd === 'deploy') {
        addLog('<span class="text-indigo-400">[DEPLOY] Shipping release v2.4.0 to 18 global edge zones...</span>');
        setTimeout(() => {
          addLog('<span class="text-green-300">[SUCCESS] Deployment live in Tokyo, Frankfurt, San Jose, Singapore.</span>');
        }, 800);
      } else if (cmd === 'clear') {
        log.innerHTML = '';
      } else if (cmd) {
        addLog('<span class="text-red-400">Command not recognized: ' + cmd + '. Type "help".</span>');
      }
    }

    function addLog(html) {
      const d = document.createElement('div');
      d.innerHTML = html;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
    }
  </script>
</body>
</html>`
  },
  {
    title: 'Haute Horlogerie Luxury Watch Showcase with Dynamic 3D Dial Glow',
    slug: 'luxury-watch-showcase-3d-dial-glow',
    category: 'ui-ux',
    model: 'cursor-composer',
    authorUsername: 'elena_v',
    shortDesc: 'Ultra-luxurious dark-mode product showcase for Swiss tourbillon watches with mouse-following glass reflection and customizable straps.',
    fullPrompt: `Design a minimalist ultra-luxury Swiss timepiece product showcase page using HTML and Tailwind CSS. Features: dark slate background (#0a0b10), metallic rose-gold typography, interactive 3D card tilt effect following mouse coordinates, strap material selector (Alligator Leather, Titanium Mesh, Rubber), and an acoustic movement sound toggle.`,
    descriptionMd: `### Interactive Luxury E-Commerce Sandbox
Features mouse-following 3D perspective tilt, interactive strap material changer, and technical horology specifications drawer.`,
    parameters: { model: 'cursor-composer', theme: 'Obsidian & Rose Gold', interactions: '3D Mouse Tilt' },
    media: [
      {
        type: 'APP_PREVIEW',
        url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=80',
        caption: 'Haute horlogerie luxury timepiece product page with interactive 3D tilt'
      }
    ],
    tags: ['luxury', 'watch', 'ecommerce', 'dark-mode', 'interactive-sandbox', '3d-card'],
    sandboxCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #07090e; }
    .serif { font-family: 'Cinzel', serif; }
    .gold-gradient { background: linear-gradient(135deg, #d4af37, #f3e5ab, #aa771c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  </style>
</head>
<body class="text-slate-200 min-h-screen flex items-center justify-center p-8">
  <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-amber-900/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
    <!-- Watch Image Tilt Box -->
    <div id="cardBox" class="relative flex items-center justify-center rounded-2xl bg-black/50 border border-slate-800 p-8 overflow-hidden group">
      <div class="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
      <img id="watchImg" src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80" alt="Chronograph" class="w-72 h-72 object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-out">
      <div class="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-amber-500/80 font-mono">Calibre 9901 // Tourbillon</div>
    </div>

    <!-- Product Details -->
    <div class="flex flex-col justify-between py-2">
      <div>
        <span class="text-xs uppercase tracking-[0.25em] text-amber-400 font-mono">Swiss Chronometer Edition</span>
        <h1 class="serif text-3xl font-bold text-white mt-2">Chronographe Royal</h1>
        <p class="text-sm text-slate-400 mt-3 leading-relaxed">Hand-finished Grade 5 Titanium chassis with exposed manual-wind tourbillon movement. 72-hour power reserve with anti-magnetic silicon hairspring.</p>

        <!-- Strap Selector -->
        <div class="mt-6">
          <label class="text-xs uppercase tracking-wider text-slate-400 font-medium">Select Strap Material</label>
          <div class="grid grid-cols-3 gap-3 mt-2">
            <button onclick="setStrap('Alligator Leather', '$18,500')" class="strap-btn border border-amber-500/60 bg-amber-500/10 text-amber-300 text-xs py-2 rounded-xl font-medium transition">Alligator</button>
            <button onclick="setStrap('Titanium Mesh', '$19,800')" class="strap-btn border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 text-xs py-2 rounded-xl font-medium transition">Ti Mesh</button>
            <button onclick="setStrap('Vulcanized Rubber', '$17,900')" class="strap-btn border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 text-xs py-2 rounded-xl font-medium transition">Rubber</button>
          </div>
        </div>
      </div>

      <div class="pt-6 border-t border-slate-800 flex items-center justify-between mt-6">
        <div>
          <div class="text-xs text-slate-500">Retail Price (VAT Incl.)</div>
          <div id="priceTag" class="serif text-2xl font-bold text-white mt-0.5">$18,500</div>
        </div>
        <button onclick="alert('Bespoke allocation reserved. A concierge will contact you.')" class="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-lg shadow-amber-700/30 transition uppercase tracking-wider">Acquire Timepiece</button>
      </div>
    </div>
  </div>

  <script>
    function setStrap(name, price) {
      document.getElementById('priceTag').innerText = price;
      document.querySelectorAll('.strap-btn').forEach(b => {
        b.className = 'strap-btn border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 text-xs py-2 rounded-xl font-medium transition';
      });
      event.target.className = 'strap-btn border border-amber-500/60 bg-amber-500/10 text-amber-300 text-xs py-2 rounded-xl font-medium transition';
    }

    // 3D Card Tilt on Mouse Move
    const box = document.getElementById('cardBox');
    const img = document.getElementById('watchImg');
    box.addEventListener('mousemove', (e) => {
      const rect = box.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      img.style.transform = 'perspective(600px) rotateY(' + (x * 0.08) + 'deg) rotateX(' + (-y * 0.08) + 'deg) scale(1.05)';
    });
    box.addEventListener('mouseleave', () => {
      img.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
    });
  </script>
</body>
</html>`
  },
  {
    title: 'Agile Sprint Kanban Board with Fluid Card Dragging & Burndown Sparkline',
    slug: 'agile-sprint-kanban-board-drag-drop',
    category: 'ui-ux',
    model: 'cursor-composer',
    authorUsername: 'sarah_design',
    shortDesc: 'High-velocity project management board with column counters, priority tags, assignee avatars, and working drag-and-drop mechanics.',
    fullPrompt: `Create a clean, modern SaaS Kanban board (Linear / Jira style) in HTML, Tailwind CSS, and vanilla JS. Columns: Backlog, In Progress, Code Review, Done. Each card features story points badge, priority chip (Urgent, High, Low), and team member avatar. Supports HTML5 Drag-and-Drop between columns with instant column count updating.`,
    descriptionMd: `### Interactive Kanban App Sandbox
Complete working drag-and-drop mechanics between Backlog, In Progress, Code Review, and Done columns!`,
    parameters: { model: 'cursor-composer', framework: 'HTML5 Drag & Drop + Tailwind CSS' },
    media: [
      {
        type: 'APP_PREVIEW',
        url: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1200&auto=format&fit=crop&q=80',
        caption: 'Agile Kanban board with fluid drag-and-drop sprint management cards'
      }
    ],
    tags: ['kanban', 'agile', 'linear', 'drag-and-drop', 'ui-ux', 'interactive-sandbox'],
    sandboxCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .kanban-col { min-height: 420px; }
    .dragging { opacity: 0.4; transform: scale(0.98); }
  </style>
</head>
<body class="bg-slate-950 text-slate-200 min-h-screen flex flex-col p-6">
  <header class="flex items-center justify-between pb-6 border-b border-slate-800">
    <div>
      <h1 class="text-xl font-bold text-white flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-indigo-500"></span> Sprint 28: Core Infrastructure
      </h1>
      <p class="text-xs text-slate-400 mt-1">Drag task cards between columns to update status in real-time.</p>
    </div>
    <button onclick="addTaskPrompt()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition">+ Add Task</button>
  </header>

  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 pt-6">
    <!-- Backlog -->
    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Backlog</span>
        <span id="count-backlog" class="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">2</span>
      </div>
      <div id="col-backlog" class="kanban-col flex-1 space-y-3" ondragover="allowDrop(event)" ondrop="handleDrop(event, 'backlog')">
        <div id="card-1" draggable="true" ondragstart="drag(event)" class="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl cursor-grab active:cursor-grabbing shadow-sm transition">
          <div class="flex items-center justify-between text-[11px] mb-2">
            <span class="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-medium">P0 Critical</span>
            <span class="text-slate-500 font-mono">5 SP</span>
          </div>
          <h3 class="text-xs font-semibold text-slate-200">Fix connection pool leak in gRPC gateway</h3>
        </div>
        <div id="card-2" draggable="true" ondragstart="drag(event)" class="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl cursor-grab active:cursor-grabbing shadow-sm transition">
          <div class="flex items-center justify-between text-[11px] mb-2">
            <span class="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-medium">P1 High</span>
            <span class="text-slate-500 font-mono">3 SP</span>
          </div>
          <h3 class="text-xs font-semibold text-slate-200">Refactor auth middleware to verify JWT claims</h3>
        </div>
      </div>
    </div>

    <!-- In Progress -->
    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">In Progress</span>
        <span id="count-inprogress" class="text-xs bg-indigo-950/60 text-indigo-300 font-mono px-2 py-0.5 rounded-full">1</span>
      </div>
      <div id="col-inprogress" class="kanban-col flex-1 space-y-3" ondragover="allowDrop(event)" ondrop="handleDrop(event, 'inprogress')">
        <div id="card-3" draggable="true" ondragstart="drag(event)" class="bg-slate-900 border border-indigo-500/30 p-3.5 rounded-xl cursor-grab active:cursor-grabbing shadow-sm transition">
          <div class="flex items-center justify-between text-[11px] mb-2">
            <span class="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-medium">Active</span>
            <span class="text-slate-500 font-mono">8 SP</span>
          </div>
          <h3 class="text-xs font-semibold text-slate-200">Next.js 15 migration with React 19 compiler</h3>
        </div>
      </div>
    </div>

    <!-- Code Review -->
    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-purple-400">Review</span>
        <span id="count-review" class="text-xs bg-purple-950/60 text-purple-300 font-mono px-2 py-0.5 rounded-full">1</span>
      </div>
      <div id="col-review" class="kanban-col flex-1 space-y-3" ondragover="allowDrop(event)" ondrop="handleDrop(event, 'review')">
        <div id="card-4" draggable="true" ondragstart="drag(event)" class="bg-slate-900 border border-slate-800 p-3.5 rounded-xl cursor-grab active:cursor-grabbing shadow-sm transition">
          <div class="flex items-center justify-between text-[11px] mb-2">
            <span class="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-medium">PR #108</span>
            <span class="text-slate-500 font-mono">2 SP</span>
          </div>
          <h3 class="text-xs font-semibold text-slate-200">Add OpenTelemetry traces for PostgreSQL queries</h3>
        </div>
      </div>
    </div>

    <!-- Done -->
    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">Done</span>
        <span id="count-done" class="text-xs bg-emerald-950/60 text-emerald-300 font-mono px-2 py-0.5 rounded-full">1</span>
      </div>
      <div id="col-done" class="kanban-col flex-1 space-y-3" ondragover="allowDrop(event)" ondrop="handleDrop(event, 'done')">
        <div id="card-5" draggable="true" ondragstart="drag(event)" class="bg-slate-900 border border-emerald-500/20 p-3.5 rounded-xl cursor-grab active:cursor-grabbing shadow-sm transition">
          <div class="flex items-center justify-between text-[11px] mb-2">
            <span class="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-medium">Deployed</span>
            <span class="text-slate-500 font-mono">3 SP</span>
          </div>
          <h3 class="text-xs font-semibold text-slate-200 line-through text-slate-400">Setup Cloudflare Turnstile bot verification</h3>
        </div>
      </div>
    </div>
  </div>

  <script>
    let draggedId = null;
    function drag(e) {
      draggedId = e.target.id;
      e.dataTransfer.setData('text', e.target.id);
      e.target.classList.add('dragging');
    }
    document.addEventListener('dragend', (e) => {
      if (e.target.classList) e.target.classList.remove('dragging');
    });
    function allowDrop(e) { e.preventDefault(); }
    function handleDrop(e, col) {
      e.preventDefault();
      const card = document.getElementById(draggedId);
      if (card) {
        document.getElementById('col-' + col).appendChild(card);
        updateCounts();
      }
    }
    function updateCounts() {
      ['backlog', 'inprogress', 'review', 'done'].forEach(col => {
        const count = document.getElementById('col-' + col).children.length;
        document.getElementById('count-' + col).innerText = count;
      });
    }
    function addTaskPrompt() {
      const title = prompt('Enter task title:');
      if (title) {
        const id = 'card-' + Date.now();
        const card = document.createElement('div');
        card.id = id;
        card.draggable = true;
        card.ondragstart = drag;
        card.className = 'bg-slate-900 border border-slate-800 p-3.5 rounded-xl cursor-grab active:cursor-grabbing shadow-sm transition';
        card.innerHTML = '<div class="flex items-center justify-between text-[11px] mb-2"><span class="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-medium">New</span><span class="text-slate-500 font-mono">3 SP</span></div><h3 class="text-xs font-semibold text-slate-200">' + title + '</h3>';
        document.getElementById('col-backlog').appendChild(card);
        updateCounts();
      }
    }
  </script>
</body>
</html>`
  },

  // =========================================================================
  // 7. IMAGES (6 New Master Prompts)
  // =========================================================================
  {
    title: 'Hyper-Detailed Cybernetic Geisha with Gold Leaf Kintsugi & Volumetric Neon',
    slug: 'cybernetic-geisha-gold-kintsugi-neon',
    category: 'images',
    model: 'midjourney-v7',
    authorUsername: 'alexchen',
    shortDesc: 'Breathtaking fusion of traditional Edo-period Japanese aesthetics with futuristic cybernetics and kintsugi porcelain.',
    fullPrompt: `Cinematic portrait of a futuristic cybernetic geisha with porcelain white skin cracked and repaired with glowing 24k liquid gold kintsugi. Elaborate traditional lacquer hair adorned with fiber-optic kanzashi pins emitting delicate cyan photons. Soft volumetric atmospheric smoke in a dimly lit Kyoto neon tearoom. Shot on Hasselblad H6D-100c with 100mm f/2.2 lens, photorealistic skin pores, delicate subsurface scattering, high-contrast chiaroscuro lighting, ray-traced reflections, 8k resolution master --ar 3:4 --v 6.1 --style raw`,
    descriptionMd: `### Midjourney Visual Aesthetics
Combines classical Japanese kintsugi philosophy with high-tech cybernetics and high-end studio portrait photography.`,
    parameters: { model: 'midjourney-v7', ar: '3:4', stylize: 250, v: '6.1' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
        caption: 'Futuristic portrait combining traditional elegance with glowing cybernetics'
      }
    ],
    tags: ['cyberpunk', 'geisha', 'midjourney-v6', 'kintsugi', 'photorealism', 'portrait'],
    isFeatured: true,
  },
  {
    title: 'Cinematic Architectural Photography: High-Alpine Brutalist Observatory in Blizzard',
    slug: 'brutalist-alpine-observatory-blizzard',
    category: 'images',
    model: 'flux-1-dev',
    authorUsername: 'marcus_k',
    shortDesc: 'Monolithic cast-concrete astronomical observatory perched on an icy jagged mountain peak amidst swirling snowstorm.',
    fullPrompt: `Breathtaking architectural photography of a monolithic brutalist concrete astronomical observatory cantilevered over a sheer granite cliff in the Swiss Alps. Heavy swirling snow blizzard with crystalline snowflakes caught in motion. Warm golden interior light glows invitingly through massive geometric plate-glass windows. Raw textured concrete with visible timber formwork grain and icicles hanging from overhangs. Shot on Leica S3 medium format, 45mm lens, f/8, dramatic atmospheric perspective, moody winter twilight color palette.`,
    descriptionMd: `### FLUX.1 [dev] Prompt Design
Captures tangible concrete texture, alpine blizzard weather physics, and architectural scale.`,
    parameters: { model: 'flux-1-dev', guidance_scale: 3.5, steps: 35, aspect_ratio: '16:9' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
        caption: 'High-alpine snowcapped mountain peaks during winter blizzard'
      }
    ],
    tags: ['architecture', 'brutalism', 'alpine', 'flux-1-dev', 'photography', 'winter'],
  },
  {
    title: 'Macro Photography: Biomechanical Chameleon with Tourbillon Watchmaker Gears',
    slug: 'macro-biomechanical-chameleon-watchmaker-gears',
    category: 'images',
    model: 'midjourney-v7',
    authorUsername: 'elena_v',
    shortDesc: 'Intricate macro shot of a mechanical chameleon perched on a bronze branch, its skin made of polished watch escapements and rubies.',
    fullPrompt: `Extreme macro photography of a miniature biomechanical chameleon clinging to an antique brass watchmaker lathe. The chameleon scales are composed of thousands of polished steel watch gears, brass pinions, and glowing synthetic ruby bearings. Its iris is an intricate exposed tourbillon escapement mechanism with rotating balance wheel. Extreme shallow depth of field, f/2.8 macro lens, ring-light illumination catching metallic beveling and micro-scratches, Swiss horology craftsmanship, 8k resolution --ar 1:1 --v 6.1`,
    descriptionMd: `### Macro Horology Prompting
Generates micro-scale mechanical precision, polished metallurgy, and optical depth-of-field.`,
    parameters: { model: 'midjourney-v7', ar: '1:1', stylize: 300, v: '6.1' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
        caption: 'Intricate macro precision watchmaker gears and mechanical tourbillon'
      }
    ],
    tags: ['macro', 'steampunk', 'horology', 'midjourney-v6', 'biomechanical', 'close-up'],
  },
  {
    title: 'Haute Couture Vogue Editorial: Sculptural Prismatic Blown-Glass Gown',
    slug: 'haute-couture-prismatic-blown-glass-gown',
    category: 'images',
    model: 'midjourney-v7',
    authorUsername: 'sarah_design',
    shortDesc: 'Avant-garde fashion editorial of a runway model wearing an intricate translucent blown-glass gown refracting rainbow caustics.',
    fullPrompt: `High-fashion editorial photography for Vogue Paris. A high-fashion runway model wearing a breathtaking avant-garde gown sculpted entirely from hand-blown borosilicate glass and optical prisms. As directional studio spotlights illuminate the model against a dark seamless charcoal backdrop, the glass dress fractures light into mesmerizing rainbow caustics across the polished floor. Shot by Tim Walker on 8x10 large format film, ethereal surrealism, sculptural elegance, hyper-detailed glass textures --ar 4:5 --v 6.1`,
    descriptionMd: `### High-Fashion Vogue Prompt
Emulates editorial studio lighting, optical glass refraction, and avant-garde runway design.`,
    parameters: { model: 'midjourney-v7', ar: '4:5', stylize: 400, v: '6.1' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
        caption: 'Avant-garde haute couture model in sculpted runway gown'
      }
    ],
    tags: ['fashion', 'vogue', 'glass-art', 'midjourney-v6', 'couture', 'editorial'],
  },
  {
    title: 'Isometric 3D Cutaway: Solar-Powered Lunar Biosphere Research Station',
    slug: 'isometric-lunar-biosphere-station-cutaway',
    category: 'images',
    model: 'midjourney-v7',
    authorUsername: 'alexchen',
    shortDesc: 'Detailed 3D isometric cutaway cross-section of a futuristic self-sustaining lunar greenhouse and astronaut habitat.',
    fullPrompt: `3D isometric cross-section cutaway illustration of a futuristic lunar biosphere habitat dome. Inside the cutaway: hydroponic vertical farming spiraling up three levels under magenta grow lights, compact living quarters with modular sleep pods, scientific laboratory with microscopic culture incubators, and an airlock docking bay with an autonomous lunar rover. Outside the dome: dusty grey lunar regolith, solar array panels tracking the sun, and the bright blue marble of Earth hanging in black space. Octane render style, clean volumetric lighting, soft ambient occlusion, clay and glass materials --ar 16:9 --v 6.1`,
    descriptionMd: `### 3D Isometric Modeling Prompt
Produces architectural cutaway renders with Octane render ambient occlusion and soft pastel lighting.`,
    parameters: { model: 'midjourney-v7', ar: '16:9', stylize: 180, v: '6.1' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
        caption: 'Futuristic lunar station in outer space orbit around Earth'
      }
    ],
    tags: ['isometric', 'sci-fi', 'space-station', '3d-render', 'midjourney', 'octane-render'],
  },
  {
    title: 'Ethereal Bioluminescent Abyssal Coral Forest with Caustic God Rays',
    slug: 'ethereal-bioluminescent-abyssal-coral-forest',
    category: 'images',
    model: 'flux-1-dev',
    authorUsername: 'marcus_k',
    shortDesc: 'Deep-ocean underwater photography capturing surreal glowing neon coral structures and translucent jellyfish in deep blue abyss.',
    fullPrompt: `Underwater macro wide-angle photography in the Mariana Trench depth. A sprawling underwater forest of bioluminescent deep-sea corals pulsing with electric turquoise, magenta, and ultraviolet light. Translucent siphonophores and comb jellyfish drift silently between coral spires, shimmering with iridescence as water currents move. Divine cyan caustic god-rays filter down from distant moonlit surface water. Shot with underwater dome port on Nikon Z9, f/4, ISO 800, crystal-clear water clarity, awe-inspiring alien marine sanctuary.`,
    descriptionMd: `### Marine Bioluminescence Visual Guide
Engineered for FLUX.1 [dev] to reproduce water optical caustics, subsurface glow, and deep oceanic color grading.`,
    parameters: { model: 'flux-1-dev', guidance_scale: 4.0, steps: 30, aspect_ratio: '16:9' },
    media: [
      {
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80',
        caption: 'Bioluminescent deep ocean coral reef with ethereal underwater glow'
      }
    ],
    tags: ['underwater', 'bioluminescence', 'nature', 'flux-1-dev', 'coral', 'deep-sea'],
  },
];
