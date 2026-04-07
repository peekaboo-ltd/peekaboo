import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { UUID } from '../types';

const AVATARS_DIR = path.join(process.cwd(), 'uploads', 'avatars');
const STATUS_PROOFS_DIR = path.join(process.cwd(), 'uploads', 'status-proofs');

const ensureDir = (dirPath: string) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch {
    // ignore
  }
};

ensureDir(AVATARS_DIR);
ensureDir(STATUS_PROOFS_DIR);

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: unknown,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, AVATARS_DIR);
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

const statusProofStorage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: unknown,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, STATUS_PROOFS_DIR);
  },
  filename: (
    req: Request,
    file: { mimetype: string },
    cb: (error: Error | null, filename: string) => void
  ) => {
    const userId = ((req as Request & { user?: { id?: UUID } }).user?.id || 'user') as string;
    const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
    cb(null, `${userId}-status-proof-${Date.now()}${ext}`);
  },
});

export const uploadStatusProof = multer({
  storage: statusProofStorage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
}).single('proofImage');
