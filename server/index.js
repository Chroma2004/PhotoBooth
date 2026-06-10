import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '150mb' }));
app.use('/uploads', express.static(uploadsDir));

const db = await open({
  filename: path.join(__dirname, 'photo2y.db'),
  driver: sqlite3.Database,
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    src TEXT NOT NULL,
    frames TEXT NOT NULL,
    stripColor TEXT,
    stripImage TEXT,
    selectedStripColor TEXT,
    selectedStripImage TEXT,
    filter TEXT,
    classicFilter TEXT,
    stickers TEXT DEFAULT '[]',
    createdAt TEXT NOT NULL,
    archivedAt TEXT
  );
`);

const tableInfo = await db.all(`PRAGMA table_info(photos);`);
const hasStickersColumn = tableInfo.some((column) => column.name === 'stickers');

if (!hasStickersColumn) {
  await db.exec(`ALTER TABLE photos ADD COLUMN stickers TEXT DEFAULT '[]';`);
}

const isDataUrl = (value = '') => value.startsWith('data:image/');

const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const getUploadPathFromUrl = (url = '') => {
  const marker = '/uploads/';
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) return null;

  const filename = url.slice(markerIndex + marker.length);

  if (
    !filename ||
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    return null;
  }

  return path.join(uploadsDir, filename);
};

const saveDataUrlImage = async (dataUrl, prefix = 'photo') => {
  if (!isDataUrl(dataUrl)) return dataUrl;

  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);

  if (!match) {
    throw new Error('Invalid image data URL.');
  }

  const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
  const imageBuffer = Buffer.from(match[2], 'base64');
  const safePrefix = prefix.replace(/[^a-z0-9-_]/gi, '').toLowerCase() || 'photo';
  const filename = `${safePrefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;
  const filePath = path.join(uploadsDir, filename);

  await fs.promises.writeFile(filePath, imageBuffer);

  return `/uploads/${filename}`;
};

const normalizePhotoForResponse = (req, photo) => {
  const baseUrl = getBaseUrl(req);
  const frames = JSON.parse(photo.frames || '[]');
  const stickers = JSON.parse(photo.stickers || '[]');

  return {
    ...photo,
    src: photo.src?.startsWith('/uploads/') ? `${baseUrl}${photo.src}` : photo.src,
    frames: frames.map((frame) =>
      frame?.startsWith('/uploads/') ? `${baseUrl}${frame}` : frame
    ),
    stickers,
    photoStickers: stickers,
  };
};

app.get('/api/photos', async (req, res) => {
  const photos = await db.all(`
    SELECT *
    FROM photos
    WHERE archivedAt IS NULL
    ORDER BY createdAt DESC
  `);

  res.json(photos.map((photo) => normalizePhotoForResponse(req, photo)));
});

app.get('/api/photos/archive', async (req, res) => {
  const photos = await db.all(`
    SELECT *
    FROM photos
    WHERE archivedAt IS NOT NULL
    ORDER BY archivedAt DESC
  `);

  res.json(photos.map((photo) => normalizePhotoForResponse(req, photo)));
});

app.post('/api/photos', async (req, res) => {
  try {
    const photo = req.body;

    if (!photo?.id || !photo?.src) {
      res.status(400).json({ error: 'Missing photo id or src.' });
      return;
    }

    const savedSrc = await saveDataUrlImage(photo.src, `${photo.id}-strip`);

    const rawFrames =
      Array.isArray(photo.frames) && photo.frames.length ? photo.frames : [photo.src];

    const savedFrames = await Promise.all(
      rawFrames.map((frame, index) =>
        saveDataUrlImage(frame, `${photo.id}-frame-${index + 1}`)
      )
    );

    await db.run(
      `
      INSERT OR REPLACE INTO photos (
        id,
        label,
        src,
        frames,
        stripColor,
        stripImage,
        selectedStripColor,
        selectedStripImage,
        filter,
        classicFilter,
        stickers,
        createdAt,
        archivedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        photo.id,
        photo.label || 'Photo Strip',
        savedSrc,
        JSON.stringify(savedFrames),
        photo.stripColor || '',
        photo.stripImage || '',
        photo.selectedStripColor || photo.stripColor || '',
        photo.selectedStripImage || photo.stripImage || '',
        photo.filter || '',
        photo.classicFilter || '',
        JSON.stringify(Array.isArray(photo.stickers) ? photo.stickers : photo.photoStickers || []),
        photo.createdAt || new Date().toISOString(),
        photo.archivedAt || null,
      ]
    );

    res.json({
      success: true,
      photo: normalizePhotoForResponse(req, {
        ...photo,
        src: savedSrc,
        frames: JSON.stringify(savedFrames),
        stickers: JSON.stringify(Array.isArray(photo.stickers) ? photo.stickers : photo.photoStickers || []),
      }),
    });
  } catch (error) {
    console.error('Failed to save photo:', error);
    res.status(500).json({ error: 'Failed to save photo.' });
  }
});

app.patch('/api/photos/:id/archive', async (req, res) => {
  await db.run(
    `
    UPDATE photos
    SET archivedAt = ?
    WHERE id = ?
    `,
    [new Date().toISOString(), req.params.id]
  );

  res.json({ success: true });
});

app.patch('/api/photos/:id/restore', async (req, res) => {
  await db.run(
    `
    UPDATE photos
    SET archivedAt = NULL
    WHERE id = ?
    `,
    [req.params.id]
  );

  res.json({ success: true });
});


app.patch('/api/photos/:id/rename', async (req, res) => {
  await db.run(
    `
    UPDATE photos
    SET label = ?
    WHERE id = ?
    `,
    [req.body.label || 'Photo Strip', req.params.id]
  );

  res.json({ success: true });
});

app.patch('/api/photos/:id/stickers', async (req, res) => {
  const stickers = Array.isArray(req.body.stickers) ? req.body.stickers : [];

  await db.run(
    `
    UPDATE photos
    SET stickers = ?
    WHERE id = ?
    `,
    [JSON.stringify(stickers), req.params.id]
  );

  res.json({ success: true, stickers });
});

app.delete('/api/photos/:id', async (req, res) => {
  const photo = await db.get(
    `
    SELECT src, frames
    FROM photos
    WHERE id = ?
    `,
    [req.params.id]
  );

  await db.run(
    `
    DELETE FROM photos
    WHERE id = ?
    `,
    [req.params.id]
  );

  if (photo) {
    const filesToDelete = new Set([photo.src, ...JSON.parse(photo.frames || '[]')]);

    await Promise.all(
      Array.from(filesToDelete).map(async (fileUrl) => {
        const uploadPath = getUploadPathFromUrl(fileUrl);
        if (!uploadPath) return;

        try {
          await fs.promises.unlink(uploadPath);
        } catch {
          // File may already be deleted. Ignore it.
        }
      })
    );
  }

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Photo2y database server running at http://localhost:${PORT}`);
  console.log(`Photo uploads are saved in ${uploadsDir}`);
});