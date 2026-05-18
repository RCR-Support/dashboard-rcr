'use client';

import { loginSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { loginAction } from '@/actions/auth-action';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

const FormLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setError(null);
    startTransition(async () => {
      const response = await loginAction(values);
      if (response?.error) {
        setError(response.error);
      } else {
        router.push('/dashboard');
      }
    });
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo — .logo-light/.logo-dark toggled via html.dark class (set by next-themes inline script) */}
      <div className="flex justify-center mb-8" style={{ height: '72px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logoInv.svg" alt="RCR Support" className="logo-light" style={{ width: '160px', height: '72px' }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.svg" alt="RCR Support" className="logo-dark" style={{ width: '160px', height: '72px' }} />
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-[#1e2530] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/50 px-8 py-10">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Bienvenido
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                    Correo electrónico
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nombre@empresa.com"
                      type="email"
                      autoComplete="email"
                      className="h-10 bg-gray-50 dark:bg-[#282c34] border-gray-200 dark:border-gray-600 focus:border-[#D05F27] focus:ring-[#D05F27]/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                    Contraseña
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className="h-10 bg-gray-50 dark:bg-[#282c34] border-gray-200 dark:border-gray-600 focus:border-[#D05F27] focus:ring-[#D05F27]/20 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-10 mt-2 rounded-lg bg-[#D05F27] hover:bg-[#b8501f] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </Form>
      </div>

      {/* Links de pie */}
      <div className="flex flex-col items-center gap-3 mt-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400 dark:text-slate-500">¿No tienes cuenta?</span>
          <Link
            href="/pre-register"
            className="font-semibold text-[#D05F27] hover:text-[#b8501f] transition-colors"
          >
            Regístrate aquí
          </Link>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-4">
        © {new Date().getFullYear()} RCR Support. Todos los derechos reservados.
      </p>
    </div>
  );
};

export default FormLogin;
