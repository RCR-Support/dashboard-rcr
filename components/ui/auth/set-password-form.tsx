'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setPasswordWithToken } from '@/actions/user/set-password-with-token';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle, ShieldCheck } from 'lucide-react';

interface SetPasswordFormProps {
  email: string;
  token: string;
}

export default function SetPasswordForm({ email, token }: SetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const passwordRules = [
    {
      label: 'Al menos 6 caracteres',
      isValid: password.length >= 6,
    },
    {
      label: 'Un carácter especial, por ejemplo ! @ # $ %',
      isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];
  const passwordMeetsRules = passwordRules.every(rule => rule.isValid);
  const confirmationMatches = confirmation.length > 0 && password === confirmation;
  const canSubmit = passwordMeetsRules && confirmationMatches && !isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!passwordMeetsRules) {
      setError('La contraseña debe cumplir todos los requisitos indicados.');
      return;
    }

    if (password !== confirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    startTransition(async () => {
      const result = await setPasswordWithToken(email, token, password);
      if (!result.success) {
        setError(result.error ?? 'No fue posible establecer la contraseña');
        return;
      }
      router.replace('/login');
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-5 rounded-xl border bg-background p-6 shadow-sm">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <h1 className="text-xl font-semibold text-foreground">Configura tu contraseña</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Usarás este correo para ingresar: <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="space-y-3">
        <Input
          type="password"
          value={password}
          onChange={event => {
            setPassword(event.target.value);
            setError(null);
          }}
          placeholder="Nueva contraseña"
          autoComplete="new-password"
          aria-describedby="password-rules"
          required
        />
        <div id="password-rules" className="rounded-lg border bg-muted/30 p-3 text-sm">
          <p className="mb-2 font-medium text-foreground">Tu contraseña debe incluir:</p>
          <ul className="space-y-1.5">
            {passwordRules.map(rule => {
              const Icon = rule.isValid ? CheckCircle2 : Circle;
              return (
                <li
                  key={rule.label}
                  className={rule.isValid ? 'flex items-center gap-2 text-emerald-700' : 'flex items-center gap-2 text-muted-foreground'}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{rule.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="space-y-2">
        <Input
          type="password"
          value={confirmation}
          onChange={event => {
            setConfirmation(event.target.value);
            setError(null);
          }}
          placeholder="Confirmar contraseña"
          autoComplete="new-password"
          required
        />
        {confirmation.length > 0 && (
          <p className={confirmationMatches ? 'text-sm text-emerald-700' : 'text-sm text-destructive'}>
            {confirmationMatches ? 'Las contraseñas coinciden.' : 'Las contraseñas no coinciden.'}
          </p>
        )}
      </div>

      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={!canSubmit}>
        {isPending ? 'Guardando...' : 'Guardar contraseña'}
      </Button>
    </form>
  );
}