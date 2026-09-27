/**
 * Imports a curated sample of prompts and their real outputs from openly licensed datasets:
 *
 *   - Open Image Preferences v1 (Apache-2.0)  FLUX.1 [dev] and SD 3.5 Large images
 *   - DiffusionDB (CC0-1.0)                    Stable Diffusion v1 images with full parameters
 *   - WebSight v0.2 (CC-BY-4.0)                website ideas + Tailwind HTML + screenshots
 *   - DeepAction v1 (CC-BY-4.0)                text-to-video clips from six video models
 *
 * Usage:  npm run import:open-data
 *
 * Safe to re-run: targets are totals per source, and rows that were already imported are skipped.
 * Media is downloaded to ./media/open-datasets and served by the API under /media.
 * Every prompt records its source, license and credit line.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const prisma = new PrismaClient();

const TARGETS = {
  openImagePreferences: 200,
  diffusionDb: 100,
  webSight: 60,
  deepAction: 60,
};

const MEDIA_DIR = path.resolve(process.cwd(), process.env.MEDIA_DIR || 'media', 'open-datasets');
const MEDIA_URL = '/media/open-datasets';
const VIDEO_SIZE_CAP = 8_000_000;

// Coarse content filter on prompt text; DiffusionDB additionally has NSFW scores.
const BLOCKLIST =
  /\b(nude|nudity|naked|nsfw|sex|sexy|sexual|erotic|porn|hentai|boobs?|breasts?|lingerie|topless|bikini|gore|gory|blood|bloody|corpse|murder|suicide|nazi|hitler|swastika)\b/i;

// DiffusionDB prompts are raw 2022 user input and often depict real, named people. Only keep prompts
// about scenes, objects, animals and places, and drop anything mentioning people or a full name.
const DIFFUSIONDB_SUBJECTS =
  /\b(landscape|city|cityscape|skyline|forest|jungle|mountains?|castle|temple|house|cottage|cabin|interior|room|library|street|village|town|island|ocean|sea|lake|river|waterfall|desert|space|planet|galaxy|nebula|spaceship|robot|mech|car|train|ship|boat|flowers?|trees?|garden|food|pizza|burger|cake|coffee|cat|dog|bird|fox|owl|wolf|dragon|creature|isometric|architecture|building|tower|bridge|ruins|sunset|sunrise|clouds|still life|vase|market|lighthouse|cave|underwater)\b/i;
const DIFFUSIONDB_PEOPLE =
  /\b(person|people|man|men|woman|women|girls?|boys?|lady|ladies|guy|child|children|kids?|baby|teen|model|actor|actress|celebrity|president|singer|rapper|politician|portrait|selfie|face|skin|body|figure|he|she|his|her)\b/i;
const PERSON_NAME = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/; // e.g. "Ted Cruz"

const isSafeDiffusionDbPrompt = (prompt: string) =>
  DIFFUSIONDB_SUBJECTS.test(prompt) &&
  !DIFFUSIONDB_PEOPLE.test(prompt) &&
  !PERSON_NAME.test(prompt) &&
  !BLOCKLIST.test(prompt);

// ---------------------------------------------------------------------------------------------
// Helpers

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class NonRetryableError extends Error {}

// Fetches a URL and reads its body, retrying transient failures. The body is read inside the
// retry because connections can drop mid-download ("terminated").
async function request<T>(url: string, read: (res: Response) => Promise<T>, attempts = 6): Promise<T> {
  for (let i = 0; ; i++) {
    let waitMs = 2000 * 2 ** i;
    try {
      const res = await fetch(url);
      if (res.ok) return await read(res);
      if (![429, 500, 502, 503, 504].includes(res.status)) throw new NonRetryableError(`HTTP ${res.status} for ${url}`);
      if (i >= attempts - 1) throw new Error(`HTTP ${res.status} for ${url}`);
      // Honor the server's rate-limit hint when it gives one.
      const retryAfter = Number(res.headers.get('retry-after'));
      if (retryAfter > 0) waitMs = Math.max(waitMs, retryAfter * 1000);
    } catch (err) {
      if (err instanceof NonRetryableError || i >= attempts - 1) throw err;
    }
    await sleep(waitMs);
  }
}

const getJson = <T>(url: string): Promise<T> => request(url, (res) => res.json() as Promise<T>);

async function download(url: string, relativePath: string): Promise<string> {
  const dest = path.join(MEDIA_DIR, relativePath);
  const publicUrl = `${MEDIA_URL}/${relativePath}`;
  try {
    await stat(dest);
    return publicUrl; // Already downloaded on a previous run.
  } catch {
    // Not there yet.
  }
  const body = await request(url, (res) => res.arrayBuffer());
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(body));
  return publicUrl;
}

type Row = Record<string, any> & { __index: number };

async function datasetRows(dataset: string, config: string, split: string, offset: number, length: number) {
  const url =
    `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(dataset)}` +
    `&config=${config}&split=${split}&offset=${offset}&length=${length}`;
  const data = await getJson<{ rows: { row_idx: number; row: Record<string, any> }[]; num_rows_total: number }>(url);
  await sleep(400); // Stay well under the dataset viewer's rate limit.
  return {
    rows: data.rows.map((r) => ({ ...r.row, __index: r.row_idx }) as Row),
    total: data.num_rows_total,
  };
}

// A page that still fails after retries is skipped rather than ending the whole source.
const pageRows = (dataset: string, config: string, split: string, offset: number, length: number) =>
  datasetRows(dataset, config, split, offset, length).catch((err: Error) => {
    console.warn(`  skipped page at offset ${offset}: ${err.message}`);
    return { rows: [] as Row[], total: 0 };
  });

// Page offsets spread evenly across a dataset, so the sample isn't one narrow slice.
const spreadOffsets = (total: number, pages: number, pageSize: number) =>
  Array.from({ length: pages }, (_, i) => Math.max(0, Math.min(total - pageSize, Math.floor((i * total) / pages))));

const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/^["'\s]+|["'\s]+$/g, '').trim();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');

const shortHash = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 7);

const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const truncate = (s: string, max: number) => {
  if (s.length <= max) return s;
  const cut = s.lastIndexOf(' ', max - 1);
  return `${s.slice(0, cut > 0 ? cut : max - 1)}…`;
};

// A readable title from a prompt: its leading clauses (at least four words when the prompt
// allows, so keyword-style prompts don't end up titled "Baroque"), trimmed to a word boundary.
const titleFrom = (text: string, max = 72) => {
  const clauses = clean(text).split(/[,.;:|(\n]/).map((s) => s.trim()).filter(Boolean);
  let title = clauses[0] ?? clean(text);
  for (let i = 1; i < clauses.length && title.split(' ').length < 4; i++) title += `, ${clauses[i]}`;
  return sentenceCase(truncate(title, max).replace(/…$/, ''));
};

// SQLite can't handle concurrent tag upserts safely, so all DB writes go through one queue.
let writeQueue: Promise<unknown> = Promise.resolve();
function serialized<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn);
  writeQueue = run.catch(() => undefined);
  return run;
}

// ---------------------------------------------------------------------------------------------
// Saving

interface Context {
  authorId: string;
  categories: Record<string, string>;
  models: Record<string, string>;
}

interface MediaInput {
  mediaType: 'IMAGE' | 'VIDEO';
  url: string;
  caption?: string;
}

interface ImportedPrompt {
  key: string; // Stable per source row; becomes part of the slug.
  title: string;
  shortDescription: string;
  fullPrompt: string;
  descriptionMd: string;
  category: string;
  model: string;
  license: string;
  source: { name: string; url: string; attribution: string };
  parameters?: Record<string, unknown>;
  tags: string[];
  sandboxCode?: string;
  media: () => Promise<MediaInput[]>;
}

type SaveResult = 'created' | 'exists' | 'failed';

async function savePrompt(ctx: Context, p: ImportedPrompt): Promise<SaveResult> {
  const keyHash = shortHash(p.key);
  const slug = `${slugify(p.title)}-${keyHash}`;
  // Match on the key hash rather than the whole slug, so title changes between runs can't create duplicates.
  const existing = await prisma.prompt.findFirst({
    where: { sourceName: p.source.name, slug: { endsWith: `-${keyHash}` } },
    select: { id: true },
  });
  if (existing) return 'exists';

  let media: MediaInput[];
  try {
    media = await p.media();
  } catch (err) {
    console.warn(`  skipped ${p.key}: ${(err as Error).message}`);
    return 'failed';
  }

  // Tags are stored in slug form so labels like "Sci-Fi" and "sci fi" map to one tag.
  const tags = Array.from(new Set(p.tags.map(slugify).filter(Boolean)));

  return serialized(async () => {
    try {
      await prisma.prompt.create({
        data: {
          authorId: ctx.authorId,
          title: p.title,
          slug,
          shortDescription: p.shortDescription,
          fullPrompt: p.fullPrompt,
          descriptionMd: p.descriptionMd,
          categoryId: ctx.categories[p.category],
          modelId: ctx.models[p.model],
          license: p.license,
          sandboxCode: p.sandboxCode,
          sourceName: p.source.name,
          sourceUrl: p.source.url,
          attribution: p.source.attribution,
          versions: {
            create: {
              versionNumber: 'v1.0',
              title: p.title,
              promptText: p.fullPrompt,
              parametersJson: JSON.stringify(p.parameters ?? {}),
              changelog: `Imported from ${p.source.name}.`,
              editorId: ctx.authorId,
            },
          },
          media: { create: media.map((m, orderIndex) => ({ ...m, orderIndex })) },
          tags: {
            create: tags.map((tagSlug) => ({
              tag: { connectOrCreate: { where: { slug: tagSlug }, create: { name: tagSlug, slug: tagSlug } } },
            })),
          },
        },
      });
      return 'created' as const;
    } catch (err) {
      // One bad row shouldn't abort the whole source.
      console.warn(`  skipped ${p.key}: ${(err as Error).message.split('\n').pop()}`);
      return 'failed' as const;
    }
  });
}

// Targets are totals per source: each importer starts from what's already in the database and
// only counts newly created prompts, so re-running tops up instead of adding more.
const countImported = (sourceName: string) => prisma.prompt.count({ where: { sourceName } });
const countCreated = (results: SaveResult[]) => results.filter((r) => r === 'created').length;

// ---------------------------------------------------------------------------------------------
// Open Image Preferences v1 — Apache-2.0

async function importOpenImagePreferences(ctx: Context, target: number) {
  const dataset = 'data-is-better-together/open-image-preferences-v1';
  const url = `https://huggingface.co/datasets/${dataset}`;
  let saved = await countImported('Open Image Preferences v1');
  if (saved >= target) return saved;
  const { total } = await datasetRows(dataset, 'default', 'cleaned', 0, 1);

  for (const offset of spreadOffsets(total, 40, 40)) {
    if (saved >= target) break;
    const { rows } = await pageRows(dataset, 'default', 'cleaned', offset, 40);
    const candidates = rows.filter(
      (r) =>
        r.prompt &&
        r.quality_prompt &&
        r.image_quality_dev?.src &&
        r.image_quality_sd?.src &&
        !BLOCKLIST.test(`${r.prompt} ${r.quality_prompt}`)
    );

    const batch = candidates.slice(0, Math.min(8, target - saved));
    const results = await Promise.all(
      batch.map((r) => {
        // Every fourth row uses the SD 3.5 output; the rest use FLUX.1 [dev].
        const useSd = r.__index % 4 === 3;
        const image = useSd ? r.image_quality_sd : r.image_quality_dev;
        const modelName = useSd ? 'Stable Diffusion 3.5 Large' : 'FLUX.1 [dev]';
        const category = clean(String(r.category || ''));
        const subcategory = clean(String(r.subcategory || ''));

        return savePrompt(ctx, {
          key: `oip:${r.__index}`,
          title: titleFrom(r.prompt),
          shortDescription: truncate(clean(r.simplified_prompt || r.quality_prompt), 200),
          fullPrompt: clean(r.quality_prompt),
          descriptionMd: [
            '### About this prompt',
            `Generated with **${modelName}** for the [Open Image Preferences](${url}) dataset, where the community compared outputs from FLUX.1 [dev] and Stable Diffusion 3.5 Large for the same prompts.`,
            '',
            `- **Original idea:** ${clean(r.prompt)}`,
            r.simplified_prompt ? `- **Simplified version:** ${clean(r.simplified_prompt)}` : '',
            category ? `- **Category:** ${category}${subcategory ? ` › ${subcategory}` : ''}` : '',
            '',
            '### Source & license',
            `Prompt and image from [Open Image Preferences v1](${url}) by Data Is Better Together, licensed under Apache 2.0.`,
          ]
            .filter((line, i, all) => line !== '' || all[i - 1] !== '')
            .join('\n'),
          category: 'images',
          model: useSd ? 'sd3-5-large' : 'flux-1-dev',
          license: 'Apache-2.0',
          source: {
            name: 'Open Image Preferences v1',
            url,
            attribution: 'Open Image Preferences v1 by Data Is Better Together · Apache 2.0',
          },
          parameters: { width: image.width, height: image.height },
          tags: [category, subcategory],
          media: async () => [
            {
              mediaType: 'IMAGE',
              url: await download(image.src, `oip/${r.__index}-${useSd ? 'sd35' : 'flux-dev'}.jpg`),
              caption: `${modelName} output`,
            },
          ],
        });
      })
    );
    saved += countCreated(results);
  }
  return saved;
}

// ---------------------------------------------------------------------------------------------
// DiffusionDB — CC0-1.0. Read through a 50k-row random subset that the dataset viewer can serve;
// the original repo only ships 600 MB zip parts.

async function importDiffusionDb(ctx: Context, target: number) {
  const subset = 'mrm8488/diffusiondb_2m_random_50k';
  const url = 'https://huggingface.co/datasets/poloclub/diffusiondb';
  let saved = await countImported('DiffusionDB');
  if (saved >= target) return saved;
  const { total } = await datasetRows(subset, 'default', 'train', 0, 1);
  const seen = new Set<string>();

  // The subject filter is strict, so scan more of the subset than the other sources need.
  for (const offset of spreadOffsets(total, 100, 50)) {
    if (saved >= target) break;
    const { rows } = await pageRows(subset, 'default', 'train', offset, 50);
    const candidates = rows.filter((r) => {
      const prompt = clean(String(r.prompt || ''));
      const ok =
        r.image?.src &&
        prompt.length >= 25 &&
        prompt.length <= 400 &&
        Number(r.image_nsfw) < 0.2 &&
        Number(r.prompt_nsfw) < 0.05 &&
        isSafeDiffusionDbPrompt(prompt) &&
        !seen.has(prompt.toLowerCase());
      if (ok) seen.add(prompt.toLowerCase());
      return ok;
    });

    const batch = candidates.slice(0, Math.min(5, target - saved));
    const results = await Promise.all(
      batch.map((r) => {
        const prompt = clean(r.prompt);
        const parameters = {
          seed: Number(r.seed),
          steps: Number(r.step),
          cfg_scale: Number(r.cfg),
          sampler: r.sampler,
          width: Number(r.width),
          height: Number(r.height),
        };
        return savePrompt(ctx, {
          key: `diffusiondb:${r.seed}:${shortHash(prompt)}`,
          title: titleFrom(prompt),
          shortDescription: `Stable Diffusion v1 image from DiffusionDB — ${parameters.width}×${parameters.height}, ${parameters.steps} steps, CFG ${parameters.cfg_scale}.`,
          fullPrompt: prompt,
          descriptionMd: [
            '### About this prompt',
            'A real prompt written by a Stable Diffusion user in 2022, with the exact seed and sampler settings that produced the image. Re-running it with the same settings on Stable Diffusion v1 should reproduce the output.',
            '',
            '### Source & license',
            `Prompt and image from [DiffusionDB](${url}) (Wang et al., Polo Club of Data Science), dedicated to the public domain under CC0 1.0.`,
          ].join('\n'),
          category: 'images',
          model: 'stable-diffusion-1',
          license: 'CC0-1.0',
          source: { name: 'DiffusionDB', url, attribution: 'DiffusionDB by Polo Club of Data Science · CC0 1.0' },
          parameters,
          tags: ['stable-diffusion', 'diffusiondb'],
          media: async () => [
            {
              mediaType: 'IMAGE',
              url: await download(r.image.src, `diffusiondb/${r.seed}-${shortHash(prompt)}.jpg`),
              caption: 'Stable Diffusion v1 output',
            },
          ],
        });
      })
    );
    saved += countCreated(results);
  }
  return saved;
}

// ---------------------------------------------------------------------------------------------
// WebSight v0.2 — CC-BY-4.0

async function importWebSight(ctx: Context, target: number) {
  const dataset = 'HuggingFaceM4/WebSight';
  const url = `https://huggingface.co/datasets/${dataset}`;
  let saved = await countImported('WebSight v0.2');
  if (saved >= target) return saved;
  const { total } = await datasetRows(dataset, 'v0.2', 'train', 0, 1);
  const seen = new Set<string>();

  // Few, larger pages: the dataset viewer rate-limits bursts of small requests.
  for (const offset of spreadOffsets(total, 25, 10)) {
    if (saved >= target) break;
    const { rows } = await pageRows(dataset, 'v0.2', 'train', offset, 10);
    const candidates = rows.filter((r) => {
      const idea = clean(String(r.llm_generated_idea || ''));
      const name = idea.split(':')[0].trim().toLowerCase();
      const ok = r.image?.src && r.text && r.text.length < 60_000 && idea.length > 20 && !seen.has(name);
      if (ok) seen.add(name);
      return ok;
    });

    const batch = candidates.slice(0, Math.min(3, target - saved));
    const results = await Promise.all(
      batch.map((r) => {
        const idea = clean(r.llm_generated_idea);
        const [namePart, ...rest] = idea.split(':');
        const name = clean(namePart);
        const summary = clean(rest.join(':')) || idea;
        return savePrompt(ctx, {
          key: `websight:${r.__index}`,
          title: name.length <= 48 ? `${sentenceCase(name)} website` : titleFrom(idea),
          shortDescription: truncate(summary, 200),
          fullPrompt: idea,
          descriptionMd: [
            '### About this prompt',
            'A website idea written by **Mistral-7B**, which was then turned into a single-page Tailwind CSS site by **DeepSeek Coder 33B Instruct** using the WebSight code-generation instruction. Open the **Live preview** tab to try the generated page.',
            '',
            '### Source & license',
            `Idea, code and screenshot from [WebSight v0.2](${url}) by Hugging Face (HuggingFaceM4), licensed under CC BY 4.0.`,
          ].join('\n'),
          category: 'ui-ux',
          model: 'deepseek-coder-33b',
          license: 'CC-BY-4.0',
          source: { name: 'WebSight v0.2', url, attribution: 'WebSight v0.2 by Hugging Face (HuggingFaceM4) · CC BY 4.0' },
          parameters: { framework: 'Tailwind CSS 2.2', screenshot: `${r.image.width}×${r.image.height}` },
          tags: ['tailwind', 'landing-page', 'websight'],
          sandboxCode: r.text,
          media: async () => [
            {
              mediaType: 'IMAGE',
              url: await download(r.image.src, `websight/${r.__index}.jpg`),
              caption: 'Screenshot of the generated page',
            },
          ],
        });
      })
    );
    saved += countCreated(results);
  }
  return saved;
}

// ---------------------------------------------------------------------------------------------
// DeepAction v1 — CC-BY-4.0 for the AI-generated folders (the Pexels folder is not used)

const DEEPACTION_MODELS: { folder: string; model: string; label: string }[] = [
  { folder: 'Veo', model: 'veo', label: 'Google Veo (pre-release)' },
  { folder: 'CogVideoX5B', model: 'cogvideox-5b', label: 'CogVideoX-5B' },
  { folder: 'VideoPoet', model: 'videopoet', label: 'VideoPoet' },
  { folder: 'RunwayML', model: 'runwayml', label: 'Runway' },
  { folder: 'BDAnimateDiffLightning', model: 'animatediff-lightning', label: 'AnimateDiff-Lightning' },
  { folder: 'StableDiffusion', model: 'stable-diffusion-video', label: 'Stable Diffusion (video)' },
];

async function importDeepAction(ctx: Context, target: number) {
  const repo = 'faridlab/deepaction_v1';
  const url = `https://huggingface.co/datasets/${repo}`;
  const csv = await request(`${url}/resolve/main/captions.csv`, (res) => res.text());
  const captions = csv
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.match(/^(\d+),(.+?),?$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => ({ id: m[1], prompt: clean(m[2]) }))
    // Deterministic shuffle so the sample covers varied actions.
    .sort((a, b) => shortHash(a.id).localeCompare(shortHash(b.id)));

  let saved = await countImported('DeepAction v1');
  for (let i = 0; i < captions.length && saved < target; i++) {
    const { id, prompt } = captions[i];

    // Rotate models; fall through to the next one if every clip for this model is too large.
    let pick: { entry: (typeof DEEPACTION_MODELS)[number]; file: string } | null = null;
    for (let attempt = 0; attempt < DEEPACTION_MODELS.length && !pick; attempt++) {
      const entry = DEEPACTION_MODELS[(i + attempt) % DEEPACTION_MODELS.length];
      const files = await getJson<{ path: string; size: number }[]>(
        `https://huggingface.co/api/datasets/${repo}/tree/main/${entry.folder}/${id}`
      ).catch(() => []);
      const smallest = files.filter((f) => f.path.endsWith('.mp4')).sort((a, b) => a.size - b.size)[0];
      if (smallest && smallest.size <= VIDEO_SIZE_CAP) pick = { entry, file: smallest.path };
    }
    if (!pick) continue;

    const { entry, file } = pick;
    const title = prompt.replace(/\.$/, '');
    const result = await savePrompt(ctx, {
      key: `deepaction:${file}`,
      title,
      shortDescription: `Text-to-video clip from ${entry.label}, part of the DeepAction dataset of everyday human actions.`,
      fullPrompt: prompt,
      descriptionMd: [
        '### About this prompt',
        `A short, plain prompt used to benchmark text-to-video models on ordinary human motion. This clip was generated by **${entry.label}**; the dataset normalizes all clips to 512×512.`,
        '',
        '### Source & license',
        `Video from [DeepAction v1](${url}) by Matyas Bohacek and Hany Farid, licensed under CC BY 4.0.`,
      ].join('\n'),
      category: 'videos',
      model: entry.model,
      license: 'CC-BY-4.0',
      source: { name: 'DeepAction v1', url, attribution: 'DeepAction v1 by Matyas Bohacek & Hany Farid · CC BY 4.0' },
      parameters: { resolution: '512×512' },
      tags: ['text-to-video', 'people', 'deepaction'],
      media: async () => [
        {
          mediaType: 'VIDEO',
          url: await download(`${url}/resolve/main/${file}`, `deepaction/${file.replace(/\//g, '-')}`),
          caption: `${entry.label} output`,
        },
      ],
    });
    if (result === 'created') saved++;
  }
  return saved;
}

// Removes previously imported DiffusionDB prompts that fail the current content filter, so
// tightening the filter and re-running also cleans up older imports.
async function pruneDiffusionDb() {
  const imported = await prisma.prompt.findMany({
    where: { sourceName: 'DiffusionDB' },
    select: { id: true, fullPrompt: true, media: { select: { url: true } } },
  });
  const stale = imported.filter((p) => !isSafeDiffusionDbPrompt(p.fullPrompt));
  for (const p of stale) {
    await prisma.prompt.delete({ where: { id: p.id } });
    for (const m of p.media) {
      await unlink(path.join(MEDIA_DIR, m.url.replace(`${MEDIA_URL}/`, ''))).catch(() => undefined);
    }
  }
  return stale.length;
}

// Re-derives DiffusionDB titles from their prompts, so title-rule improvements apply to earlier imports.
async function refreshDiffusionDbTitles() {
  const imported = await prisma.prompt.findMany({
    where: { sourceName: 'DiffusionDB' },
    select: { id: true, title: true, fullPrompt: true },
  });
  let updated = 0;
  for (const p of imported) {
    const title = titleFrom(p.fullPrompt);
    if (title === p.title) continue;
    await prisma.prompt.update({
      where: { id: p.id },
      data: { title, versions: { updateMany: { where: {}, data: { title } } } },
    });
    updated++;
  }
  return updated;
}

// ---------------------------------------------------------------------------------------------

const MODELS = [
  { name: 'FLUX.1 [dev]', slug: 'flux-1-dev', provider: 'Black Forest Labs', modality: 'Image', badgeColor: '#f43f5e', description: '12B-parameter open-weight text-to-image model from Black Forest Labs, distilled from FLUX.1 [pro].', officialUrl: 'https://huggingface.co/black-forest-labs/FLUX.1-dev' },
  { name: 'Stability SD3.5 Large', slug: 'sd3-5-large', provider: 'Stability AI', modality: 'Image', badgeColor: '#a855f7', description: 'Highly customizable open diffusion model for concept artists, matte painters, and custom LoRA pipelines.', officialUrl: 'https://stability.ai' },
  { name: 'Stable Diffusion v1', slug: 'stable-diffusion-1', provider: 'Stability AI', modality: 'Image', badgeColor: '#8b5cf6', description: 'The original open latent diffusion model (2022). DiffusionDB captures prompts from its public Discord beta.', officialUrl: 'https://github.com/CompVis/stable-diffusion' },
  { name: 'DeepSeek Coder 33B Instruct', slug: 'deepseek-coder-33b', provider: 'DeepSeek', modality: 'UI/Code', badgeColor: '#0284c7', description: 'Open code model used to generate the Tailwind CSS websites in WebSight.', contextWindow: '16k', officialUrl: 'https://huggingface.co/deepseek-ai/deepseek-coder-33b-instruct' },
  { name: 'Google Veo (pre-release)', slug: 'veo', provider: 'Google', modality: 'Video', badgeColor: '#4285f4', description: 'Google DeepMind text-to-video model. DeepAction clips come from a pre-release version.', officialUrl: 'https://deepmind.google/models/veo/' },
  { name: 'Runway', slug: 'runwayml', provider: 'Runway', modality: 'Video', badgeColor: '#16a34a', description: 'Runway text-to-video generation, as sampled in the DeepAction dataset.', officialUrl: 'https://runwayml.com' },
  { name: 'CogVideoX-5B', slug: 'cogvideox-5b', provider: 'Zhipu AI', modality: 'Video', badgeColor: '#0ea5e9', description: 'Open-weight 5B-parameter text-to-video diffusion transformer from Zhipu AI and Tsinghua (THUDM).', officialUrl: 'https://huggingface.co/THUDM/CogVideoX-5b' },
  { name: 'VideoPoet', slug: 'videopoet', provider: 'Google', modality: 'Video', badgeColor: '#ea4335', description: 'Google Research language-model-based video generator.', officialUrl: 'https://sites.research.google/videopoet/' },
  { name: 'AnimateDiff-Lightning', slug: 'animatediff-lightning', provider: 'ByteDance', modality: 'Video', badgeColor: '#f59e0b', description: 'Distilled AnimateDiff model from ByteDance that generates short clips in a few steps.', officialUrl: 'https://huggingface.co/ByteDance/AnimateDiff-Lightning' },
  { name: 'Stable Diffusion (video)', slug: 'stable-diffusion-video', provider: 'Stability AI', modality: 'Video', badgeColor: '#c084fc', description: 'Clips labeled "StableDiffusion" in the DeepAction dataset, generated with a Stable Diffusion–based video pipeline.' },
];

async function main() {
  console.log(`Media directory: ${MEDIA_DIR}`);

  const author = await prisma.user.upsert({
    where: { username: 'open-datasets' },
    update: {},
    create: {
      username: 'open-datasets',
      name: 'Open Datasets',
      email: 'open-datasets@promptit.local',
      // No one signs in as this account.
      passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
      bio: 'Prompts and outputs imported from openly licensed datasets. Every prompt links back to its source and license.',
      role: 'CREATOR',
    },
  });

  const categories = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]));
  for (const slug of ['images', 'videos', 'ui-ux']) {
    if (!categories[slug]) throw new Error(`Category "${slug}" is missing. Run \`npm run db:setup\` first.`);
  }

  const models: Record<string, string> = {};
  for (const m of MODELS) {
    const record = await prisma.model.upsert({ where: { slug: m.slug }, update: {}, create: m });
    models[m.slug] = record.id;
  }

  const pruned = await pruneDiffusionDb();
  if (pruned > 0) console.log(`Removed ${pruned} DiffusionDB prompts that no longer pass the content filter.`);
  const retitled = await refreshDiffusionDbTitles();
  if (retitled > 0) console.log(`Updated ${retitled} DiffusionDB titles.`);

  const ctx: Context = { authorId: author.id, categories, models };
  const sources: [string, (ctx: Context, target: number) => Promise<number>, number][] = [
    ['Open Image Preferences', importOpenImagePreferences, TARGETS.openImagePreferences],
    ['DiffusionDB', importDiffusionDb, TARGETS.diffusionDb],
    ['WebSight', importWebSight, TARGETS.webSight],
    ['DeepAction', importDeepAction, TARGETS.deepAction],
  ];

  const summary: Record<string, { target: number; saved: number | string }> = {};
  for (const [name, run, target] of sources) {
    console.log(`\nImporting ${name} (target ${target})…`);
    try {
      summary[name] = { target, saved: await run(ctx, target) };
    } catch (err) {
      console.error(`  ${name} failed: ${(err as Error).message}`);
      summary[name] = { target, saved: `error: ${(err as Error).message}` };
    }
  }

  console.log('\nDone.');
  console.table(summary);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
