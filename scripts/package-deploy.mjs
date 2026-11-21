// Builds the two archives that get uploaded to Hostinger.
//
//   node scripts/package-deploy.mjs
//     -> backend-deploy.zip   (upload to the api.syncnomy.com Node app, then Build)
//     -> frontend-dist.zip    (extract at public_html of the site)
//
// Three details here are load-bearing and were each learned the hard way:
//
//   * prisma/schema.prisma must be the MySQL schema. Shipping the SQLite one makes
//     Prisma hang at connect time against the MariaDB server instead of erroring.
//   * The deployed package.json's "build" runs `prisma generate && prisma db push`,
//     not `tsc`. The host doesn't install devDependencies the way a local install
//     does, so TypeScript compiles here and dist/ ships prebuilt. Hostinger only
//     ever runs the script literally named "build".
//   * node_modules, media/ and prisma/dev.db are excluded. With them the archive is
//     over 500MB; without, it's well under a megabyte.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const staging = join(root, '.deploy-staging');

const ps = (script) =>
  execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });

const zip = (sourceGlob, outFile) => {
  if (existsSync(outFile)) rmSync(outFile);
  ps(`Compress-Archive -Path '${sourceGlob}' -DestinationPath '${outFile}' -Force`);
};

const kb = (f) => `${(statSync(f).size / 1024).toFixed(1)} KB`;

rmSync(staging, { recursive: true, force: true });

// ---------- backend ----------
const backend = join(root, 'backend');
const stage = join(staging, 'backend');
mkdirSync(stage, { recursive: true });

if (!existsSync(join(backend, 'dist/index.js'))) {
  console.error('backend/dist is missing — run `npm run build` in backend/ first.');
  process.exit(1);
}

for (const entry of ['dist', 'src', 'package-lock.json', 'tsconfig.json']) {
  cpSync(join(backend, entry), join(stage, entry), { recursive: true });
}

mkdirSync(join(stage, 'prisma'), { recursive: true });
for (const entry of [
  'schema.mysql.prisma',
  'schema.sqlite.prisma',
  'seed.ts',
  'import-open-datasets.ts',
  'import-signature-prompts.ts',
  'repair-broken-media.ts',
  // Compiled alongside the .ts because tsx is a devDependency and the host does not
  // install it — these have to be runnable with plain `node`.
  'import-signature-prompts.js',
  'repair-broken-media.js',
]) {
  cpSync(join(backend, 'prisma', entry), join(stage, 'prisma', entry));
}
// The MySQL schema is what the server must actually read.
cpSync(join(backend, 'prisma/schema.mysql.prisma'), join(stage, 'prisma/schema.prisma'));

const pkg = JSON.parse(readFileSync(join(backend, 'package.json'), 'utf8'));
pkg.scripts.build = 'prisma generate && prisma db push';
delete pkg.scripts.dev;
writeFileSync(join(stage, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);

const backendZip = join(root, 'backend-deploy.zip');
zip(join(stage, '*'), backendZip);
console.log(`backend-deploy.zip   ${kb(backendZip)}`);

// ---------- frontend ----------
const dist = join(root, 'frontend/dist');
if (!existsSync(join(dist, 'index.html'))) {
  console.error('frontend/dist is missing — run `npm run build` in frontend/ first.');
  process.exit(1);
}
if (!existsSync(join(dist, '.htaccess'))) {
  console.error('frontend/dist/.htaccess is missing — the SPA rewrite and CSP come from it.');
  process.exit(1);
}

const frontendZip = join(root, 'frontend-dist.zip');
zip(join(dist, '*'), frontendZip);

// Compress-Archive quietly skips dotfiles in some shells, and a missing .htaccess
// means every deep link 404s once it's live — so confirm rather than assume.
const listed = ps(
  `Add-Type -A System.IO.Compression.FileSystem; ` +
    `([IO.Compression.ZipFile]::OpenRead('${frontendZip}')).Entries | ForEach-Object { $_.FullName }`
);
if (!listed.split(/\r?\n/).some((n) => n.trim() === '.htaccess')) {
  console.error('frontend-dist.zip is missing .htaccess — add it to the server by hand after extracting.');
  process.exit(1);
}
console.log(`frontend-dist.zip    ${kb(frontendZip)} (.htaccess included)`);

rmSync(staging, { recursive: true, force: true });
