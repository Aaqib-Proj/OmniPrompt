// Relative /media/... URLs come from the API's own uploads storage, so they must
// resolve against the API origin rather than the frontend's when the two are split.
export const resolveMediaUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (/^(https?:)?\/\/|^data:/.test(url)) return url;
  const apiBase = import.meta.env.VITE_API_URL || '';
  return `${apiBase}${url}`;
};
