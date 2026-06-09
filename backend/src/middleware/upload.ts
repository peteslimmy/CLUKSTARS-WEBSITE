import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
];

const MAX_SIZE = 10 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, GIF, WebP, SVG, AVIF`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

export function generateFileName(_originalName: string, suffix: string, ext: string, id?: string): string {
  const baseId = id || uuidv4().slice(0, 8);
  return `${baseId}-${suffix}.${ext}`;
}

export const IMAGE_SIZES = {
  thumbnail: { width: 150, suffix: 'thumb' },
  medium: { width: 800, suffix: 'medium' },
  original: { width: 1920, suffix: 'original' },
} as const;
