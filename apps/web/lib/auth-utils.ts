import { createHash, randomBytes } from 'crypto';

/** Hash de contraseña con sal usando SHA-256 (sin dependencias externas) */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
}

/** Verifica contraseña contra hash almacenado */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const attempt = createHash('sha256').update(salt + password).digest('hex');
  return attempt === hash;
}

/** Genera un JWT-like token con el ID de usuario */
export function signToken(userId: string, role: string): string {
  const payload = { sub: userId, role, exp: Date.now() + 86_400_000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/** Verifica y decodifica un token */
export function verifyToken(token: string): { sub: string; role: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    // Compatibilidad con tokens base64 antiguos
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      if (payload.exp < Date.now()) return null;
      return payload;
    } catch {
      return null;
    }
  }
}
