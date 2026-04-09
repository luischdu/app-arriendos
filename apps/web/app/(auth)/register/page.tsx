'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/auth';
import { authApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

const schema = z.object({
  fullName: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Teléfono inválido'),
  companyName: z.string().optional(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { data: res } = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        companyName: data.companyName,
      });
      Cookies.set('access_token', res.accessToken, {
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      setUser(res.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error al crear cuenta';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Crear cuenta</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Empieza a gestionar tus arriendos hoy
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input id="fullName" placeholder="Juan Pérez" {...register('fullName')} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" type="email" placeholder="tu@correo.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" placeholder="3001234567" {...register('phone')} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Empresa (opcional)</Label>
            <Input id="companyName" placeholder="Mi Inmobiliaria" {...register('companyName')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" placeholder="Mínimo 8 caracteres" {...register('password')} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear cuenta gratuita
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Al registrarte aceptas los{' '}
        <span className="underline cursor-pointer">Términos de servicio</span>{' '}
        y la{' '}
        <span className="underline cursor-pointer">Política de privacidad</span>.
      </p>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
