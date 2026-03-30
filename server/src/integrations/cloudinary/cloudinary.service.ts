import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions } from 'cloudinary';

const getTrimmedEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const CLOUDINARY_CLOUD_NAME = getTrimmedEnv('CLOUDINARY_CLOUD_NAME');
const CLOUDINARY_API_KEY = getTrimmedEnv('CLOUDINARY_API_KEY');
const CLOUDINARY_API_SECRET = getTrimmedEnv('CLOUDINARY_API_SECRET');

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

interface UploadAvatarOptions {
  userId?: string;
}

interface UploadStatusProofOptions {
  userId?: string;
  status?: string;
}

const ensureCloudinaryConfigured = () => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.'
    );
  }
};

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const isRetryableCloudinaryError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeHttpCode = (error as { http_code?: unknown }).http_code;
  const maybeMessage = String((error as { message?: unknown }).message || '').toLowerCase();

  if (typeof maybeHttpCode === 'number' && maybeHttpCode >= 500) {
    return true;
  }

  return (
    maybeMessage.includes('timed out') ||
    maybeMessage.includes('timeout') ||
    maybeMessage.includes('econnreset') ||
    maybeMessage.includes('socket hang up') ||
    maybeMessage.includes('network')
  );
};

async function uploadWithRetry(
  localFilePath: string,
  options: UploadApiOptions,
): Promise<string> {
  ensureCloudinaryConfigured();

  try {
    const result = await cloudinary.uploader.upload(localFilePath, options);
    return result.secure_url;
  } catch (error) {
    if (!isRetryableCloudinaryError(error)) {
      throw error;
    }

    await wait(500);
    const result = await cloudinary.uploader.upload(localFilePath, options);
    return result.secure_url;
  }
}

export async function uploadUserAvatarToCloudinary(
  localFilePath: string,
  options: UploadAvatarOptions = {},
): Promise<string> {
  const folder = getTrimmedEnv('CLOUDINARY_AVATAR_FOLDER') || 'peekaboo/avatars';

  return uploadWithRetry(localFilePath, {
    folder,
    overwrite: true,
    ...(options.userId ? { public_id: options.userId } : {}),
    transformation: [
      {
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face',
      },
    ],
  });
}

export async function uploadUserStatusProofToCloudinary(
  localFilePath: string,
  options: UploadStatusProofOptions = {},
): Promise<string> {
  const folder = getTrimmedEnv('CLOUDINARY_STATUS_PROOF_FOLDER') || 'peekaboo/status-proofs';
  const suffix = options.status ? options.status.toLowerCase() : 'status';
  const publicId = options.userId
    ? `${options.userId}-${suffix}-${Date.now()}`
    : undefined;

  return uploadWithRetry(localFilePath, {
    folder,
    overwrite: false,
    ...(publicId ? { public_id: publicId } : {}),
  });
}
