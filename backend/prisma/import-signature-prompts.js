"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Signature prompt library for OmniPrompt.
 *
 * Thirty hand-written prompts spread across all seven categories, weighted toward
 * Images and Videos because those two were the thinnest in the catalogue.
 *
 * Every prompt here is written to be *used*, not admired: each one states the role,
 * the inputs it needs as {placeholders}, the exact output shape, and the failure mode
 * it is guarding against. Image and video prompts carry the real platform syntax
 * (--ar / --v / --style, shot and lens language) rather than prose descriptions.
 *
 * Cover images are stock photographs used as reference/mood, not model output — the
 * captions say so. Replace them with real generations when you have them.
 *
 * Safe to re-run: prompts are deduplicated by slug.
 */
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const img = (id, caption) => [
    {
        type: 'IMAGE',
        url: `https://images.unsplash.com/${id}?w=1200&auto=format&fit=crop&q=80`,
        caption,
    },
];
const SIGNATURE_PROMPTS = [
    // =========================================================================
    // 1. IMAGES
    // =========================================================================
    {
        title: 'Seamless-Sweep Product Hero — Studio Lighting Control',
        slug: 'seamless-sweep-product-hero-studio-lighting',
        category: 'images',
        model: 'flux-1-pro',
        authorUsername: 'elena_v',
        shortDesc: 'A product hero shot where you control the light, not the model — key, fill, rim and surface finish are each stated separately so results stay consistent across a whole catalogue.',
        fullPrompt: `Commercial product photograph of {product} on a seamless {backdrop_color} sweep.

LIGHTING
Key: large softbox, 45° camera-left, slightly above product height, soft-edged shadow falling camera-right.
Fill: white bounce card camera-right at 1/3 key power — shadows stay open, never black.
Rim: narrow strip light directly behind, raking the top edge to separate product from backdrop.

SURFACE AND MATERIAL
{material_description} — render the actual finish: specular highlights follow the form, no plastic uniformity. Micro-texture visible at 100% crop.

CAMERA
85mm macro equivalent, f/8 for full product sharpness, shot at product mid-height so the silhouette reads true. No perspective distortion.

FRAME
Product occupies 65% of frame height, centred, generous negative space above for headline type. Horizon of the sweep falls behind the product, not visible as a hard line.

Colour: neutral white balance, no colour cast on the backdrop.

--ar 4:5 --style raw`,
        descriptionMd: `### Why this one works
Most product prompts describe a *mood* ("beautiful studio lighting") and then fight the model for consistency. This one describes a **lighting setup** — three named sources with position and relative power — which is what a photographer would actually brief. The same structure produces a matched set across twenty SKUs.

### Fill in
- \`{product}\` — be specific about form: "a matte ceramic pour-over coffee dripper"
- \`{backdrop_color}\` — "warm grey (#d8d4cf)" beats "neutral"
- \`{material_description}\` — the single highest-leverage field. "Unglazed stoneware, fine sandy grain, light absorbs rather than reflects"

### Pro-tips
- Keep \`--style raw\` on. Midjourney's default aesthetic adds a gloss that reads as stock.
- For a catalogue, lock the seed and change only \`{product}\`.
- If the backdrop gradient is too dramatic, add \`even backdrop illumination, no vignette\`.`,
        parameters: { model: 'flux-1-pro', aspect_ratio: '4:5', guidance: 3.5, steps: 40, style: 'raw' },
        media: img('photo-1523275335684-37898b6baf30', 'Reference: product on seamless studio sweep'),
        tags: ['Product Photography', 'Studio Lighting', 'E-commerce', 'Flux'],
        isFeatured: true,
    },
    {
        title: 'Character Turnaround Sheet — Lock a Face Across Every Shot',
        slug: 'character-turnaround-sheet-consistency',
        category: 'images',
        model: 'midjourney-v7',
        authorUsername: 'elena_v',
        shortDesc: 'Generates a four-angle reference sheet of one character so the same face survives across an entire storyboard instead of drifting shot to shot.',
        fullPrompt: `Character reference sheet, four views of the SAME person on one neutral grey sheet: front, 3/4 left, profile left, back of head.

CHARACTER
{age} {build} {gender_presentation}, {ethnicity_or_features}. Face: {face_shape}, {eye_description}, {nose_description}, {mouth_description}. Hair: {hair_description}. Distinguishing mark: {one_memorable_detail}.

WARDROBE
{outfit} — identical across all four views, same fold and drape.

RENDER
Flat even lighting, no dramatic shadow, no mood. This is a technical reference, not a portrait.
Consistent head size across all four views, aligned on a shared horizon line.
Neutral expression. Eyes to camera in the front view only.
Full head and shoulders. No crop at the chin.

Photorealistic, 50mm, f/5.6, no bokeh.

--ar 16:9 --style raw --s 50`,
        descriptionMd: `### What this solves
Character drift. You generate a great protagonist, then shot 7 has a different nose and the sequence falls apart.

### How to use it
1. Run this first. Regenerate until the sheet is genuinely one person from four angles.
2. Upscale it and keep the URL.
3. In every subsequent shot prompt, lead with that image as a reference (\`--cref <url> --cw 80\` on Midjourney).
4. \`--cw 80\` holds the face but lets wardrobe and lighting change. Drop to \`--cw 40\` if the outfit needs to vary.

### The one field that matters most
\`{one_memorable_detail}\` — a chipped front tooth, a scar through one eyebrow, a specific pair of glasses. Models anchor to the unusual feature; generic descriptions drift. Give it exactly one.

### Known failure
If the four views come back as four different people, the description is too generic. Add more structural detail (face shape, jaw, brow) and less adjective ("beautiful", "striking" do nothing).`,
        parameters: { model: 'midjourney-v7', aspect_ratio: '16:9', stylize: 50, style: 'raw', version: 7 },
        media: img('photo-1494790108377-be9c29b29330', 'Reference: neutral character portrait study'),
        tags: ['Character Design', 'Consistency', 'Storyboarding', 'Midjourney'],
        isFeatured: true,
    },
    {
        title: 'Film Stock Emulation — Portra, Cinestill and Tri-X by the Numbers',
        slug: 'film-stock-emulation-portra-cinestill-trix',
        category: 'images',
        model: 'midjourney-v7',
        authorUsername: 'elena_v',
        shortDesc: 'Describes film by its actual behaviour — grain structure, halation, highlight rolloff, colour bias — instead of asking for a vague "film look" and getting an Instagram filter.',
        fullPrompt: `{subject_and_scene}, photographed on {film_stock}.

FILM CHARACTERISTICS — render these, do not merely imply them:
{film_stock_behaviour}

EXPOSURE
Shot at box speed, metered for the shadows. Highlights roll off gently and never clip to pure white. Deepest shadow sits at roughly 12% grey, not black — film does not have digital's black floor.

GRAIN
Visible at 100%, tighter in the shadows, looser in the midtones. Organic and irregular — never a uniform noise overlay.

LENS
{focal_length} at {aperture}. Period-correct optics: slight corner falloff, gentle field curvature, no clinical digital sharpness.

No HDR. No clarity slider. No digital sharpening halo.

--ar 3:2 --style raw --s 100`,
        descriptionMd: `### Paste one of these into \`{film_stock_behaviour}\`

**Kodak Portra 400** — "Warm, restrained saturation. Skin tones pull slightly peach. Greens muted toward olive. Enormous highlight latitude; whites hold detail well past where digital would blow. Fine grain."

**Cinestill 800T** — "Tungsten-balanced, so daylight reads cool blue and practical lights glow warm. Halation: red bloom around every bright point source — streetlights, neon, headlights — because the anti-halation layer is removed. Coarse, visible grain."

**Kodak Tri-X 400** — "Black and white. Contrasty with crushed-but-detailed shadows. Pronounced, gritty grain that sharpens the sense of texture. Midtones compress; the image lives in its blacks and whites."

**Fuji Pro 400H** — "Cool and airy. Greens and cyans lift. Skin stays neutral-to-cool. Pastel highlight rendering, famously flattering in overcast light."

### Why spell it out
"Shot on film" gets you a sepia filter. "Red halation bloom around point sources because the anti-halation layer is removed" gets you Cinestill, because the model has seen that described in the data it learned from.`,
        parameters: { model: 'midjourney-v7', aspect_ratio: '3:2', stylize: 100, style: 'raw', version: 7 },
        media: img('photo-1515694346937-94d85e41e6f0', 'Reference: warm window light, film-like rolloff'),
        tags: ['Film Emulation', 'Photography', 'Color Grading', 'Midjourney'],
    },
    {
        title: 'Legible Infographic — Typography That Survives Generation',
        slug: 'legible-infographic-typography-diagram',
        category: 'images',
        model: 'flux-1-pro',
        authorUsername: 'alexchen',
        shortDesc: 'A diagram prompt built around the one thing image models are worst at — readable text — by limiting word count, fixing hierarchy and quoting every string exactly.',
        fullPrompt: `Clean editorial infographic explaining {concept}. Flat vector style, no photographic elements.

TEXT — render these strings EXACTLY as quoted, spelled correctly:
Title: "{title_max_5_words}"
Labels, in order: "{label_1}", "{label_2}", "{label_3}"
No other text anywhere in the image. No lorem ipsum, no decorative glyphs, no watermark.

LAYOUT
{layout_description}
Generous white space. Elements aligned to an invisible 12-column grid.
Title sits top-left, substantially larger than labels. Labels are equal weight to each other.

TYPOGRAPHY
Single geometric sans-serif throughout. Two sizes only: title and label. Tight letter-spacing on the title, normal on labels. High contrast against the background — no grey-on-grey.

COLOUR
Background {background_color}. One accent colour {accent_color} used sparingly for emphasis only. Everything else neutral.

Style reference: Pentagram editorial diagram, Swiss grid discipline, zero decoration.

--ar 3:2 --style raw`,
        descriptionMd: `### The hard constraint
Image models degrade fast past about five words per text element. This prompt enforces that: a title capped at five words, exactly three labels, and an explicit "no other text" clause — which is what actually stops the model inventing garbled filler captions.

### Quote your strings
Put every piece of text in straight quotes. Unquoted text gets interpreted as a description of what to draw; quoted text gets interpreted as text to render. This single habit roughly halves spelling errors.

### Model choice
Flux.1 Pro and Ideogram are meaningfully better at typography than Midjourney. If the text still comes out wrong after three attempts, generate the diagram without text and set the type yourself — that is the professional workflow, not a failure.

### Layout snippets
- \`"Three horizontal stages connected by arrows, left to right"\`
- \`"A central circle with three satellites, connected by thin radial lines"\`
- \`"Two columns compared side by side with a vertical divider"\``,
        parameters: { model: 'flux-1-pro', aspect_ratio: '3:2', guidance: 3, steps: 35, style: 'raw' },
        media: img('photo-1488590528505-98d2b5aba04b', 'Reference: editorial diagram on tablet'),
        tags: ['Infographic', 'Typography', 'Vector', 'Flux'],
    },
    {
        title: 'Architectural Interior — Real Materials, Real Time of Day',
        slug: 'architectural-interior-materials-daylight',
        category: 'images',
        model: 'sd3-5-large',
        authorUsername: 'elena_v',
        shortDesc: 'An interior visualisation prompt that names the materials, the sun angle and the artificial lights separately, so the render reads as a photograph rather than a games engine.',
        fullPrompt: `Interior architectural photograph of {space_type}, {architectural_style}.

ARCHITECTURE
{spatial_description}. Ceiling height {ceiling_height}. {key_architectural_feature}.

MATERIALS — name the finish, not just the material:
Floor: {floor_material}
Walls: {wall_material}
Ceiling: {ceiling_material}
Joinery: {joinery_material}

DAYLIGHT
{time_of_day}. Sun enters through {window_description} at a low/high angle, casting {shadow_quality} across the floor. Light bounces off the {bounce_surface}, filling the far side of the room with soft indirect illumination.

ARTIFICIAL LIGHT
{artificial_lighting} — warm (2700K) against the cooler daylight, visibly on but not overpowering.

CAMERA
24mm tilt-shift at eye height (1.6m). Verticals perfectly parallel — no converging lines. f/8. Composed one-point, the far wall square to camera.

Dust motes visible in the light shafts. Lived-in, not staged: {one_human_trace}.

--ar 3:2 --style raw`,
        descriptionMd: `### The two details that sell it
**Mixed colour temperature.** Real interiors have cool daylight *and* warm lamps at the same time. Renders that pick one read as CGI. The prompt forces both.

**\`{one_human_trace}\`.** A book left open, a mug on the counter, a coat over a chair. Architectural renders look fake because they're empty. One object does more than a hundred words of "photorealistic, 8k, ultra detailed".

### Material phrasing
Bad: "wood floor". Good: "wide-plank white oak, matte hardwax oil, visible grain and knots".
Bad: "concrete walls". Good: "board-formed concrete, horizontal timber grain impressed, tie-holes left exposed".

### Verticals
The tilt-shift instruction matters. Without it you get converging verticals, which instantly reads as a phone snapshot instead of architectural photography.`,
        parameters: { model: 'sd3-5-large', aspect_ratio: '3:2', cfg_scale: 4.5, steps: 45, sampler: 'dpmpp_2m' },
        media: img('photo-1600585154340-be6161a56a0c', 'Reference: brutalist concrete interior'),
        tags: ['Architecture', 'Interior', 'Visualization', 'Stable Diffusion'],
    },
    // =========================================================================
    // 2. VIDEOS
    // =========================================================================
    {
        title: 'Single-Take Product Reveal — Camera Choreography in One Shot',
        slug: 'single-take-product-reveal-camera-choreography',
        category: 'videos',
        model: 'sora',
        authorUsername: 'elena_v',
        shortDesc: 'One unbroken move from detail to hero, written as a timed sequence of camera instructions so the model produces deliberate choreography instead of random drift.',
        fullPrompt: `Single continuous take, no cuts. {duration} seconds.

SUBJECT
{product} resting on {surface} in {environment}.

CAMERA MOVE — one unbroken motion, timed:
0.0-2.0s — Macro detail. Lens close on {detail_element}, shallow focus, only a sliver sharp.
2.0-4.5s — Slow dolly back and arc camera-left, revealing the full form. Focus pulls to hold the product sharp throughout the move.
4.5-{duration}s — Settle into the hero frame: product centred, three-quarter view, slight low angle. Motion decelerates to a rest, never a hard stop.

The move is smooth and motivated, as if on a motion-control rig. No handheld shake. No speed ramp.

LIGHT
{lighting_description}. Light is consistent through the move — no flicker, no exposure shift.

ATMOSPHERE
{atmosphere_element} drifting slowly through the frame, catching the light.

Shallow depth of field throughout. 50mm. Shot on {camera_look}.`,
        descriptionMd: `### Why the timecodes
Video models given "camera slowly moves around the product" invent their own path, and it's rarely the one you wanted. Breaking the shot into timed segments gives the model a trajectory. It won't hit the marks exactly, but the *shape* of the move survives.

### Keep it to one move
The single most common mistake is asking for a dolly *and* a crane *and* an orbit in six seconds. Pick one continuous motion with one change of direction at most. Complexity is where these models fall apart.

### Fill in
- \`{detail_element}\` — "the knurled edge of the dial", "condensation beading on the glass"
- \`{atmosphere_element}\` — "fine dust", "steam", "pollen". Gives the model something to animate, which hides frame interpolation artefacts.
- \`{camera_look}\` — "ARRI Alexa, Cooke S4 primes" reads differently from "iPhone 15 Pro". Both are useful; pick on purpose.

### Expect to iterate
Budget 5-10 generations per usable shot. That is normal for this medium, not a sign the prompt is wrong.`,
        parameters: { model: 'sora', duration_seconds: 8, aspect_ratio: '16:9', resolution: '1080p', motion: 'low' },
        media: img('photo-1578632767115-351597cf2477', 'Reference: volumetric light on product form'),
        tags: ['Product Video', 'Camera Movement', 'Commercial', 'Sora'],
        isFeatured: true,
    },
    {
        title: 'B-Roll Cutaway Pack — Six Shots That Actually Cut Together',
        slug: 'b-roll-cutaway-pack-matching-coverage',
        category: 'videos',
        model: 'runway-gen-3-alpha',
        authorUsername: 'elena_v',
        shortDesc: 'Generates a set of cutaways that share one lighting state, palette and lens so they edit together as coverage of a single place — the thing ad-hoc B-roll never does.',
        fullPrompt: `Generate as SIX separate clips. Every clip shares the constants below — this is coverage of one location at one moment, not six unrelated shots.

CONSTANTS — identical in every clip:
Location: {location}
Time and light: {time_of_day}, {light_quality}
Palette: {three_colours}
Lens: {focal_length}, shallow depth of field
Grade: {grade_description}
Camera: locked off or very slow drift only. No whip pans, no zooms.

CLIP 1 — Wide establishing. The space entire, {subject} small in frame.
CLIP 2 — Medium. {subject} working, from the waist up, three-quarter angle.
CLIP 3 — Macro detail. {hands_or_tool_detail}, filling the frame.
CLIP 4 — Over-the-shoulder. Looking past {subject} at {what_they_are_looking_at}.
CLIP 5 — Texture insert. {surface_or_material}, raking light across it, slow drift.
CLIP 6 — Atmosphere. {ambient_element} — steam, dust, light through a window — no subject.

Each clip 4 seconds. No camera movement that calls attention to itself. These are cutaways; they serve an edit.`,
        descriptionMd: `### The problem this fixes
Generated B-roll usually can't be cut together. Clip one is golden hour, clip two is overcast, clip three has a different colour grade — so the sequence reads as a slideshow of stock footage.

The fix is declaring the constants once at the top and making every clip inherit them. Lighting, palette, lens, grade. Those four matching is what makes an audience read six shots as one place.

### Shot grammar
The six-shot structure is standard documentary coverage: wide to establish, medium for the subject, macro for texture, OTS for point of view, insert for cutting room flexibility, atmosphere for breathing room. An editor can build a 30-second sequence from these and always have somewhere to cut.

### Running it
Submit each clip as its own generation with the constants block pasted at the top of each. Don't try to get six shots from one prompt — you'll get one shot with six awkward cuts.`,
        parameters: { model: 'runway-gen-3-alpha', duration_seconds: 4, clips: 6, aspect_ratio: '16:9', motion_score: 3 },
        media: img('photo-1504384308090-c894fdcc538d', 'Reference: workspace coverage'),
        tags: ['B-Roll', 'Documentary', 'Editing', 'Runway'],
    },
    {
        title: 'Macro Liquid and Food — Slow Motion Where Physics Reads True',
        slug: 'macro-liquid-food-slow-motion-physics',
        category: 'videos',
        model: 'sora',
        authorUsername: 'elena_v',
        shortDesc: 'Food and liquid in high-speed macro, with the viscosity, surface tension and frame rate stated explicitly so the motion obeys physics instead of floating.',
        fullPrompt: `High-speed macro, {frame_rate}fps played back at 24fps. {duration} seconds of real time stretched to slow motion.

ACTION
{liquid_or_food} {action_verb} onto/into {target}.

PHYSICS — these are the make-or-break details:
Viscosity: {viscosity_description}. The flow {flow_behaviour}.
Surface tension: droplets form {droplet_description} before they separate.
Impact: on contact, {impact_behaviour} — crown splash, slow spread, or absorption.
Gravity reads correctly at this frame rate: the fall is heavy and continuous, never floaty.

CAMERA
100mm macro, f/4, locked off. Focus plane sits exactly on {focus_point}; everything 2cm in front or behind falls off.

LIGHT
Hard backlight raking through the {liquid_or_food} so it glows at the edges and translucency is visible. Black negative fill camera-left for a defined specular edge. Background {background_description}, two stops under.

Clean plate. No hands, no props, nothing else in frame.`,
        descriptionMd: `### Where generated food video fails
Motion that ignores mass. Honey that pours like water, cream that floats, a splash that never resolves. The fix is describing the *physical behaviour* rather than the substance.

### Viscosity phrasing
- Water: "thin, breaks into droplets immediately, splashes with a defined crown"
- Honey: "thick and continuous, forms an unbroken ribbon that coils as it lands, surface slow to level"
- Cream: "opaque and heavy, folds into itself, holds soft peaks at the edge of the pour"
- Molten chocolate: "glossy, slow-flowing, holds a visible ridge where it meets the surface"

### Frame rate
State it. \`1000fps\` and \`240fps\` produce visibly different motion — the first is a droplet hanging in air, the second is recognisably fast-but-slowed. Pick for the feeling you want.

### Backlight is non-negotiable
Front-lit liquid looks like plastic. Backlight is what makes translucency and edge glow visible, and it's the single biggest difference between amateur and commercial food footage.`,
        parameters: { model: 'sora', duration_seconds: 5, frame_rate: 240, aspect_ratio: '16:9', resolution: '1080p' },
        media: img('photo-1517245386807-bb43f82c33c4', 'Reference: backlit liquid macro'),
        tags: ['Food', 'Macro', 'Slow Motion', 'Sora'],
    },
    {
        title: 'Aerial Establishing Shot — Altitude, Heading and Reveal',
        slug: 'aerial-establishing-shot-altitude-heading-reveal',
        category: 'videos',
        model: 'runway-gen-3-alpha',
        authorUsername: 'alexchen',
        shortDesc: 'Drone language written the way a pilot would brief it — altitude, heading, airspeed and the moment of reveal — so the shot arrives somewhere instead of wandering.',
        fullPrompt: `Aerial drone shot, {duration} seconds, single continuous take.

FLIGHT PATH
Start: {start_altitude}m above {start_position}, camera pitched {start_pitch}° down, heading {start_heading}.
Move: {flight_move} at slow airspeed — the horizon stays level throughout, no yaw wobble.
End: {end_altitude}m, camera pitched {end_pitch}°, {subject} now {final_framing}.

THE REVEAL
At roughly {reveal_timing}, {reveal_description}. This is the shot's purpose — everything before it is setup.

LANDSCAPE
{landscape_description}. {weather_and_atmosphere}.

LIGHT
{time_of_day}. Sun {sun_position}, raking low across the terrain so every ridge casts a long shadow and the topography reads in three dimensions.

CAMERA
Wide, 24mm equivalent. Deep focus — everything sharp from foreground to horizon. Slight atmospheric haze at distance for depth separation.

Smooth gimbal. No jitter, no sudden corrections, no digital zoom.`,
        descriptionMd: `### Why pilot language
"Drone shot over mountains" produces a slow drift with no destination. Stating altitude, pitch and heading at the start *and* the end gives the model two anchor points and a path between them — the shot acquires intent.

### The reveal is the shot
Every good establishing shot has one moment where new information arrives: cresting a ridge to find a valley, rising above a treeline to expose a coastline, pushing through cloud to reveal a city. Name it and time it. Without it you have footage, not a shot.

### Flight moves worth knowing
- **Reveal climb** — rise from low over an obstacle to expose what's behind
- **Push-in descent** — high and wide, dropping toward the subject as it fills the frame
- **Orbit** — constant radius around a fixed subject, best under 180° of arc
- **Follow** — track a moving subject at matched speed, fixed offset

### Low sun
Overhead sun flattens terrain into a map. Low sun creates the shadows that make landscape read as three-dimensional. Shoot the golden hour, even in a prompt.`,
        parameters: { model: 'runway-gen-3-alpha', duration_seconds: 10, aspect_ratio: '16:9', motion_score: 5 },
        media: img('photo-1519681393784-d120267933ba', 'Reference: alpine terrain from altitude'),
        tags: ['Aerial', 'Drone', 'Landscape', 'Runway'],
    },
    {
        title: 'Three-Shot Micro-Narrative — A Story That Survives the Cut',
        slug: 'three-shot-micro-narrative-continuity',
        category: 'videos',
        model: 'sora',
        authorUsername: 'elena_v',
        shortDesc: 'A complete beginning-middle-end in three generated shots, with a continuity block that keeps character, wardrobe and light identical across all three.',
        fullPrompt: `A three-shot sequence telling one complete beat. Generate each shot separately; the CONTINUITY block is identical in all three.

=== CONTINUITY — paste verbatim into every shot ===
Character: {character_description_with_one_distinctive_feature}
Wardrobe: {specific_outfit_including_colours}
Location: {location}
Time and light: {time_of_day}, {light_direction_and_quality}
Grade: {colour_grade}
Lens: {focal_length} throughout
=== END CONTINUITY ===

SHOT 1 — SETUP ({duration_1}s)
{wide_or_medium} shot. {character} {setup_action}. Camera {camera_1}.
Establishes where we are and what the character wants.

SHOT 2 — TURN ({duration_2}s)
{closer_framing}. {the_thing_that_changes}. Camera {camera_2}.
This is the hinge. Something is noticed, decided, or interrupted.

SHOT 3 — RESOLUTION ({duration_3}s)
{final_framing}. {character_response}. Camera {camera_3}.
The consequence. End on a held frame, not mid-motion — it needs somewhere to cut.

Match action across cuts: if the character is reaching at the end of shot 2, they are still reaching at the start of shot 3.`,
        descriptionMd: `### The continuity block
Copy it unchanged into all three generations. The moment you paraphrase it, the model re-rolls the character and the sequence stops being about one person.

Include **one distinctive feature** in the character description — a red scarf, wire-rimmed glasses, a shaved head. Models anchor to the specific and drift on the general.

### Why three shots
Three is the minimum for a story: a state, a change, a consequence. Two reads as an accident. Four or more and the continuity drift becomes impossible to hide.

### End on a held frame
Shot 3 should settle before the clip ends. A clip that ends mid-motion gives an editor nowhere to cut, and generated video has no handles to trim into.

### Realistic expectations
Even with the continuity block, expect noticeable drift between shots. Shoot the sequence so the character is partly turned away or distant in at least one shot — it hides the mismatch, and it's what a real director would do with a difficult actor anyway.`,
        parameters: { model: 'sora', shots: 3, duration_seconds: 15, aspect_ratio: '16:9', resolution: '1080p' },
        media: img('photo-1509198397868-475647b2a1e5', 'Reference: figure in rain-lit street'),
        tags: ['Narrative', 'Continuity', 'Short Film', 'Sora'],
    },
    // =========================================================================
    // 3. APPLICATIONS
    // =========================================================================
    {
        title: 'Legacy Code Archaeology — Understand Before You Touch',
        slug: 'legacy-code-archaeology-risk-tiered-refactor',
        category: 'applications',
        model: 'claude-3-7-sonnet',
        authorUsername: 'sarah_connor',
        shortDesc: 'Maps an unfamiliar module before changing it — behaviour, hidden contracts, and a refactor plan tiered by blast radius rather than by what looks ugliest.',
        fullPrompt: `You are reviewing unfamiliar production code that you must not break. Someone depends on every behaviour here, including the accidental ones.

CODE
\`\`\`
{paste_the_module}
\`\`\`

CONTEXT
Language/framework: {stack}
What it's believed to do: {stated_purpose}
Known consumers: {who_calls_this}
Test coverage: {coverage_situation}

Produce, in this order:

**1. WHAT IT ACTUALLY DOES**
Plain prose, one paragraph. Not a restatement of the code — the behaviour an outside caller would observe.

**2. IMPLICIT CONTRACTS**
Behaviours callers may depend on that aren't documented or tested. Argument mutation, ordering guarantees, thrown exception types, null-vs-undefined distinctions, timing assumptions. These are what refactors break.

**3. DIVERGENCE FROM STATED PURPOSE**
Where the code does something other than what it's believed to do. Quote the line and say what the gap is.

**4. REFACTOR PLAN — TIERED BY BLAST RADIUS**
- *Safe*: internal only, no observable change. Can ship alone.
- *Contained*: changes behaviour within this module's tests. Needs test updates.
- *Breaking*: changes the contract. Needs a migration path and a consumer audit.
For each: what, why, and what would have to be true to do it safely.

**5. WHAT YOU WOULD NOT TOUCH**
Code that looks wrong but probably encodes a real requirement someone forgot to write down. Say why you suspect that.

Rules: quote the specific line for every claim. If you cannot tell what something does, say so — do not guess. Say "no issues found" where that's true rather than manufacturing findings.`,
        descriptionMd: `### What makes this different
Most refactor prompts rank problems by severity. This one ranks them by **blast radius** — which is the question that actually governs what you can ship on a Tuesday afternoon.

### Section 5 is the important one
Asking the model what it *would not* change is the highest-value part. Legacy code is full of things that look like bugs and are load-bearing: a weird retry count that matches a vendor's rate limit, a null check for a case that happened once in production at 3am. A model told to find problems will "fix" these. Told to identify them as probable requirements, it often catches the reasoning.

### Fill in honestly
\`{coverage_situation}\` — "no tests" changes the entire answer versus "95% branch coverage". Say which it is; the tiering depends on it.

### Works well with
Run this before any large AI-assisted refactor. The implicit-contracts section alone catches the class of breakage that passes CI and fails in production.`,
        parameters: { model: 'claude-3-7-sonnet', temperature: 0.2, max_tokens: 4000, thinking: 'extended' },
        media: img('photo-1558494949-ef010cbdcc31', 'Reference: server infrastructure'),
        tags: ['Refactoring', 'Legacy Code', 'Code Review', 'Claude'],
        isFeatured: true,
    },
    {
        title: 'API Design Review — Before the Contract Is Public',
        slug: 'api-design-review-before-contract-public',
        category: 'applications',
        model: 'gpt-4o',
        authorUsername: 'sarah_connor',
        shortDesc: 'Reviews an API surface for the mistakes that become permanent the moment a client ships — naming, pagination, error shape, and the versioning you cannot add later.',
        fullPrompt: `Review this API design as though it ships tomorrow and can never change without a major version bump.

API SURFACE
\`\`\`
{paste_endpoints_or_schema}
\`\`\`

CONTEXT
Consumers: {internal_only_or_public}
Expected scale: {requests_and_data_volume}
Auth model: {auth_approach}

Review against these, in order. For each finding give the specific endpoint, the problem, and the concrete fix:

**1. RESOURCE MODELLING**
Do the nouns match the domain? Are there endpoints that are really verbs in disguise? Is anything that should be one resource split across three?

**2. NAMING CONSISTENCY**
Plural vs singular, snake vs camel, \`id\` vs \`{resource}_id\`, date field conventions. Inconsistency here is the complaint every API gets and the one that can never be fixed.

**3. PAGINATION, FILTERING, SORTING**
Does every collection endpoint paginate? Cursor or offset, and is that right for the access pattern? What happens at 10,000 items?

**4. ERROR DESIGN**
One error shape everywhere? Machine-readable codes separate from human messages? Does a validation failure tell the client which field failed? Are 4xx and 5xx used correctly?

**5. EVOLUTION**
What can be added without breaking clients? What is now permanent? Flag every place a field's type or nullability is about to become load-bearing.

**6. WHAT WILL GENERATE SUPPORT TICKETS**
The things that are technically fine but will confuse every integrator. Be specific.

End with the three changes that matter most, ranked. Ignore style preferences that don't affect consumers.`,
        descriptionMd: `### The framing does the work
"Ships tomorrow, can never change" is the whole trick. It shifts the review from *is this good* to *what will we regret*, which is the only question that matters for a public contract.

### Section 5 earns its place
Adding a field is safe. Making an optional field required is not. Changing a string to an object is not. Most teams discover which is which after a client has shipped. This section surfaces it while it's still free.

### Give it real context
\`{internal_only_or_public}\` changes almost every answer. An internal API can break its consumers with a Slack message; a public one cannot. Say which.

### Pairs with
Run against an OpenAPI spec rather than prose — the model catches far more when it can see types and nullability.`,
        parameters: { model: 'gpt-4o', temperature: 0.3, max_tokens: 3500 },
        media: img('photo-1544197150-b99a580bb7a8', 'Reference: distributed network topology'),
        tags: ['API Design', 'REST', 'Architecture', 'GPT-4o'],
    },
    {
        title: 'Bug Report to Failing Test — Reproduce Before You Fix',
        slug: 'bug-report-to-failing-test-reproduction',
        category: 'applications',
        model: 'cursor-composer',
        authorUsername: 'marcus_dev',
        shortDesc: 'Turns a vague bug report into a test that fails for the right reason, plus the regression cases around it — the discipline that stops a fix from being a guess.',
        fullPrompt: `Turn this bug report into failing tests. Do not fix the bug yet.

BUG REPORT
{paste_the_report_however_vague}

CODE UNDER TEST
\`\`\`
{paste_relevant_code}
\`\`\`

TEST SETUP
Framework: {test_framework}
Existing conventions: {how_tests_are_written_here}

Produce:

**1. WHAT'S ACTUALLY BEING CLAIMED**
Restate the bug as a precise statement: given this input and this state, the system does X but should do Y. If the report is too vague to do this, list exactly what you'd need to ask the reporter — don't invent the missing detail.

**2. THE REPRODUCTION TEST**
One test that fails *because of this bug* and would pass once it's fixed. It must fail for the right reason — not because of a typo, a missing mock, or a wrong assertion. Name it after the behaviour, not the ticket number.

**3. THE BOUNDARY CASES**
Tests either side of the bug: the nearest input that works correctly today, and the case just past the broken one. These tell you how wide the bug actually is, which is usually wider than reported.

**4. THE REGRESSION GUARD**
What else touches this code path and must keep working? Write the test that would catch a fix that breaks it.

**5. YOUR HYPOTHESIS**
One paragraph on the likely cause, with the line you'd look at first. Mark it clearly as a hypothesis — the tests are the evidence, this is not.

Match the existing test file's style exactly: same imports, same naming, same setup helpers.`,
        descriptionMd: `### Why no fix
Asking for the fix in the same breath as the test gets you a test written to pass the fix the model already had in mind. Writing the test first, from the report alone, keeps it honest — and the test is the artefact that outlives the fix.

### "Fails for the right reason"
The most common failure in AI-generated tests is a test that fails because the mock is wrong, then "passes" after a fix that changed nothing relevant. The instruction is explicit for that reason. Always run the test before the fix and read the failure message.

### Section 3 finds the real bug
Reported bugs are almost always narrower than actual bugs. The reporter hit one input; the boundary tests find out whether the whole range is broken. This is where a 10-minute fix turns into the right fix.

### Works with
Cursor Composer or Claude Code, with the test file open so conventions are picked up automatically.`,
        parameters: { model: 'cursor-composer', temperature: 0.2, mode: 'composer', context: 'test file + source' },
        media: img('photo-1563986768609-322da13575f3', 'Reference: automated code analysis'),
        tags: ['Testing', 'Debugging', 'TDD', 'Cursor'],
    },
    {
        title: 'Schema and Migration Plan From Product Requirements',
        slug: 'schema-migration-plan-from-requirements',
        category: 'applications',
        model: 'deepseek-r1',
        authorUsername: 'marcus_dev',
        shortDesc: 'Turns a feature description into a normalised schema, the indexes the queries actually need, and a migration sequence that is safe to run against a live table.',
        fullPrompt: `Design the data model for this feature, then the migration path to get there from the current schema.

THE FEATURE
{what_it_needs_to_do}

ACCESS PATTERNS — the queries this must serve:
{list_the_reads_and_writes_with_rough_frequency}

CURRENT SCHEMA
\`\`\`
{paste_existing_relevant_tables}
\`\`\`

CONSTRAINTS
Database: {postgres_mysql_etc}
Current row counts: {approximate_table_sizes}
Downtime tolerance: {zero_or_maintenance_window}

Produce:

**1. THE MODEL**
Tables, columns, types, nullability, foreign keys. Justify every nullable column — nullable-by-default is how data models rot.

**2. WHERE YOU DENORMALISED, AND WHY**
If you duplicated anything for read performance, say so explicitly and name the write path that must keep it in sync. If you denormalised nothing, say that.

**3. INDEXES**
One per access pattern listed above, with the query it serves. Composite column order matters — explain it. Flag any index that will be expensive to build on the current row counts.

**4. MIGRATION SEQUENCE**
Numbered steps, each independently deployable and reversible. For each: the DDL, whether it locks the table, roughly how long at the stated row counts, and the rollback.
Follow expand-contract: add new structures, backfill, dual-write, switch reads, then drop the old. Never a step that requires code and schema to change simultaneously.

**5. WHAT BREAKS UNDER LOAD**
The query that goes quadratic, the lock that blocks writes, the backfill that fills the disk. Be concrete about which step and at what scale.

If the access patterns are too vague to index against, say what you need to know instead of guessing.`,
        descriptionMd: `### Access patterns first
A schema is only correct relative to the queries it serves. The prompt demands those up front, which forces the useful conversation: most people discover halfway through listing their reads that the model they had in mind doesn't support one of them.

### Expand-contract
Step 4 enforces the only migration pattern that is safe with live traffic. Every step deploys on its own, and at no point do the code and the schema have to change in the same release. This is what makes zero-downtime migrations possible, and it's the part people skip.

### Nullable columns
The "justify every nullable column" rule catches more future bugs than any other line here. Nullable usually means "we weren't sure", and that uncertainty ends up in application code as defensive checks forever.

### Model note
DeepSeek R1 and other reasoning models are well suited here — the migration sequencing genuinely benefits from step-by-step working.`,
        parameters: { model: 'deepseek-r1', temperature: 0.3, max_tokens: 4000, reasoning: 'high' },
        media: img('photo-1551836022-4c4c79ecde51', 'Reference: analytics and planning session'),
        tags: ['Database', 'Schema Design', 'Migrations', 'DeepSeek'],
    },
    // =========================================================================
    // 4. UI/UX
    // =========================================================================
    {
        title: 'Design Token Audit From a Screenshot',
        slug: 'design-token-audit-from-screenshot',
        category: 'ui-ux',
        model: 'claude-3-7-sonnet',
        authorUsername: 'elena_v',
        shortDesc: 'Extracts the real design system out of an existing interface — including every inconsistency the team has accumulated — and returns tokens you can paste into CSS.',
        fullPrompt: `Audit the design system in this interface. Attached: {screenshot_or_screenshots}.

Extract what is *actually* there, including the inconsistencies. Do not tidy them up silently.

**1. COLOUR**
Every distinct value you can identify, grouped by role: background layers, surfaces, borders, text (primary/secondary/disabled), accent, semantic (success/warning/error).
Flag near-duplicates — two greys three hex values apart are a mistake, not a decision.
Return as CSS custom properties.

**2. TYPE SCALE**
Every distinct size, weight and line-height in use. Lay them out as a scale and mark the ones that don't fit the ratio. Name them by role (display, heading-1, body, caption), not by pixel value.

**3. SPACING**
The spacing values in use. Identify the base unit and flag every value that isn't a multiple of it.

**4. RADIUS, BORDER, SHADOW**
Each distinct value, with where it appears. Multiple shadow definitions doing the same job is the most common form of drift.

**5. THE INCONSISTENCY REPORT**
The single most useful section. List every place the interface contradicts itself: two button heights, three card paddings, a heading that's 600 here and 700 there. For each, say which value appears most and should become canonical.

**6. WHAT'S MISSING**
Tokens the system needs but doesn't have: focus rings, disabled states, a dark-mode counterpart for each colour.

Output sections 1-4 as a paste-ready \`:root\` block. Sections 5-6 as prose.`,
        descriptionMd: `### Built for the real situation
Nobody starts with a clean design system. They start with three years of accumulated screens and a vague sense that things don't match. This prompt reads what's there and tells you where it diverges — the inventory you need before any consolidation.

### Section 5 is the deliverable
The token list is useful. The inconsistency report is what you take to the team. "We have four card paddings and 16px is used most" is an actionable sentence; "we should standardise spacing" is not.

### Feed it several screens
One screenshot gives you one screen's tokens. Four or five screens across different areas is where the contradictions surface — which is the entire point.

### Follow-up worth running
Once you have the token block, ask for the migration: which hard-coded values map to which token, ordered by how many occurrences each change fixes.`,
        parameters: { model: 'claude-3-7-sonnet', temperature: 0.2, max_tokens: 4000, vision: true },
        media: img('photo-1551288049-bebda4e38f71', 'Reference: dashboard component system'),
        tags: ['Design Systems', 'Design Tokens', 'Audit', 'Claude'],
        isFeatured: true,
    },
    {
        title: 'Every State a Screen Can Be In',
        slug: 'every-state-a-screen-can-be-in',
        category: 'ui-ux',
        model: 'gpt-4o',
        authorUsername: 'elena_v',
        shortDesc: 'Enumerates the empty, loading, partial, error and edge states that get designed last and shipped broken — with the actual copy for each.',
        fullPrompt: `For the screen described below, design every state it can be in. The happy path is the easy one; I need the other nine.

THE SCREEN
Purpose: {what_this_screen_is_for}
Primary content: {what_it_displays}
Data source: {where_the_data_comes_from}
User can: {available_actions}

For each state below give: when it occurs, what the user sees, the exact copy, and the action available to them.

**1. FIRST RUN** — a new user, no data yet, nothing has gone wrong. What invites them in? (Not "No items found". That is a failure message for a success state.)
**2. LOADING, FIRST TIME** — nothing cached. Skeleton, spinner, or progressive? Say which and why.
**3. LOADING, REFRESH** — content already on screen. What moves and what holds still?
**4. PARTIAL** — some data arrived, some failed. The most-skipped state and the most common in production.
**5. EMPTY BY FILTER** — data exists but the user's filter excludes all of it. Different from first run, and the way out is to clear the filter.
**6. ERROR, RECOVERABLE** — network dropped. Copy that says what happened and offers a retry.
**7. ERROR, NOT RECOVERABLE** — permission denied, resource deleted. Retry is useless; what do they do instead?
**8. OFFLINE** — stale content, no connection. What's still usable?
**9. TOO MUCH** — ten thousand items. Pagination, virtualisation, or a forced filter?
**10. PERMISSION-LIMITED** — authenticated but may not see or do everything. What's hidden versus visible-but-disabled, and why?

Copy rules: say what happened and what to do next. No "Oops!", no "Something went wrong", no exclamation marks, no blame on the user. Error copy should let someone act without contacting support.`,
        descriptionMd: `### The states that ship broken
Teams design the happy path, then handle the rest in a rush the week before launch. The result is "Oops! Something went wrong" — which tells the user nothing and generates a support ticket.

### Why the copy is part of it
Asking for the state without the copy gets you a wireframe. The copy is where the thinking actually lives: writing "We couldn't reach the server. Your changes are saved locally and will sync when you reconnect" forces you to decide whether that's true.

### Three states people always miss
**Partial** (#4) — real APIs fail per-section, not all at once. **Empty by filter** (#5) — showing the first-run illustration here is a classic bug; the user has data, they just filtered it away. **Permission-limited** (#10) — the difference between hiding and disabling is a product decision, and hiding things silently makes people think the app is broken.

### Use it as a checklist
Run it early, keep the output, and tick states off as you build. It's just as useful as a QA list as it is a design brief.`,
        parameters: { model: 'gpt-4o', temperature: 0.4, max_tokens: 3500 },
        media: img('photo-1507238691740-187a5b1d37b8', 'Reference: multi-state dashboard'),
        tags: ['UX Writing', 'Empty States', 'Error Handling', 'GPT-4o'],
    },
    {
        title: 'Accessibility Audit That Names the Fix',
        slug: 'accessibility-audit-wcag-with-fixes',
        category: 'ui-ux',
        model: 'claude-3-7-sonnet',
        authorUsername: 'alexchen',
        shortDesc: 'A WCAG audit that returns the failing criterion, the actual code change, and an honest ordering by user impact — not a list of automated-tool warnings.',
        fullPrompt: `Audit this interface for accessibility. Return problems a real person would hit, with the fix.

CODE
\`\`\`
{paste_component_or_page_markup}
\`\`\`

CONTEXT
Framework: {react_vue_plain_html}
Interactive elements: {what_users_do_here}
Known constraints: {anything_you_cannot_change}

Check and report on:

**1. KEYBOARD**
Can every action be reached and triggered by keyboard alone? Tab order matches visual order? Focus visible at every stop? Any trap? Modals: focus moves in on open, returns on close?

**2. SCREEN READER SEMANTICS**
Correct elements for the job — button for actions, a for navigation, real headings in order. Every control has an accessible name. ARIA only where native semantics don't exist, and correct where used. Flag every \`div\` with an onClick.

**3. CONTRAST**
Text against its actual background: 4.5:1 body, 3:1 large text, 3:1 for UI component boundaries. Include disabled states and text over images. Give measured ratios, not guesses.

**4. STATE COMMUNICATION**
Loading, error, success, and selection — announced to assistive tech, not just shown visually. Are live regions used where content changes without navigation?

**5. MOTION AND TIMING**
Anything auto-playing, auto-advancing, or timed out? Is \`prefers-reduced-motion\` respected?

**6. FORMS**
Labels programmatically associated. Errors identified in text, not colour alone, and tied to the field. Required fields marked in a way that's conveyed non-visually.

FORMAT — for each finding:
- WCAG criterion and level (e.g. 2.4.7 Focus Visible, AA)
- Who it affects and what happens to them
- The exact code change
- Severity by real impact: blocks the task / makes it harder / polish

Order by impact, not by criterion number. Do not pad the list — say so where something passes.`,
        descriptionMd: `### Impact over compliance
Automated tools return eighty warnings sorted by rule number, and teams fix the easy ones. This prompt orders by what actually blocks someone from completing a task, which is a different and much shorter list.

### "Who it affects and what happens"
Requiring this per finding changes how the report reads. "Colour contrast 3.1:1" is a number. "A user with moderate low vision cannot read the error text explaining why their payment failed" gets prioritised.

### What it won't do
It can't catch everything a real screen-reader pass would — reading order in complex layouts, whether your labels make sense in context, whether the experience is any good. Treat it as the floor, not the ceiling. If you ship to the public, test with NVDA or VoiceOver.

### The div-with-onClick rule
Explicitly flagged because it's the single most common accessibility bug in React codebases, and it breaks keyboard access, focus and screen readers all at once.`,
        parameters: { model: 'claude-3-7-sonnet', temperature: 0.2, max_tokens: 4000 },
        media: img('photo-1517842645767-c639042777db', 'Reference: interface design review'),
        tags: ['Accessibility', 'WCAG', 'Audit', 'Claude'],
    },
    {
        title: 'Landing Page Brief — Structure, Copy and Proof',
        slug: 'landing-page-brief-structure-copy-proof',
        category: 'ui-ux',
        model: 'gpt-4o',
        authorUsername: 'alexchen',
        shortDesc: 'Produces a section-by-section landing page spec with the actual copy and, for every claim, the proof that has to sit next to it.',
        fullPrompt: `Write the brief for a landing page. Section by section, with real copy — not placeholders.

PRODUCT
What it does, in one sentence: {one_sentence}
Who it's for: {specific_audience_not_everyone}
What they use today instead: {the_status_quo}
Why they'd switch: {the_actual_reason}
What makes people hesitate: {the_real_objection}

For each section give: the goal, the copy, the visual, and the proof.

**1. HERO**
Headline stating the outcome, not the category. Under 10 words. Subhead naming the audience and the mechanism in one sentence. One primary action. Say what the visual shows — specifically, not "product screenshot".

**2. THE PROBLEM**
Describe the status quo so precisely that the reader thinks you've watched them work. Specificity is the whole job; generic pain statements get skimmed.

**3. HOW IT WORKS**
Three steps, maximum. Each one verb-first. If it needs four steps, the product is being explained wrong.

**4. PROOF**
What makes the claims believable: numbers, named customers, a demo, a guarantee. If there's no proof yet, say what would need to be true to get some — don't invent it.

**5. OBJECTION HANDLING**
Address \`{the_real_objection}\` directly, in the reader's words. The objection you're avoiding is the one costing you signups.

**6. CLOSING ACTION**
Restate the outcome. Remove the remaining risk — free tier, no card, cancel anytime, whatever's true.

COPY RULES
No "revolutionary", "seamless", "game-changing", "unlock", "elevate", "empower".
No claim without proof sitting next to it.
Write at the reading level of someone skimming on a phone between meetings.
Short sentences. Concrete nouns. Specific numbers over adjectives.`,
        descriptionMd: `### Proof next to every claim
The rule that makes the output usable. Any model will happily write "10x faster"; requiring the proof in the same section forces either a real number or an honest admission that you don't have one yet — which is itself useful information about what to go measure.

### The banned word list
Those words aren't banned for being ugly. They're banned because they're what a model reaches for when it doesn't know anything specific about the product. Removing them forces concrete claims.

### \`{the_real_objection}\`
Be honest in this field. "It's expensive", "we already built something internal", "switching costs are high", "I don't trust a startup with this data". The page that names the objection out-converts the page that hopes nobody thinks of it.

### Three steps
If "how it works" needs more than three, that's a signal worth paying attention to — usually the product is being described by its implementation rather than its outcome.`,
        parameters: { model: 'gpt-4o', temperature: 0.6, max_tokens: 3000 },
        media: img('photo-1460925895917-afdab827c52f', 'Reference: landing page layout system'),
        tags: ['Landing Page', 'Copywriting', 'Conversion', 'GPT-4o'],
    },
    // =========================================================================
    // 5. TEXT / WRITING
    // =========================================================================
    {
        title: 'The Ruthless Line Editor — Cuts With Reasons',
        slug: 'ruthless-line-editor-cuts-with-reasons',
        category: 'text-writing',
        model: 'claude-3-7-sonnet',
        authorUsername: 'alexchen',
        shortDesc: 'Line-edits your draft and shows the reasoning for every cut, so you learn the pattern instead of just accepting a rewrite you could not reproduce.',
        fullPrompt: `Line-edit the draft below. Your job is to make it shorter and sharper without making it yours.

DRAFT
{paste_draft}

CONTEXT
Audience: {who_reads_this}
Purpose: {what_it_must_achieve}
Voice to preserve: {describe_the_authors_voice}

Work in four passes, reporting each separately:

**PASS 1 — CUT**
Every sentence, clause and word that can go without losing meaning. Show each as:
~~original~~ → revised *(why)*
Target: 20-30% shorter. If the draft is already tight, say so rather than cutting into the meat.

**PASS 2 — STRENGTHEN**
Weak verbs made strong. Passive made active where the actor matters. Abstractions replaced with the concrete thing. Hedges removed where the writer actually knows. Same format.

**PASS 3 — FLOW**
Sentences that run together, paragraphs that bury their point, transitions that don't connect. Mark where a reader's attention would slip, and why.

**PASS 4 — WHAT YOU DIDN'T TOUCH**
Choices that look like errors but are the writer's voice — a long sentence that earns its length, a repetition that lands, a fragment used deliberately. Name them so I don't "fix" them later.

Then: the clean edited draft.

RULES
Never make it sound like you. If the writer uses semicolons or starts sentences with "And", keep it.
Every change gets a reason. "Flows better" isn't one.
Quote the original exactly.`,
        descriptionMd: `### Pass 4 is why this exists
Every AI editor flattens voice. Asking the model to identify what it deliberately left alone forces it to distinguish between a mistake and a choice — and gives you a record so you don't undo your own good instincts in the next revision.

### Reasons, not rewrites
The \`~~original~~ → revised *(why)*\` format means you learn the pattern. After a few passes you catch "in order to", "it is important to note that" and "very" yourself, which is worth more than any single edit.

### Set the voice field properly
\`{describe_the_authors_voice}\` — "dry, understated, uses short sentences for emphasis, never exclamation marks". Leave it blank and you'll get competent, generic prose back.

### Where it struggles
Technical accuracy. It will happily tighten a sentence into something false. Read the edited draft for meaning, not just for rhythm.`,
        parameters: { model: 'claude-3-7-sonnet', temperature: 0.3, max_tokens: 4000 },
        media: img('photo-1457369804613-52c61a468e7d', 'Reference: manuscript and editing'),
        tags: ['Editing', 'Copywriting', 'Writing', 'Claude'],
        isFeatured: true,
    },
    {
        title: 'Changelog to Engineering Blog Post',
        slug: 'changelog-to-engineering-blog-post',
        category: 'text-writing',
        model: 'claude-3-7-sonnet',
        authorUsername: 'sarah_connor',
        shortDesc: 'Turns a shipped change into a post worth reading — built around the problem and the decision rather than the feature list most release notes become.',
        fullPrompt: `Write an engineering blog post about this change. Not release notes — a post someone would read who doesn't use our product.

WHAT SHIPPED
{the_change}

WHY IT WAS NEEDED
Problem: {what_was_broken_or_slow}
Impact: {who_it_hurt_and_how_much}
Evidence: {the_metric_or_report_that_prompted_it}

HOW IT WAS BUILT
Approach taken: {what_you_did}
Alternatives rejected: {what_else_you_considered_and_why_not}
Hard part: {what_was_genuinely_difficult}
Result: {measured_outcome}

STRUCTURE

**Opening** — The problem as a concrete scene. A specific user hitting a specific wall, or the graph that made someone say "that can't be right". No "At {company}, we're always striving to…". Start at the problem.

**Why it was hard** — If it had been easy it would already be done. What made it non-trivial? This is the part engineers read for.

**What was tried and rejected** — The most valuable section and the one most posts omit. Credible, and it's where the reader learns something transferable.

**The approach** — What was built and why that shape. Code or diagrams where they carry weight, not for decoration.

**What happened** — Real numbers, before and after. Include what didn't improve, and anything that got worse.

**What's still open** — Known limits, the next thing. Honesty here buys trust for everything above.

RULES
Write for an engineer at another company who will never use this product but might face the same problem.
No marketing voice. No "we're excited to announce".
Every number gets its measurement context — p50 or p99, over what window.
If something is still bad, say so.`,
        descriptionMd: `### The rejected-alternatives section
This is what separates a post people share from a post people skim. "We tried X, it failed because Y, so we did Z" is the shape of actual engineering, and it's the part a reader can apply to their own problem.

It's also the easiest section to fill honestly, because you lived it — and the one a model cannot invent for you, which is why it's an input field.

### Write for the outsider
Targeting "an engineer at another company who will never use this product" is the constraint that kills marketing voice. It makes feature-pitching pointless and forces the post to be about the problem.

### "Include what got worse"
Every real change has a trade-off. Naming it is what makes the improvements believable. Posts where everything improved and nothing regressed read as marketing, because they usually are.`,
        parameters: { model: 'claude-3-7-sonnet', temperature: 0.5, max_tokens: 4000 },
        media: img('photo-1551836022-b06985bceb24', 'Reference: engineering metrics'),
        tags: ['Technical Writing', 'Engineering Blog', 'Content', 'Claude'],
    },
    {
        title: 'Outreach That Doesn\'t Read Like a Template',
        slug: 'outreach-that-doesnt-read-like-a-template',
        category: 'text-writing',
        model: 'gpt-4o',
        authorUsername: 'alexchen',
        shortDesc: 'A short cold email built from something specific about the recipient, with a small ask — and an explicit ban on every phrase that marks a message as bulk.',
        fullPrompt: `Write a cold outreach email. Under 120 words.

RECIPIENT
Who: {name_role_company}
Something specific and recent about them or their work: {the_specific_thing}
How I came across it: {honestly_how}

ME
Who I am: {one_line}
Why I'm credible to them specifically: {the_relevant_overlap}

THE ASK
What I want: {specific_small_ask}
Why it's worth their time: {whats_in_it_for_them}

STRUCTURE
Line 1 — The specific thing. Demonstrate you actually engaged with it, don't just name it. Never "I loved your post!"
Line 2 — The connection between that and why you're writing. One sentence.
Line 3-4 — Who you are and the relevant overlap. Brief.
Line 5 — The ask. Specific, small, easy to say yes to.
Sign off. No postscript gimmick.

SUBJECT LINE
Under 8 words. Describes the content. Not a question, not clickbait, no "Quick question".

BANNED
"I hope this email finds you well" · "I wanted to reach out" · "Quick question" · "circle back" · "touch base" · "synergy" · "I'd love to pick your brain" · "just following up" · any compliment that would apply to anyone.

TEST
If this email could be sent to 500 people with only the name changed, it has failed. The specific thing must be load-bearing — remove it and the email should stop making sense.`,
        descriptionMd: `### The test at the bottom
"Remove the specific detail and the email should stop making sense" is the whole prompt in one line. Most cold email is a template with a name merged in, and recipients can tell instantly.

### \`{the_specific_thing}\` has to be real
This is the field that does the work, and no model can fill it for you. Read the thing. Have an actual reaction. "Your post on queue backpressure — the bit about dropping the oldest message rather than the newest is the opposite of what we did, and ours fell over" is an email that gets answered.

### Make the ask small
"15 minutes to ask about X" converts. "A call to explore partnership opportunities" does not. The first is a specific, bounded favour; the second is homework.

### Honesty about how you found them
\`{honestly_how}\` — "your talk at X", "a colleague forwarded it", "your GitHub came up while I was debugging Y". Vagueness here is what makes outreach feel like surveillance.`,
        parameters: { model: 'gpt-4o', temperature: 0.7, max_tokens: 800 },
        media: img('photo-1557804506-669a67965ba0', 'Reference: professional correspondence'),
        tags: ['Cold Email', 'Outreach', 'Sales', 'GPT-4o'],
    },
    {
        title: 'Feature to Documentation — Task-Oriented, Not Tour-Oriented',
        slug: 'feature-to-task-oriented-documentation',
        category: 'text-writing',
        model: 'gemini-2-5-pro',
        authorUsername: 'marcus_dev',
        shortDesc: 'Writes docs organised around what someone is trying to accomplish, with the failure modes and the copy-pasteable examples that reference docs always leave out.',
        fullPrompt: `Write documentation for this feature. Organise it by what the reader is trying to do, not by what the feature contains.

THE FEATURE
What it is: {description}
Interface: {api_cli_ui_config}
\`\`\`
{paste_signature_schema_or_options}
\`\`\`

READERS
Primary: {who_and_what_they_already_know}
What they're trying to accomplish: {the_jobs}

Produce:

**1. THE ONE-LINER**
What this does and when to reach for it. Two sentences. Someone skimming should know whether to keep reading.

**2. THE SHORTEST THING THAT WORKS**
A complete, runnable, copy-pasteable example — including imports, setup and realistic values. No \`your_api_key_here\` placeholders without saying where to get one. This is what most readers will take and nothing else, so it must actually run.

**3. TASK GUIDES**
One section per job in \`{the_jobs}\`, titled as a task ("Retry a failed job", not "The retry option"). Each: when you'd want this, the code, what to expect back.

**4. REFERENCE**
Every parameter: name, type, default, and what it does. Mark required ones. Where a default is non-obvious, say why it is what it is.

**5. WHEN IT GOES WRONG**
The errors people will actually hit, each with: the message as it appears, what causes it, how to fix it. Write these from the error text, so search finds them.

**6. LIMITS AND GOTCHAS**
Rate limits, size caps, behaviour at scale, anything surprising. The things people discover in production and then complain about not being documented.

RULES
Every example complete and runnable — no fragments.
Show realistic values, not \`foo\` and \`bar\`.
Say what it doesn't do, where people might assume otherwise.
No "simply", "just", or "easily". If it were easy they wouldn't be reading.`,
        descriptionMd: `### Tasks, not tours
Reference documentation lists what exists. Task documentation answers what someone came to do. Readers almost always arrive mid-task, via search, which is why section 5 is written to match the error text they're pasting into Google.

### Section 2 carries most of the value
Most readers copy the first complete example and leave. If it doesn't run — missing an import, a placeholder they can't resolve — the docs failed regardless of how good the rest is. That's why it's specified as complete and runnable rather than illustrative.

### The banned words
"Simply" and "just" are banned because they're a tell: they appear exactly where the author has forgotten what it's like not to know. When a reader hits "simply configure the webhook" and can't, the word makes them feel stupid rather than informed.

### Model note
Gemini's long context is useful here — you can paste an entire module or schema and get docs grounded in the real signatures instead of invented ones.`,
        parameters: { model: 'gemini-2-5-pro', temperature: 0.3, max_tokens: 4000 },
        media: img('photo-1516321318423-f06f85e504b3', 'Reference: technical documentation'),
        tags: ['Documentation', 'Developer Experience', 'Technical Writing', 'Gemini'],
    },
    // =========================================================================
    // 6. CODE-FREE AGENTS
    // =========================================================================
    {
        title: 'Research Agent With Source Discipline',
        slug: 'research-agent-with-source-discipline',
        category: 'code-free-agents',
        model: 'gemini-2-5-pro',
        authorUsername: 'marcus_dev',
        shortDesc: 'A research workflow that separates what sources claim from what is corroborated, grades every source, and is required to report what it could not find.',
        fullPrompt: `You are researching {question} for {who_will_act_on_this}.

Their decision depends on this being right. Confidence you don't have is worse than an admission of uncertainty.

**STEP 1 — FRAME**
Restate the question precisely. Name the sub-questions that must be answered. Flag any ambiguity in the question itself and state the reading you're using.

**STEP 2 — GATHER**
Search broadly. For each source record: what it claims, who published it, when, and what interest they have in the answer.

**STEP 3 — GRADE EACH SOURCE**
- *Primary* — original data, direct measurement, the actual document
- *Secondary* — competent reporting on a primary source, cited
- *Derivative* — repeats a claim without a traceable original
- *Interested* — the publisher benefits from this conclusion
A vendor's benchmark of their own product is Interested, however rigorous it looks.

**STEP 4 — SEPARATE**
Three lists, kept apart:
- **Corroborated** — two or more independent sources, at least one Primary
- **Single-sourced** — one source only. Name it; the reader decides.
- **Contested** — credible sources disagree. Give both positions and what would settle it.

**STEP 5 — REPORT THE GAPS**
What you could not find out, and whether that's because the data doesn't exist, is paywalled, or you couldn't reach it. This section is mandatory and may not be empty — if you believe it is, you haven't looked hard enough at the edges of the question.

**STEP 6 — ANSWER**
Lead with the answer. Then the reasoning. Then the confidence level and what would change your mind.

RULES
Never present a single source as settled fact.
Date every claim where currency matters.
If the honest answer is "the evidence doesn't support a conclusion", say that.
Do not fill gaps with plausible-sounding reasoning.`,
        descriptionMd: `### The three lists
Keeping corroborated, single-sourced and contested findings apart is what makes the output usable. Research that blends them reads as uniformly confident, so the reader can't tell which parts to lean on.

### "Interested" as a source grade
Most research frameworks grade by rigour. Adding *interested* as a separate axis catches the thing that actually distorts conclusions: a well-conducted study by someone who benefits from the result. Vendor benchmarks, industry-funded reports, consultancy surveys.

### Mandatory gaps section
Making step 5 non-optional is the single most effective anti-hallucination measure here. A model asked to list what it couldn't find is much less likely to invent it — it's been given a legitimate place to put the uncertainty.

### Where it's weak
It is only as good as what's reachable. Paywalled journals, internal data and anything post-training-cutoff are invisible to it. Pair with a web-search tool and treat it as a first pass, not a final answer.`,
        parameters: { model: 'gemini-2-5-pro', temperature: 0.2, max_tokens: 6000, tools: 'web_search' },
        media: img('photo-1551836022-d5d88e9218df', 'Reference: research and analysis'),
        tags: ['Research', 'Fact Checking', 'Agents', 'Gemini'],
        isFeatured: true,
    },
    {
        title: 'Inbox Triage Agent With Escalation Rules',
        slug: 'inbox-triage-agent-escalation-rules',
        category: 'code-free-agents',
        model: 'claude-3-7-sonnet',
        authorUsername: 'marcus_dev',
        shortDesc: 'Sorts a backlog by what happens if it is ignored, drafts the routine replies, and hands back anything requiring judgement instead of guessing at it.',
        fullPrompt: `Triage this inbox. You draft; you never send. Anything requiring a judgement I'd want to make myself comes back to me untouched.

MESSAGES
{paste_messages_with_sender_and_date}

MY CONTEXT
Role: {my_role}
Current priorities: {whats_important_right_now}
Decisions I delegate: {what_you_may_answer_on_my_behalf}
Decisions I never delegate: {what_always_comes_to_me}

Sort into:

**1. NEEDS ME — URGENT**
Something is broken, a deadline is at risk, or someone is blocked waiting on me. For each: who, what they need, what happens if this waits until tomorrow.

**2. NEEDS ME — NOT URGENT**
Requires my judgement but no harm in waiting. One line each on what the decision is.

**3. DRAFTED FOR MY REVIEW**
Routine enough that I've written a reply. Include the full draft. These are sends-after-a-glance, not sends-unread — if a reply commits me to anything, it belongs in category 1 or 2 instead.

**4. FYI**
No action needed. One line each. Group by theme.

**5. ARCHIVE**
Newsletters, automated notifications, resolved threads. Count and categories only.

**6. AMBIGUOUS**
I couldn't tell what's being asked, or it touches something in \`{what_always_comes_to_me}\`. Say what's unclear. Do not guess.

RULES
Rank urgency by consequence of delay, not by the sender's tone. A calm message about a production issue outranks an urgent-flagged request for a status update.
Never mark something resolved that isn't.
If someone has written twice with no reply, say so — that's the highest-cost miss in any inbox.
Drafts match my voice: {describe_your_email_voice}.`,
        descriptionMd: `### Consequence, not tone
The core rule. Senders signal urgency by how they write, which correlates poorly with how urgent things are. Ranking by "what happens if this waits" surfaces the quiet message about a failing job above the all-caps request for a status update.

### Draft, never send
Non-negotiable. An agent with send access will eventually commit you to something you didn't agree to, in your name, to someone who'll hold you to it. Category 3 is explicitly limited to replies that commit you to nothing.

### The second-message rule
"Someone has written twice with no reply" is the highest-value line in the prompt. It's the failure mode that costs relationships, and it's invisible when you're skimming by recency.

### Set the delegation fields honestly
\`{what_always_comes_to_me}\` — pricing, hiring, anything legal, anything with a customer's money in it. Be generous with this list. The cost of an over-escalated message is ten seconds; the cost of an under-escalated one is much higher.`,
        parameters: { model: 'claude-3-7-sonnet', temperature: 0.3, max_tokens: 4000 },
        media: img('photo-1522071820081-009f0129c71c', 'Reference: operations and communication'),
        tags: ['Email', 'Productivity', 'Triage', 'Claude'],
    },
    {
        title: 'Competitive Monitoring Digest — Signal Over Activity',
        slug: 'competitive-monitoring-digest-signal',
        category: 'code-free-agents',
        model: 'gpt-4o',
        authorUsername: 'alexchen',
        shortDesc: 'A recurring competitor brief that reports changes in direction rather than a feed of announcements, and is required to say when nothing meaningful happened.',
        fullPrompt: `Produce a competitive brief covering {time_period}.

WATCHING
Competitors: {named_companies}
Our position: {what_we_do_differently}
What would actually change our plans: {the_decisions_this_informs}

SOURCES
{changelogs_pricing_pages_job_boards_docs_blogs_filings}

Report only what represents a change in direction. An announcement is not news; a change in what they're building is.

**1. MOVES THAT MATTER**
For each: what changed, the evidence, what it implies about their direction, and what it means for \`{the_decisions_this_informs}\`.
Rank by effect on our decisions, not by how prominently it was announced.

**2. WHAT THE EVIDENCE SUGGESTS THEY'RE BUILDING**
Read the leading indicators, not the press release: job postings by role and location, documentation for undocumented endpoints, pricing page changes, conference talk topics, acquisitions. These lead announcements by months.

**3. PRICING AND PACKAGING**
Any change to price, tier boundaries, limits, or what's bundled. Include what moved *between* tiers — that's usually a deliberate repositioning and it's rarely announced.

**4. POSITIONING SHIFTS**
Changes in how they describe themselves. Homepage headline, category language, which customer logos are displayed. A changed headline means a changed strategy.

**5. WHAT DIDN'T HAPPEN**
Expected moves that didn't come. A competitor going quiet in an area is as informative as a launch.

**6. SO WHAT**
Three sentences. What, if anything, we should do differently. "Nothing this period" is a valid and welcome answer.

RULES
Evidence with a date and a link for every claim. No inference presented as fact.
Distinguish what they announced from what they shipped.
If the period was genuinely quiet, say so in one line. Do not manufacture significance.`,
        descriptionMd: `### Permission to say nothing happened
Most competitive monitoring degrades into a newsletter of press releases because the format demands content every week. Explicitly allowing "nothing this period" is what keeps the signal-to-noise ratio survivable — and makes people actually read it when something *has* happened.

### Leading indicators
Section 2 is where the value is. Job postings, documentation diffs and pricing page changes lead public announcements by three to six months. By the time there's a launch blog post, it isn't intelligence any more.

### Announced versus shipped
The distinction that keeps you from reacting to vapour. Plenty of roadmap announcements never materialise; reorganising your quarter around one is an expensive mistake.

### Scheduling it
Works well as a recurring task. Monthly beats weekly for most markets — weekly forces noise into the report because a week rarely contains a real strategic change.`,
        parameters: { model: 'gpt-4o', temperature: 0.3, max_tokens: 4000, tools: 'web_search' },
        media: img('photo-1611974789855-9c2a0a7236a3', 'Reference: market monitoring'),
        tags: ['Competitive Intelligence', 'Market Research', 'Agents', 'GPT-4o'],
    },
    {
        title: 'Meeting Notes to Decisions, Owners and Dates',
        slug: 'meeting-notes-to-decisions-owners-dates',
        category: 'code-free-agents',
        model: 'claude-3-7-sonnet',
        authorUsername: 'sarah_connor',
        shortDesc: 'Extracts what was actually decided from a messy transcript, separates it from what was merely discussed, and names every commitment that has no owner.',
        fullPrompt: `Extract the decisions from this meeting. Discussion is not decision; agreement in the room is not an owned action.

TRANSCRIPT OR NOTES
{paste_transcript}

CONTEXT
Attendees and roles: {who_was_there}
Meeting purpose: {why_it_was_called}

Produce:

**1. DECISIONS MADE**
Only things actually settled. For each: what was decided, who decided it, and the reasoning given.
If a decision was reached by the room going quiet rather than agreeing, note that — it tends to come undone later.

**2. ACTIONS WITH OWNERS**
Task, named owner, date. Only where all three exist in the transcript.

**3. COMMITMENTS WITHOUT AN OWNER**
Things everyone agreed should happen where no name was attached. This is the most valuable section — unowned actions are the ones that don't get done. Quote the moment it was agreed.

**4. ACTIONS WITHOUT A DATE**
Owned but unscheduled. Same reasoning.

**5. DISCUSSED, NOT DECIDED**
Topics raised and left open. For each: what the open question is and what would settle it. Keeps things from being re-litigated next week.

**6. DISAGREEMENTS**
Where attendees didn't align, including ones that were smoothed over rather than resolved. Say who held which position. Papered-over disagreement resurfaces during execution.

**7. ASSUMED BUT UNSTATED**
Things the conversation depended on that nobody said out loud — a deadline everyone assumed, a resource presumed available. Flag them; these are where plans break.

RULES
Quote the transcript for every decision and commitment.
Never invent an owner. "No owner named" is the correct output.
Do not resolve ambiguity. If it was unclear in the room, report it as unclear.`,
        descriptionMd: `### Section 3 is the point
Unowned commitments are where meetings fail. Everyone agrees something should happen, nobody's name is attached, and three weeks later it hasn't. Surfacing these as a distinct list — with the quote — turns a vague feeling into a message you can send.

### "Never invent an owner"
The instruction that makes it trustworthy. A model asked to produce an action list will helpfully assign owners based on who seems most relevant. That's how someone finds out they own something they never agreed to.

### Section 7
The one people don't expect and then keep. Meetings run on shared assumptions nobody states, and those are exactly what turn out to be wrong. "Everyone assumed design would be ready by the 14th; nobody from design was in the room" is the note that saves a sprint.

### Running it
Works on raw transcripts, including messy auto-generated ones with crosstalk. It needs attendee names and roles to attribute properly — supply those even if the transcript labels speakers as "Speaker 1".`,
        parameters: { model: 'claude-3-7-sonnet', temperature: 0.2, max_tokens: 4000 },
        media: img('photo-1507925921958-8a62f3d1a50d', 'Reference: team planning board'),
        tags: ['Meetings', 'Productivity', 'Summarization', 'Claude'],
    },
    // =========================================================================
    // 7. AUDIO
    // =========================================================================
    {
        title: 'Suno Structure Tags — Arrangement You Actually Control',
        slug: 'suno-structure-tags-arrangement-control',
        category: 'audio',
        model: 'suno-v4',
        authorUsername: 'suno_maestro',
        shortDesc: 'Uses section tags, instrumentation notes and a stated arc to control how a generated track develops, instead of hoping a genre label produces a structure.',
        fullPrompt: `STYLE
{genre_primary} with {genre_secondary} influence. {bpm} BPM, {key}. {production_era_or_reference}.

INSTRUMENTATION
Rhythm: {drums_description}
Bass: {bass_description}
Harmony: {chords_description}
Lead: {lead_description}
Texture: {atmospheric_element}

VOCAL
{vocal_description} — tone, range, delivery, and how processed.

ARRANGEMENT — the track should build, not loop:

[Intro]
{intro_description} — establish the space before the groove arrives.

[Verse 1]
Sparse. Rhythm and bass carry it. Vocal forward and dry.

[Pre-Chorus]
Tension. Add {prechorus_element}, lift the harmony, pull the drums back for the last two bars.

[Chorus]
Full arrangement. {chorus_description}. Widest point in the track.

[Verse 2]
Return to verse density but carry one chorus element through, so it doesn't feel like a reset.

[Bridge]
{bridge_description} — the moment of contrast. Change one fundamental thing: key, rhythm, or instrumentation.

[Final Chorus]
Biggest. {final_chorus_variation}.

[Outro]
{outro_description}. Resolve, don't fade arbitrarily.

LYRICS
{paste_lyrics_or_describe_theme}

Mix: {mix_description}`,
        descriptionMd: `### Why tags
A genre label gets you a loop. Bracketed section tags give the model an arrangement to follow, and arrangement is the difference between a sketch and a track.

### The three structural rules worth keeping
**Verse 2 carries a chorus element.** Without it the song resets and feels like two separate ideas stitched together.
**The bridge changes one fundamental thing** — key, rhythm or instrumentation. One, not three. Changing everything just sounds like a different song.
**The outro resolves.** Letting it fade is what makes generated music sound unfinished.

### Instrumentation phrasing
Describe the sound, not the instrument. "Bass" gets you anything; "round, muted P-bass played with the fingers, sitting just behind the beat" gets you something specific.

### Practical notes
Keep total style text under Suno's field limit — trim the atmospheric line first, it's the least load-bearing. Generate several takes of the same prompt; variance between seeds is high, and the arrangement survives better than the timbre.`,
        parameters: { model: 'suno-v4', bpm: 'specified in prompt', structure: 'tagged', instrumental: false },
        media: img('photo-1598488035139-bdbb2231ce04', 'Reference: production workstation'),
        tags: ['Suno', 'Music Production', 'Songwriting', 'Arrangement'],
        isFeatured: true,
    },
    {
        title: 'Narration Direction — Performance, Not Just Pronunciation',
        slug: 'narration-direction-performance-not-pronunciation',
        category: 'audio',
        model: 'elevenlabs-prime',
        authorUsername: 'suno_maestro',
        shortDesc: 'Marks up a script the way a voice director would — pace, emphasis, breath and emotional shift per section — so synthesised narration stops sounding evenly enthusiastic.',
        fullPrompt: `VOICE BRIEF

Character: {age_range}, {accent}, {gender_presentation}.
Timbre: {warm_bright_gravelly_etc}.
Baseline delivery: {measured_energetic_conversational_etc}.
Reference: sounds like {comparable_voice_type} — a {documentary_narrator_podcast_host_audiobook_reader}.

DIRECTION
Default pace: {words_per_minute_or_descriptor}.
Default energy: {level} out of 10 — leave room to go up AND down.
Breath: audible at paragraph breaks, not scrubbed out. Silence is part of the performance.

SCRIPT — marked up per section:

[Section 1 — {emotional_state}]
Pace: {pace}. Energy: {energy}.
Emphasis on: "{word}", "{word}"
Pause: {length} after "{phrase}"
{script_text}

[Section 2 — {emotional_state}]
{shift_description} — what changes and why.
Pace: {pace}. Energy: {energy}.
{script_text}

[Section 3 — {emotional_state}]
Pace: {pace}. Energy: {energy}.
Land on "{final_phrase}" — slower, lower, let it sit.
{script_text}

PRONUNCIATION
{proper_nouns_technical_terms_with_phonetic_spelling}

AVOID
Uniform enthusiasm. Upward inflection on statements. Rushing past the important line. Even emphasis — if every word is stressed, none is.`,
        descriptionMd: `### Why synthesised narration sounds synthetic
Not timbre — modern voices are convincing. It's **uniform energy**. Human readers speed up through setup and slow down for the point; synthesis delivers everything at the same intensity, and the ear reads that as artificial within two sentences.

### Leave room in both directions
Setting default energy to 5/10 rather than 8/10 is the single most useful adjustment. A voice already at 8 can't lift for the important line, so nothing lands.

### Keep the breaths
The instinct is to remove them. Don't — breath is how a listener knows a sentence is ending and a new thought is starting. Scrubbed-out breathing is uncanny in a way most people can't name.

### Per-section markup
Mark emphasis on no more than two words per section. Over-marking produces the sing-song cadence that makes audiobooks exhausting.

### Workflow
Generate section by section rather than the whole script at once. Per-section regeneration is cheap; re-rolling a ten-minute read because one line was wrong is not.`,
        parameters: { model: 'elevenlabs-prime', stability: 0.45, similarity_boost: 0.75, style: 0.35, speaker_boost: true },
        media: img('photo-1590602847861-f357a9332bbc', 'Reference: broadcast microphone'),
        tags: ['Voice Over', 'Narration', 'ElevenLabs', 'Audio Production'],
    },
    {
        title: 'Lo-Fi Instrumental Bed — Built Not to Be Noticed',
        slug: 'lofi-instrumental-bed-built-not-to-be-noticed',
        category: 'audio',
        model: 'suno-v4',
        authorUsername: 'suno_maestro',
        shortDesc: 'An instrumental loop engineered for background listening — carved out of the vocal frequency range, with no transient that pulls attention away from work.',
        fullPrompt: `Instrumental only. No vocals, no vocal chops, no spoken samples.

STYLE
{lofi_variant} — {bpm} BPM, {key}, swung {swing_amount}.
Reference: the feel of {reference_description}.

INSTRUMENTATION
Drums: dusty sampled kit, soft attack, brushed or filtered hats. Kick rounded, no sub click. Snare sits back in the mix with a short room tail.
Bass: {bass_description}, played simply, rhythmically steady. Occupies 60-120Hz, no higher.
Keys: {keys_description}. Extended chords — 7ths and 9ths — voiced in the middle register. Slight timing imperfection, as if played by hand.
Texture: {texture_element} — vinyl crackle, tape hiss, distant room tone. Constant and low.

CRITICAL — THIS IS A BACKGROUND BED
No element draws attention. Specifically:
- No melodic lead. Nothing a listener would hum.
- No dynamic jumps. The loudest and quietest bars are within 3dB.
- No sharp transients. Everything soft-attack.
- The 1-4kHz range stays largely clear — that's where speech lives, and anything there competes with thinking.
- No drop, no build, no arrangement event that would make someone look up.

ARRANGEMENT
Eight-bar loop that evolves subtly over {duration}. Change by one element at a time — a filter opening slowly, a texture entering, one chord substitution. Nothing announces itself.

MIX
Low-passed around {cutoff}Hz, gentle. Heavy bus compression, slow attack, so everything sits glued and even. Mono-compatible. Quiet overall — this plays under something else.`,
        descriptionMd: `### Designed around what it's for
Most lo-fi prompts ask for a vibe. This one is engineered for a function: audio that occupies attention without competing for it. Every constraint follows from that.

### The 1-4kHz rule
The highest-leverage line. Speech intelligibility and the sense of a "foreground" both live in that band. Keeping it clear is why some background music is genuinely unnoticeable and some is quietly irritating after twenty minutes.

### No hummable melody
Counter-intuitive but correct. A melody good enough to remember is a melody that pulls focus. For a study or work bed, memorable is a bug.

### The 3dB rule
Dynamic range is what makes music engaging and what makes background music intrusive. Compressing the whole thing into a narrow band is deliberate.

### Checking it
Play it while doing actual work for twenty minutes. If you notice it, something is too loud, too bright, or too melodic — usually the keys.`,
        parameters: { model: 'suno-v4', instrumental: true, bpm: '70-85', structure: 'loop', duration: '2-4 min' },
        media: img('photo-1539185441755-769473a23570', 'Reference: analog turntable'),
        tags: ['Lo-Fi', 'Instrumental', 'Background Music', 'Suno'],
    },
    {
        title: 'Character Voice Design for Audiobook Dialogue',
        slug: 'character-voice-design-audiobook-dialogue',
        category: 'audio',
        model: 'elevenlabs-prime',
        authorUsername: 'suno_maestro',
        shortDesc: 'Designs a cast of distinguishable voices from one narrator, separated by rhythm and register rather than accent impressions — which is what actually survives synthesis.',
        fullPrompt: `Design voices for a multi-character audiobook. Each must be identifiable within one sentence, without the listener being told who is speaking.

NARRATOR
{age_range}, {accent}, {timbre}. Neutral and steady — the narrator is the reference point everything else is heard against. Energy 5/10. Pace: measured.

CHARACTERS
For each, separate on these axes. Accent alone is not enough — synthesised accents drift, and listeners can't track four of them.

CHARACTER: {name}
- Register: {higher_or_lower_than_narrator, by how much}
- Pace: {faster_or_slower, and whether it varies}
- Rhythm: {clipped / flowing / halting / runs sentences together}
- Energy baseline: {out_of_10}
- Breath: {where they pause — mid-sentence, only at full stops, rarely}
- Verbal habit: {trailing off / finishing thoughts hard / rising at the end}
- Emotional default: {what they sound like when nothing is happening}

Repeat per character. Make the axes genuinely different: if two characters are both "lower and slower", they will blur.

DIALOGUE MARKUP
[Narrator] {text}
[{Character}, {emotional_state}] {text}
[Narrator] {text}

RULES
Narrator stays constant. Narration doesn't take on the emotion of the scene it describes — that's the character's job.
Attribution ("she said") is narration, delivered at narrator energy, not carried over from the line before.
Characters in conflict should differ in *pace*, not just volume. Two people getting louder is noise; one speeding up while the other slows is drama.

CONSISTENCY CHECK
After generating, listen to one line from each character back to back with no context. If you can't tell them apart, increase the separation on rhythm and pace before touching accent.`,
        descriptionMd: `### Rhythm over accent
The central idea. Everyone's instinct is to separate characters by accent, which fails twice: synthesised accents drift across a long read, and a listener can't reliably track more than two. Rhythm and pace are stable under synthesis and far easier to distinguish.

### The narrator stays flat
A common mistake is letting narration pick up the scene's emotion. It makes the whole book exhausting and robs the characters of contrast. The narrator is the baseline; characters are deviations from it.

### "She said" belongs to the narrator
Attribution tags delivered in the character's voice is the most common audiobook synthesis error. Mark them as narration explicitly.

### Conflict through pace
One character accelerating while another slows reads as tension. Both getting louder reads as a bad mix. This also survives synthesis much better than volume dynamics.

### The check at the end
Actually do it. Context makes characters sound more distinct than they are — stripped of it is the only honest test.`,
        parameters: { model: 'elevenlabs-prime', stability: 0.4, similarity_boost: 0.8, style: 0.5, multi_voice: true },
        media: img('photo-1509114397022-ed747cca3f65', 'Reference: atmospheric narrative scene'),
        tags: ['Audiobook', 'Character Voice', 'ElevenLabs', 'Voice Design'],
    },
];
async function main() {
    console.log(`\n📚 Importing ${SIGNATURE_PROMPTS.length} signature prompts across 7 categories...\n`);
    const [categories, models, authors] = await Promise.all([
        prisma.category.findMany(),
        prisma.model.findMany(),
        prisma.user.findMany(),
    ]);
    const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));
    const modelMap = new Map(models.map((m) => [m.slug, m.id]));
    const authorMap = new Map(authors.map((u) => [u.username, u.id]));
    const defaultAuthorId = authors[0]?.id;
    if (!defaultAuthorId) {
        throw new Error('No users found. Run `npm run prisma:seed` first.');
    }
    // Fail loudly on a typo'd slug rather than silently filing prompts under the
    // wrong category or model — a mistake that is tedious to unpick afterwards.
    const unknown = [];
    for (const item of SIGNATURE_PROMPTS) {
        if (!categoryMap.has(item.category))
            unknown.push(`category "${item.category}" (${item.slug})`);
        if (!modelMap.has(item.model))
            unknown.push(`model "${item.model}" (${item.slug})`);
        if (item.authorUsername && !authorMap.has(item.authorUsername)) {
            unknown.push(`author "${item.authorUsername}" (${item.slug})`);
        }
    }
    if (unknown.length) {
        throw new Error(`Unknown references:\n  - ${unknown.join('\n  - ')}`);
    }
    let created = 0;
    let updated = 0;
    for (const item of SIGNATURE_PROMPTS) {
        const categoryId = categoryMap.get(item.category);
        const modelId = modelMap.get(item.model);
        const authorId = item.authorUsername ? authorMap.get(item.authorUsername) : defaultAuthorId;
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
                    categoryId,
                    modelId,
                    isFeatured: item.isFeatured ?? existing.isFeatured,
                },
            });
            if (existing.media.length === 0) {
                await prisma.promptMedia.createMany({
                    data: item.media.map((m, i) => ({
                        promptId: existing.id,
                        mediaType: m.type,
                        url: m.url,
                        caption: m.caption || item.title,
                        orderIndex: i,
                    })),
                });
            }
            updated++;
            console.log(`🔄 ${item.category.padEnd(18)} ${item.title}`);
            continue;
        }
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
                isFeatured: item.isFeatured ?? false,
            },
        });
        const version = await prisma.promptVersion.create({
            data: {
                promptId: prompt.id,
                versionNumber: 'v1.0',
                title: item.title,
                promptText: item.fullPrompt,
                parametersJson: JSON.stringify(item.parameters),
                changelog: 'Initial release',
                editorId: authorId,
            },
        });
        await prisma.promptMedia.createMany({
            data: item.media.map((m, i) => ({
                promptId: prompt.id,
                versionId: version.id,
                mediaType: m.type,
                url: m.url,
                caption: m.caption || item.title,
                orderIndex: i,
            })),
        });
        for (const tagName of item.tags) {
            const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const tag = await prisma.tag.upsert({
                where: { slug: tagSlug },
                update: {},
                create: { name: tagName, slug: tagSlug },
            });
            await prisma.promptTag.upsert({
                where: { promptId_tagId: { promptId: prompt.id, tagId: tag.id } },
                update: {},
                create: { promptId: prompt.id, tagId: tag.id },
            });
        }
        created++;
        console.log(`✅ ${item.category.padEnd(18)} ${item.title}`);
    }
    const counts = await prisma.category.findMany({
        select: { name: true, _count: { select: { prompts: true } } },
        orderBy: { name: 'asc' },
    });
    console.log(`\n🎉 Created ${created}, updated ${updated}.\n`);
    console.log('Prompts per category:');
    for (const c of counts)
        console.log(`  ${c.name.padEnd(20)} ${c._count.prompts}`);
}
main()
    .catch((e) => {
    console.error('\n❌ Import failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
