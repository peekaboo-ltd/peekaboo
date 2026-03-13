import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadAvatarOptions {
  userId?: string;
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

