'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setPasswordWithToken } from '@/actions/user/set-password-with-token';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

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
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Establecer contraseña</h1>
      <p className="text-sm text-muted-foreground">Cuenta: {email}</p>
      <Input
        type="password"
        value={password}
        onChange={event => setPassword(event.target.value)}
        placeholder="Nueva contraseña"
        autoComplete="new-password"
        required
      />
      <Input
        type="password"
        value={confirmation}
        onChange={event => setConfirmation(event.target.value)}
        placeholder="Confirmar contraseña"
        autoComplete="new-password"
        required
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar contraseña'}
      </Button>
    </form>
  );
}