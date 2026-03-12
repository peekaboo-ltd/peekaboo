import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { UUID } from '../types';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'avatars');

// Ensure directory exists
try {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch {
  // ignore
}

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: unknown,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (
    req: Request,
    file: { mimetype: string },
    cb: (error: Error | null, filename: string) => void
  ) => {
    const userId = req.params.id as UUID;
    const ext = (file.mimetype === 'image/png') ? '.png' : '.jpg';
    cb(null, `${userId}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: { mimetype: string },
  cb: multer.FileFilterCallback
) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and WebP images are allowed'));
  }
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('avatar');
