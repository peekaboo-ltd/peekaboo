import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadAvatarOptions {
  userId?: string;
}

interface UploadStatusProofOptions {
  userId?: string;
  status?: string;
}

export async function uploadUserAvatarToCloudinary(
  localFilePath: string,
  options: UploadAvatarOptions = {},
): Promise<string> {
  const folder = process.env.CLOUDINARY_AVATAR_FOLDER || 'peekaboo/avatars';

  const result = await cloudinary.uploader.upload(localFilePath, {
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

  return result.secure_url;
}

export async function uploadUserStatusProofToCloudinary(
  localFilePath: string,
  options: UploadStatusProofOptions = {},
): Promise<string> {
  const folder = process.env.CLOUDINARY_STATUS_PROOF_FOLDER || 'peekaboo/status-proofs';
  const suffix = options.status ? options.status.toLowerCase() : 'status';
  const publicId = options.userId
    ? `${options.userId}-${suffix}-${Date.now()}`
    : undefined;

  const result = await cloudinary.uploader.upload(localFilePath, {
    folder,
    overwrite: false,
    ...(publicId ? { public_id: publicId } : {}),
  });

  return result.secure_url;
}
