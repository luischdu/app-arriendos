import { NextResponse } from 'next/server';

const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@arriendospro.com',
  fullName: 'Carlos Propietario',
  role: 'admin' as const,
  tenantId: 'demo-tenant-001',
  tenantName: 'Inmobiliaria Demo SAS',
  avatarUrl: null,
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ message: 'Credenciales requeridas' }, { status: 400 });
  }

  // Demo: cualquier email/password válido funciona
  if (password.length < 6) {
    return NextResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 });
  }

  const user = { ...DEMO_USER, email };
  const accessToken = Buffer.from(JSON.stringify({ sub: user.id, exp: Date.now() + 86400000 })).toString('base64');

  const res = NextResponse.json({ accessToken, user });
  res.cookies.set('access_token', accessToken, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400,
    path: '/',
  });
  return res;
}
