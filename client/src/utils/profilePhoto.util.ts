import { ENVIRONMENTS } from '@/constants/environments.constants';

/**
 * Returns the full URL for a user's profile photo, or null if none.
 */
export function getProfilePhotoUrl(profilePhotoUrl?: string | null): string | null {
  if (!profilePhotoUrl?.trim()) return null;
  if (/^https?:\/\//i.test(profilePhotoUrl)) return profilePhotoUrl;
  const base = ENVIRONMENTS.API_URL?.replace(/\/$/, '') || '';
  const path = profilePhotoUrl.startsWith('/') ? profilePhotoUrl.slice(1) : profilePhotoUrl;
  return `${base}/uploads/${path}`;
}
