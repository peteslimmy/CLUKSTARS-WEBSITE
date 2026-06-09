import { Response } from 'express';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { storage } from '../lib/storage';
import { AuthRequest } from '../middleware/auth';
import { IMAGE_SIZES, generateFileName } from '../middleware/upload';
import path from 'path';

export async function uploadMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const ext = 'webp';
    const baseName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);

    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    const savedFiles: { size: string; path: string }[] = [];
    let width = metadata.width || 0;
    let height = metadata.height || 0;
    const baseId = uuidv4().slice(0, 8);

    for (const [sizeName, sizeConfig] of Object.entries(IMAGE_SIZES)) {
      const fileName = generateFileName(baseName, sizeConfig.suffix, ext, baseId);
      let pipeline = sharp(file.buffer);

      if (metadata.width && metadata.width > sizeConfig.width) {
        pipeline = pipeline.resize(sizeConfig.width, undefined, { fit: 'inside', withoutEnlargement: true });
        if (sizeName === 'original') {
          const resizedMeta = await pipeline.clone().metadata();
          width = resizedMeta.width || width;
          height = resizedMeta.height || height;
        }
      }

      const buffer = await pipeline.webp({ quality: sizeName === 'thumbnail' ? 60 : 80 }).toBuffer();

      const subdir = sizeName === 'thumbnail' ? 'thumbnails' : undefined;
      const relativePath = await storage.save(fileName, buffer, subdir);
      savedFiles.push({ size: sizeName, path: relativePath });
    }

    const thumbFile = savedFiles.find(f => f.size === 'thumbnail');
    const mediumFile = savedFiles.find(f => f.size === 'medium');
    const originalFile = savedFiles.find(f => f.size === 'original');

    const media = await prisma.media.create({
      data: {
        filename: originalFile?.path || '',
        originalName: file.originalname,
        mimeType: 'image/webp',
        size: file.size,
        width,
        height,
        altText: baseName,
        url: storage.getUrl(originalFile?.path || ''),
      },
    });

    const record = {
      ...media,
      urls: {
        thumbnail: thumbFile ? storage.getUrl(thumbFile.path) : null,
        medium: mediumFile ? storage.getUrl(mediumFile.path) : null,
        original: storage.getUrl(originalFile?.path || ''),
      },
    };

    res.status(201).json(record);
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
}

export async function listMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.media.count(),
    ]);

    const enriched = items.map(item => ({
      ...item,
      urls: {
        thumbnail: `/uploads/thumbnails/${item.filename.replace('original', 'thumb')}`,
        medium: `/uploads/${item.filename.replace('original', 'medium')}`,
        original: item.url,
      },
    }));

    res.json({ items: enriched, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('List media error:', err);
    res.status(500).json({ error: 'Failed to list media' });
  }
}

export async function getMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }
    res.json({
      ...media,
      urls: {
        thumbnail: `/uploads/thumbnails/${media.filename.replace('original', 'thumb')}`,
        medium: `/uploads/${media.filename.replace('original', 'medium')}`,
        original: media.url,
      },
    });
  } catch (err) {
    console.error('Get media error:', err);
    res.status(500).json({ error: 'Failed to get media' });
  }
}

export async function updateMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { altText } = req.body;
    const media = await prisma.media.update({
      where: { id },
      data: { altText: altText || undefined },
    });
    res.json(media);
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Media not found' });
      return;
    }
    console.error('Update media error:', err);
    res.status(500).json({ error: 'Failed to update media' });
  }
}

export async function deleteMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    const basePath = media.filename;
    const filesToDelete = [basePath];
    const thumbPath = basePath.replace('original', 'thumb');
    const mediumPath = basePath.replace('original', 'medium');
    filesToDelete.push(`thumbnails/${thumbPath}`);
    filesToDelete.push(mediumPath);

    await Promise.all([
      prisma.media.delete({ where: { id } }),
      storage.deleteMany(filesToDelete),
    ]);

    res.json({ message: 'Media deleted' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Media not found' });
      return;
    }
    console.error('Delete media error:', err);
    res.status(500).json({ error: 'Failed to delete media' });
  }
}

export async function uploadBrandImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const imageType = req.body.type; // 'favicon' | 'logo'
    if (!imageType || !['favicon', 'logo'].includes(imageType)) {
      res.status(400).json({ error: 'Invalid type. Must be "favicon" or "logo"' });
      return;
    }

    const originalExt = path.extname(file.originalname).toLowerCase().replace('.', '') || 'png';
    const sharpFormat = originalExt === 'jpg' ? 'jpeg' : originalExt;

    const formatMap: Record<string, 'jpeg' | 'png' | 'webp' | 'gif' | 'avif' | 'tiff'> = {
      jpeg: 'jpeg', png: 'png', webp: 'webp',
      gif: 'gif', avif: 'avif', tiff: 'tiff',
    };
    const outputFormat = formatMap[sharpFormat] || 'png';

    const fixedName = imageType === 'favicon' ? `favicon.${outputFormat}` : `logocluc.${outputFormat}`;

    const buffer = await sharp(file.buffer)
      .resize(1920, undefined, { fit: 'inside', withoutEnlargement: true })
      .toFormat(outputFormat, { quality: 85 })
      .toBuffer();

    const relativePath = await storage.save(fixedName, buffer);
    const url = storage.getUrl(relativePath);

    res.json({ url, filename: fixedName });
  } catch (err: any) {
    console.error('Brand image upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
}
