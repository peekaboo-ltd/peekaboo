import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';

const getTrimmedEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const CLOUDINARY_CLOUD_NAME = getTrimmedEnv('CLOUDINARY_CLOUD_NAME');
const CLOUDINARY_API_KEY = getTrimmedEnv('CLOUDINARY_API_KEY');
const CLOUDINARY_API_SECRET = getTrimmedEnv('CLOUDINARY_API_SECRET');
const DEFAULT_LOCAL_WATERMARK_PATH = path.resolve(
  process.cwd(),
  'src/assets/watermarks/peekaboo-black-yellow.jpeg',
);

let cachedProblemReportWatermarkPublicId: string | null = null;

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
  overlayTimestamp?: string;
  overlayLocationLabel?: string;
  overlayAppliedOnClient?: boolean;
}

interface UploadProblemReportEvidenceOptions {
  userId?: string;
  mediaType?: 'photo' | 'video';
  overlayTimestamp?: string;
  overlayLocationLabel?: string;
  overlayAppliedOnClient?: boolean;
}

const normalizeOverlayText = (value?: string): string | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized.length ? normalized.slice(0, 120) : undefined;
};

const buildOverlayLines = (timestamp?: string, location?: string): string[] => {
  const lines: string[] = [];
  const ts = normalizeOverlayText(timestamp);
  const loc = normalizeOverlayText(location);
  if (ts) lines.push(`Timestamp: ${ts}`);
  if (loc) lines.push(`Location: ${loc}`);
  return lines;
};

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
  const result = await uploadResultWithRetry(localFilePath, options);
  return result.secure_url;
}

async function uploadResultWithRetry(
  localFilePath: string,
  options: UploadApiOptions,
): Promise<UploadApiResponse> {
  ensureCloudinaryConfigured();

  try {
    return await cloudinary.uploader.upload(localFilePath, options);
  } catch (error) {
    if (!isRetryableCloudinaryError(error)) {
      throw error;
    }

    await wait(500);
    return cloudinary.uploader.upload(localFilePath, options);
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

  const uploadResult = await uploadResultWithRetry(localFilePath, {
    folder,
    overwrite: false,
    ...(publicId ? { public_id: publicId } : {}),
  });
  const uploadedUrl = uploadResult.secure_url;

  const overlayLines = buildOverlayLines(options.overlayTimestamp, options.overlayLocationLabel);
  if (overlayLines.length === 0 || options.overlayAppliedOnClient) {
    return uploadedUrl;
  }

  const uploadedPublicId = publicId
    ? `${folder}/${publicId}`
    : normalizeCloudinaryPublicId(uploadResult.public_id);
  const [lineOne, lineTwo] = overlayLines;
  const textOverlays = [
    {
      overlay: { font_family: 'Arial', font_size: 32, font_weight: 'bold', text: lineOne || '' },
      color: 'white',
      gravity: 'south_west',
      x: 24,
      y: lineTwo ? 84 : 28,
      flags: 'layer_apply',
    },
  ];
  if (lineTwo) {
    textOverlays.push({
      overlay: { font_family: 'Arial', font_size: 30, font_weight: 'normal', text: lineTwo },
      color: 'white',
      gravity: 'south_west',
      x: 24,
      y: 28,
      flags: 'layer_apply',
    });
  }

  return cloudinary.url(uploadedPublicId, {
    secure: true,
    resource_type: 'image',
    format: 'jpg',
    transformation: [{ effect: 'brightness:-5' }, ...textOverlays],
  });
}

const normalizeCloudinaryPublicId = (value: string): string => {
  const trimmed = value.trim().replace(/^\/+/, '');
  return trimmed.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
};

const resolveProblemReportWatermarkPublicId = (): string | undefined => {
  if (cachedProblemReportWatermarkPublicId) {
    return cachedProblemReportWatermarkPublicId;
  }

  const configured = getTrimmedEnv('CLOUDINARY_PROBLEM_REPORT_WATERMARK_PUBLIC_ID');
  if (configured) {
    const normalized = normalizeCloudinaryPublicId(configured);
    cachedProblemReportWatermarkPublicId = normalized;
    return normalized;
  }

  const fallback = getTrimmedEnv('CLOUDINARY_WATERMARK_PUBLIC_ID');
  if (fallback) {
    const normalized = normalizeCloudinaryPublicId(fallback);
    cachedProblemReportWatermarkPublicId = normalized;
    return normalized;
  }

  return undefined;
};

const uploadLocalProblemReportWatermarkIfNeeded = async (): Promise<string | undefined> => {
  const existingPublicId = resolveProblemReportWatermarkPublicId();
  if (existingPublicId) {
    return existingPublicId;
  }

  const localWatermarkPath =
    getTrimmedEnv('PROBLEM_REPORT_WATERMARK_LOCAL_PATH') || DEFAULT_LOCAL_WATERMARK_PATH;
  if (!fs.existsSync(localWatermarkPath)) {
    return undefined;
  }

  const folder = getTrimmedEnv('CLOUDINARY_WATERMARK_FOLDER') || 'peekaboo/watermarks';
  const watermarkName =
    getTrimmedEnv('CLOUDINARY_PROBLEM_REPORT_WATERMARK_NAME') || 'peekaboo-black-yellow';

  const uploadResult = await uploadResultWithRetry(localWatermarkPath, {
    folder,
    overwrite: true,
    resource_type: 'image',
    public_id: watermarkName,
  });

  const normalizedPublicId = normalizeCloudinaryPublicId(uploadResult.public_id);
  cachedProblemReportWatermarkPublicId = normalizedPublicId;
  return normalizedPublicId;
};

export async function uploadProblemReportEvidenceToCloudinary(
  localFilePath: string,
  options: UploadProblemReportEvidenceOptions = {},
): Promise<string> {
  const folder = getTrimmedEnv('CLOUDINARY_PROBLEM_REPORT_FOLDER') || 'peekaboo/problem-reports';
  const suffix = options.mediaType === 'video' ? 'video' : 'photo';
  const publicId = options.userId
    ? `${options.userId}-problem-report-${suffix}-${Date.now()}`
    : undefined;

  ensureCloudinaryConfigured();

  const uploadOptions: UploadApiOptions = {
    folder,
    overwrite: false,
    resource_type: options.mediaType === 'video' ? 'video' : 'image',
    ...(publicId ? { public_id: publicId } : {}),
  };

  const uploadResult = await uploadResultWithRetry(localFilePath, uploadOptions);
  const uploadUrl = uploadResult.secure_url;
  const overlayLines = buildOverlayLines(options.overlayTimestamp, options.overlayLocationLabel);
  const [lineOne, lineTwo] = overlayLines;
  const overlayTextTransforms =
    overlayLines.length === 0
      ? []
      : [
          {
            overlay: {
              font_family: 'Arial',
              font_size: 32,
              font_weight: 'bold',
              text: lineOne || '',
            },
            color: 'white',
            gravity: 'south_west',
            x: 24,
            y: lineTwo ? 84 : 28,
            flags: 'layer_apply',
          },
          ...(lineTwo
            ? [
                {
                  overlay: {
                    font_family: 'Arial',
                    font_size: 30,
                    font_weight: 'normal',
                    text: lineTwo,
                  },
                  color: 'white',
                  gravity: 'south_west',
                  x: 24,
                  y: 28,
                  flags: 'layer_apply',
                },
              ]
            : []),
        ];

  if (options.mediaType !== 'video') {
    if (options.overlayAppliedOnClient || overlayTextTransforms.length === 0) {
      return uploadUrl;
    }

    const uploadedPublicId = publicId
      ? `${folder}/${publicId}`
      : normalizeCloudinaryPublicId(uploadResult.public_id);

    return cloudinary.url(uploadedPublicId, {
      secure: true,
      resource_type: 'image',
      format: 'jpg',
      transformation: [{ effect: 'brightness:-5' }, ...overlayTextTransforms],
    });
  }

  const watermarkPublicId = await uploadLocalProblemReportWatermarkIfNeeded();
  if (!watermarkPublicId) {
    throw new Error(
      'Missing watermark logo. Set CLOUDINARY_PROBLEM_REPORT_WATERMARK_PUBLIC_ID or PROBLEM_REPORT_WATERMARK_LOCAL_PATH.'
    );
  }

  const uploadedPublicId = publicId
    ? `${folder}/${publicId}`
    : (() => {
        const uploadedIdFromCloudinary = uploadResult.public_id;
        return normalizeCloudinaryPublicId(uploadedIdFromCloudinary);
      })();

  if (!uploadedPublicId) {
    throw new Error('Failed to resolve uploaded video public ID for watermark transformation.');
  }

  return cloudinary.url(uploadedPublicId, {
    secure: true,
    resource_type: 'video',
    format: 'mp4',
    transformation: [
      { quality: 'auto:good' },
      ...overlayTextTransforms,
      { overlay: watermarkPublicId, width: 220, crop: 'scale', opacity: 78 },
      { gravity: 'south_east', x: 24, y: 24, flags: 'layer_apply' },
    ],
  });
}
