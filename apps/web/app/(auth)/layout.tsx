import { Building2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[420px] flex-col justify-between bg-primary p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">
            Arriendos<span className="text-[hsl(var(--gold))]">PRO</span>
          </span>
        </div>

        <div className="space-y-4">
          <blockquote className="text-white/90 text-xl font-light leading-relaxed">
            "Gestiona tus arriendos con la precisión y control que merecen tus inversiones."
          </blockquote>
          <div className="flex gap-4 text-white/60 text-sm">
            <span>+500 propiedades</span>
            <span>·</span>
            <span>99.5% uptime</span>
            <span>·</span>
            <span>Ley 820/2003</span>
          </div>
        </div>

        <p className="text-white/40 text-xs">
          © 2026 ArriendosPRO · Colombia
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">
              Arriendos<span className="text-[hsl(var(--gold))]">PRO</span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
