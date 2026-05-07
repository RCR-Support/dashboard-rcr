import Link from 'next/link';
import { auth } from '@/auth';
import HomeLogo from '@/components/ui/home/HomeLogo';

export default async function Home() {
  const session = await auth();
  const ctaHref = session ? '/dashboard' : '/login';
  const ctaLabel = session ? 'Ir al Dashboard' : 'Ingresar al Sistema';

  return (
    <div className="flex flex-col min-h-full bg-gray-100 dark:bg-[#171c23]">
      {/* Header inline */}
      <header className="flex items-center justify-between px-6 py-4">
        <HomeLogo width={120} height={54} />
        <Link
          href={ctaHref}
          className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#D05F27] dark:hover:text-[#D05F27] transition-colors"
        >
          {session ? 'Dashboard' : 'Iniciar sesión'}
        </Link>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-6 py-16">
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white leading-tight">
            Sistema de Acreditación
            <br />
            <span className="text-[#D05F27]">y Control de Acceso</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Gestiona contratistas, solicitudes y documentación de manera
            centralizada y segura.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-[#D05F27] hover:bg-[#b8501f] text-white font-semibold text-sm transition-colors shadow-md"
          >
            {ctaLabel}
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mt-8">
          {[
            { icon: '🏢', title: 'Empresas', desc: 'Registro y control de contratistas' },
            { icon: '📋', title: 'Solicitudes', desc: 'Gestión de accesos y acreditaciones' },
            { icon: '✅', title: 'Documentación', desc: 'Validación y seguimiento en tiempo real' },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-2 p-5 rounded-xl bg-white dark:bg-[#1e2530] border border-gray-100 dark:border-gray-700/50 shadow-sm text-center"
            >
              <span className="text-2xl">{icon}</span>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">{title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
