import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { fullName, email, password, phone, companyName } = body as {
    fullName?: string;
    email?: string;
    password?: string;
    phone?: string;
    companyName?: string;
  };

  if (!fullName || !email || !password || !phone) {
    return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ message: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
  }

  const user = {
    id: `user-${Date.now()}`,
    email,
    fullName,
    role: 'admin' as const,
    tenantId: `tenant-${Date.now()}`,
    tenantName: companyName ?? fullName,
  };

  const accessToken = Buffer.from(JSON.stringify({ sub: user.id, exp: Date.now() + 86400000 })).toString('base64');

  const res = NextResponse.json({ accessToken, user }, { status: 201 });
  res.cookies.set('access_token', accessToken, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400,
    path: '/',
  });
  return res;
}
