export function mediaUrl(url: string | null | undefined, objectKey?: string | null) {
  if (url?.startsWith('http://') || url?.startsWith('https://')) return url;
  if (objectKey) return `/api/public/media/${objectKey.replace(/^\/+/, '')}`;
  return url || '';
}
