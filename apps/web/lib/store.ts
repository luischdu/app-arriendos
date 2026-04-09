import { put, list, download } from '@vercel/blob';

const PREFIX = 'arriendospro/v1';

/** Lee un array JSON desde Vercel Blob privado. Devuelve [] si no existe. */
export async function readStore<T>(key: string): Promise<T[]> {
  try {
    const { blobs } = await list({ prefix: `${PREFIX}/${key}.json` });
    const blob = blobs.find((b) => b.pathname === `${PREFIX}/${key}.json`);
    if (!blob) return [];

    // Para blobs privados usar download() del SDK
    const res = await download(blob.url);
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  }
}

/** Escribe un array JSON en Vercel Blob privado (sobreescribe). */
export async function writeStore<T>(key: string, data: T[]): Promise<void> {
  await put(`${PREFIX}/${key}.json`, JSON.stringify(data), {
    access: 'private',
    addRandomSuffix: false,
  });
}

/** Genera un ID único simple */
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
