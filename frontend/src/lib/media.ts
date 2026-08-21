/** Column-name convention for non-text card sides: a content label ending
 * in _image/_youtube/_audio renders as media instead of plain text. Cell
 * values may be a bare filename (resolved against public/media/, so it
 * works identically in dev, the desktop app, and GitHub Pages) or a full
 * http(s) URL — auto-detected, so a topic can mix locally-hosted and
 * linked-out media per row. */

export type MediaKind = "image" | "youtube" | "audio" | "text";

const SUFFIXES: Record<Exclude<MediaKind, "text">, RegExp> = {
  image: /_?image$/i,
  youtube: /_?youtube$/i,
  audio: /_?audio$/i,
};

export function mediaKindForLabel(label: string): MediaKind {
  for (const [kind, pattern] of Object.entries(SUFFIXES) as [Exclude<MediaKind, "text">, RegExp][]) {
    if (pattern.test(label)) return kind;
  }
  return "text";
}

/** "obra_image" -> "obra", "youtube" -> "youtube" (nothing left to strip). */
export function prettyLabel(label: string): string {
  const kind = mediaKindForLabel(label);
  if (kind === "text") return label;
  const stripped = label.replace(SUFFIXES[kind], "");
  return stripped || label;
}

function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function mediaUrl(value: string): string {
  if (isExternalUrl(value)) return value;
  return `${import.meta.env.BASE_URL}media/${value}`;
}

const YOUTUBE_ID_PATTERN = /(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/;
const BARE_YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeEmbedUrl(value: string): string {
  const match = value.match(YOUTUBE_ID_PATTERN);
  const id = match ? match[1] : BARE_YOUTUBE_ID.test(value) ? value : null;
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : value;
}
