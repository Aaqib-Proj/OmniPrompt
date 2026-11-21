"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Finds and repairs dead media URLs on prompts.
 *
 *   npx tsx prisma/repair-broken-media.ts              # dry run — reports, changes nothing
 *   npx tsx prisma/repair-broken-media.ts --apply      # replace dead covers
 *   npx tsx prisma/repair-broken-media.ts --apply --remove   # delete the rows instead
 *
 * Why replace rather than delete by default: on the production database 32 of 42
 * prompts had *every* media row dead, so deleting would strip the grid back to
 * mostly blank cards. Replacement keeps the catalogue looking like a catalogue.
 * Pass --remove if you would rather have nothing than a stand-in.
 *
 * Replacements are verified stock photographs used as reference imagery, picked
 * deterministically from a per-category pool by hashing the prompt slug — so the
 * same prompt always gets the same cover, and re-running changes nothing.
 */
const client_1 = require("@prisma/client");
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const prisma = new client_1.PrismaClient();
const APPLY = process.argv.includes('--apply');
const REMOVE = process.argv.includes('--remove');
const CHECK_TIMEOUT_MS = 12000;
const CONCURRENCY = 8;
/**
 * Per-category replacement pools. Every id below was fetched and confirmed to
 * return 200 — do not add one without checking it first, since an unverified id
 * is exactly how this problem started.
 */
const POOLS = {
    images: [
        'photo-1509198397868-475647b2a1e5',
        'photo-1578632767115-351597cf2477',
        'photo-1515886657613-9f3515b0c78f',
        'photo-1544551763-46a013bb70d5',
        'photo-1517411032315-54ef2cb783bb',
        'photo-1509631179647-0177331693ae',
        'photo-1518709268805-4e9042af9f23',
        'photo-1515694346937-94d85e41e6f0',
    ],
    videos: [
        'photo-1432405972618-c60b0225b8f9',
        'photo-1519681393784-d120267933ba',
        'photo-1579783900882-c0d3dad7b119',
        'photo-1470071459604-3b5ec3a7fe05',
        'photo-1509114397022-ed747cca3f65',
        'photo-1518609878373-06d740f60d8b',
    ],
    applications: [
        'photo-1558494949-ef010cbdcc31',
        'photo-1544197150-b99a580bb7a8',
        'photo-1555066931-4365d14bab8c',
        'photo-1526374965328-7f61d4dc18c5',
        'photo-1563986768609-322da13575f3',
        'photo-1550751827-4bd374c3f58b',
        'photo-1498050108023-c5249f4df085',
        'photo-1516321318423-f06f85e504b3',
    ],
    'ui-ux': [
        'photo-1551288049-bebda4e38f71',
        'photo-1460925895917-afdab827c52f',
        'photo-1507238691740-187a5b1d37b8',
        'photo-1639762681485-074b7f938ba0',
        'photo-1507925921958-8a62f3d1a50d',
        'photo-1522335789203-aabd1fc54bc9',
        'photo-1517842645767-c639042777db',
        'photo-1551836022-4c4c79ecde51',
    ],
    'text-writing': [
        'photo-1457369804613-52c61a468e7d',
        'photo-1488590528505-98d2b5aba04b',
        'photo-1504384308090-c894fdcc538d',
        'photo-1557804506-669a67965ba0',
        'photo-1450133064473-71024230f91b',
        'photo-1517694712202-14dd9538aa97',
        'photo-1432888622747-4eb9a8efeb07',
    ],
    'code-free-agents': [
        'photo-1618005182384-a83a8bd57fbe',
        'photo-1551836022-d5d88e9218df',
        'photo-1551836022-b06985bceb24',
        'photo-1522071820081-009f0129c71c',
        'photo-1611974789855-9c2a0a7236a3',
        'photo-1451187580459-43490279c0fa',
    ],
    audio: [
        'photo-1598488035139-bdbb2231ce04',
        'photo-1590602847861-f357a9332bbc',
        'photo-1539185441755-769473a23570',
        'photo-1518609878373-06d740f60d8b',
        'photo-1465847899084-d164df4dedc6',
        'photo-1514525253161-7a46d19cd819',
    ],
};
const FALLBACK_POOL = POOLS.images;
const CAPTIONS = {
    images: 'Reference image',
    videos: 'Reference frame',
    applications: 'Reference: engineering context',
    'ui-ux': 'Reference: interface context',
    'text-writing': 'Reference: writing context',
    'code-free-agents': 'Reference: workflow context',
    audio: 'Reference: studio context',
};
const buildUrl = (id) => `https://images.unsplash.com/${id}?w=1200&auto=format&fit=crop&q=80`;
/** Stable, well-spread index so the same prompt always lands on the same cover. */
function hashIndex(key, modulo) {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) {
        h ^= key.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h) % modulo;
}
const mediaRoot = node_path_1.default.resolve(process.cwd(), process.env.MEDIA_DIR || 'media');
async function isReachable(url) {
    // Locally-served uploads are files on disk, not something to fetch over HTTP.
    if (url.startsWith('/media/')) {
        return (0, node_fs_1.existsSync)(node_path_1.default.join(mediaRoot, url.replace(/^\/media\//, '')));
    }
    if (!/^https?:\/\//.test(url))
        return false;
    try {
        // Some CDNs refuse HEAD but serve GET, so fall back rather than trusting a 405.
        const head = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(CHECK_TIMEOUT_MS) });
        if (head.ok)
            return true;
        if (head.status !== 405 && head.status !== 403)
            return false;
        const get = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(CHECK_TIMEOUT_MS) });
        return get.ok;
    }
    catch {
        return false;
    }
}
async function mapWithLimit(items, limit, fn) {
    const results = new Array(items.length);
    let cursor = 0;
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (cursor < items.length) {
            const i = cursor++;
            results[i] = await fn(items[i]);
        }
    }));
    return results;
}
async function main() {
    const mode = !APPLY ? 'DRY RUN — nothing will change' : REMOVE ? 'APPLY — deleting dead rows' : 'APPLY — replacing dead covers';
    console.log(`\n🔍 Media repair. ${mode}\n`);
    console.log(`   Media root: ${mediaRoot}${(0, node_fs_1.existsSync)(mediaRoot) ? '' : '  (does not exist)'}`);
    // If MEDIA_DIR points somewhere wrong, every locally-hosted upload looks dead and
    // we would overwrite real user media with stock photos. A missing root is a
    // configuration problem, not a data problem — stop rather than "repair" it.
    const localCount = await prisma.promptMedia.count({ where: { url: { startsWith: '/media/' } } });
    if (APPLY && localCount > 0 && !(0, node_fs_1.existsSync)(mediaRoot)) {
        console.error(`\n❌ ${localCount} media rows point at ${mediaRoot}, which does not exist.\n` +
            `   Set MEDIA_DIR to the real uploads directory before running with --apply,\n` +
            `   otherwise genuine uploads would be replaced with stand-in images.\n`);
        process.exit(1);
    }
    const media = await prisma.promptMedia.findMany({
        include: { prompt: { select: { slug: true, title: true, category: { select: { slug: true } } } } },
        orderBy: { createdAt: 'asc' },
    });
    const urls = [...new Set(media.map((m) => m.url))];
    console.log(`Checking ${urls.length} distinct URLs across ${media.length} media rows...`);
    const checked = await mapWithLimit(urls, CONCURRENCY, async (u) => [u, await isReachable(u)]);
    const alive = new Map(checked);
    const dead = media.filter((m) => !alive.get(m.url));
    if (dead.length === 0) {
        console.log('\n✅ Every media URL resolves. Nothing to do.\n');
        return;
    }
    // Report before touching anything, grouped so the scale is obvious.
    const byCategory = new Map();
    for (const m of dead) {
        const c = m.prompt.category?.slug ?? 'uncategorised';
        byCategory.set(c, (byCategory.get(c) ?? 0) + 1);
    }
    console.log(`\n❌ ${dead.length} dead media rows across ${new Set(dead.map((m) => m.prompt.slug)).size} prompts:\n`);
    for (const [cat, n] of [...byCategory].sort((a, b) => b[1] - a[1])) {
        console.log(`   ${cat.padEnd(20)} ${n}`);
    }
    if (!APPLY) {
        console.log('\nSample of what would change:\n');
        for (const m of dead.slice(0, 8)) {
            const cat = m.prompt.category?.slug ?? 'images';
            const pool = POOLS[cat] ?? FALLBACK_POOL;
            const next = REMOVE ? '(row deleted)' : buildUrl(pool[hashIndex(m.prompt.slug + m.orderIndex, pool.length)]);
            console.log(`   ${m.prompt.title.slice(0, 44).padEnd(46)}`);
            console.log(`     ${m.url.slice(0, 76)}`);
            console.log(`     → ${next.slice(0, 76)}\n`);
        }
        console.log('Re-run with --apply to make these changes (add --remove to delete instead).\n');
        return;
    }
    let changed = 0;
    for (const m of dead) {
        if (REMOVE) {
            await prisma.promptMedia.delete({ where: { id: m.id } });
            changed++;
            continue;
        }
        const cat = m.prompt.category?.slug ?? 'images';
        const pool = POOLS[cat] ?? FALLBACK_POOL;
        await prisma.promptMedia.update({
            where: { id: m.id },
            data: {
                url: buildUrl(pool[hashIndex(m.prompt.slug + m.orderIndex, pool.length)]),
                // A dead audio or video file is replaced by a still, so the type has to
                // follow or the player will try to stream a JPEG.
                mediaType: 'IMAGE',
                caption: CAPTIONS[cat] ?? 'Reference image',
            },
        });
        changed++;
    }
    const orphaned = REMOVE
        ? await prisma.prompt.count({ where: { media: { none: {} } } })
        : 0;
    console.log(`\n✅ ${REMOVE ? 'Deleted' : 'Replaced'} ${changed} media rows.`);
    if (REMOVE && orphaned)
        console.log(`⚠️  ${orphaned} prompts now have no media at all.`);
    console.log('');
}
main()
    .catch((e) => {
    console.error('\n❌ Repair failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
