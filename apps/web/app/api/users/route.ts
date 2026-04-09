import { NextResponse } from 'next/server';
import { readStore, writeStore, newId } from '@/lib/store';
import { hashPassword } from '@/lib/auth-utils';

const SEED_USERS = [
  {
    id: 'usr-admin-001',
    fullName: 'Administrador',
    email: 'admin@arriendospro.com',
    role: 'admin',
    tenantId: 'tenant-001',
    tenantName: 'ArriendosPRO',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

async function getUsers() {
  let data = await readStore<Record<string, unknown>>('auth_users');
  if (data.length === 0) {
    // No hay usuarios, devolver vacío (el seed se hace al hacer login)
    return [];
  }
  // Devolver sin passwordHash
  return data.map(({ passwordHash: _ph, ...u }: any) => u);
}

export async function GET() {
  const data = await getUsers();
  if (data.length === 0) {
    return NextResponse.json(SEED_USERS);
  }
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const authUsers = await readStore<Record<string, any>>('auth_users');

  if (authUsers.some((u: any) => u.email?.toLowerCase() === body.email?.toLowerCase())) {
    return NextResponse.json({ message: 'El email ya existe' }, { status: 400 });
  }

  const defaultPassword = body.password ?? 'Cambiar123!';
  const newUser = {
    ...body,
    id: newId(),
    status: 'active',
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(defaultPassword),
  };

  authUsers.push(newUser);
  await writeStore('auth_users', authUsers);

  const { passwordHash: _ph, ...safeUser } = newUser;
  return NextResponse.json({ ...safeUser, tempPassword: defaultPassword }, { status: 201 });
}
