import { Router } from 'express';
import { safeError } from '../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const router = Router();

// Only image/video/audio may be stored. The stored extension is chosen from the
// declared content-type, NOT the user's filename, so an attacker cannot smuggle
// an .html/.svg script onto our origin by naming the file cleverly.
// SVG is deliberately excluded — it can carry executable script.
const ALLOWED_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'audio/mpeg': '.mp3',
  'audio/mp4': '.m4a',
  'audio/webm': '.weba',
};

// Must match the static mount in index.ts. Point MEDIA_DIR at an absolute path
// outside the deploy tree — each deploy runs from a fresh versioned directory,
// so anything stored relative to cwd is orphaned on the next build.
const UPLOADS_DIR = path.resolve(process.cwd(), process.env.MEDIA_DIR || 'media', 'uploads');

// Ensure directory exists. Never throw here: this runs at import time, so a
// permission problem on the media volume would otherwise take the whole API down.
try {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`📁 Uploads directory: ${UPLOADS_DIR}`);
} catch (err: any) {
  console.error(`❌ Could not create uploads directory ${UPLOADS_DIR}:`, err?.message || err);
}

// POST /api/v1/upload — authenticated; only whitelisted media types are stored.
router.post('/', requireAuth, async (req, res): Promise<void> => {
  try {
    const { filename, data, contentType } = req.body;

    if (!data || !filename) {
      res.status(400).json({ error: 'Filename and file data are required.' });
      return;
    }

    // Determine the real content type. Prefer the type embedded in the data URL;
    // fall back to the caller's contentType field. Never trust the filename.
    let base64Data = data;
    let declaredType = (contentType || '').toLowerCase();
    const matches = typeof data === 'string' ? data.match(/^data:([A-Za-z0-9.+/-]+);base64,(.+)$/) : null;
    if (matches && matches.length === 3) {
      declaredType = matches[1].toLowerCase();
      base64Data = matches[2];
    }

    const safeExt = ALLOWED_TYPES[declaredType];
    if (!safeExt) {
      res.status(400).json({ error: 'Unsupported file type. Allowed: PNG, JPEG, GIF, WebP, MP4, WebM, MP3.' });
      return;
    }

    const buffer = Buffer.from(base64Data, 'base64');

    // Max 25MB per file
    if (buffer.length === 0 || buffer.length > 25 * 1024 * 1024) {
      res.status(400).json({ error: 'File must be between 1 byte and 25MB.' });
      return;
    }

    // Filename is sanitized for display only; the extension comes from the type map.
    const cleanBaseName = path.basename(filename).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30) || 'file';
    const uniqueId = crypto.randomBytes(6).toString('hex');
    const storedFileName = `${Date.now()}-${uniqueId}-${cleanBaseName}${safeExt}`;
    const destinationPath = path.join(UPLOADS_DIR, storedFileName);

    await fs.promises.writeFile(destinationPath, buffer);

    const relativeUrl = `/media/uploads/${storedFileName}`;

    res.status(201).json({
      success: true,
      url: relativeUrl,
      filename: storedFileName,
      originalName: filename,
      size: buffer.length,
      contentType: declaredType,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save uploaded file: ' + (safeError(err, 'Unknown error')) });
  }
});

export default router;
