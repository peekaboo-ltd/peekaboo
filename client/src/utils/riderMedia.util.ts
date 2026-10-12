export const formatAttendanceDateTime = (value?: string) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString();
};

export const normalizeProblemMediaUrl = (value?: string) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    return new URL(trimmed).toString();
  } catch {
    return encodeURI(trimmed);
  }
};

export const isLikelyVideoMedia = (mediaType?: string, url?: string) => {
  if (mediaType === 'video') return true;
  if (!url) return false;
  return /\.(mp4|webm|ogg|m3u8|mov|qt)(\?.*)?$/i.test(url);
};

export const getCloudinaryVideoSourceCandidates = (url: string) => {
  if (!url) return [] as string[];

  const candidates = new Set<string>([url]);
  if (!url.includes('/res.cloudinary.com/') || !url.includes('/video/upload/')) {
    return Array.from(candidates);
  }

  const urlObj = new URL(url);

  // Transcode to MP4/H.264 — required for MOV and other formats that browsers
  // (Chrome, Firefox) cannot play natively. Cloudinary applies this server-side.
  candidates.add(url.replace('/video/upload/', '/video/upload/f_mp4,vc_h264/'));

  // Fallback: strip the full transformation chain and request the raw asset
  // transcoded to MP4. Useful when the overlay/watermark chain fails for the
  // source format (e.g. MOV with complex named-layer overlays).
  // Use [^?]+ to exclude the query string so urlObj.search isn't duplicated.
  const pathMatch = url.match(/\/v\d+\/[^?]+/);
  if (pathMatch?.[0]) {
    const cloudName = urlObj.pathname.split('/')[1];
    const base = `${urlObj.protocol}//${urlObj.host}/${cloudName}`;
    const plainPathUrl = `${base}/video/upload/f_mp4,vc_h264${pathMatch[0]}`;
    const querySuffix = urlObj.search || '';
    candidates.add(`${plainPathUrl}${querySuffix}`);
  }

  return Array.from(candidates);
};
