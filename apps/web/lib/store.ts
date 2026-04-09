import { put, list } from '@vercel/blob';

const PREFIX = 'arriendospro/v1';

/** Lee un array JSON desde Vercel Blob (store privado). Devuelve [] si no existe. */
export async function readStore<T>(key: string): Promise<T[]> {
  try {
    const { blobs } = await list({ prefix: `${PREFIX}/${key}.json` });
    const blob = blobs.find((b) => b.pathname === `${PREFIX}/${key}.json`);
    if (!blob) return [];

    // Los blobs privados requieren el token para leer
    const token = process.env.BLOB_READ_WRITE_TOKEN ?? '';
    const res = await fetch(blob.url, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  }
}

/** Escribe un array JSON en Vercel Blob (sobreescribe, acceso privado). */
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
