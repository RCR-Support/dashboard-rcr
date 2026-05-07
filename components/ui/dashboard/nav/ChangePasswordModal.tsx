'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';
import { Eye, EyeOff, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { changePassword } from '@/actions/user/change-password';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Strength {
  score: number; // 0-4
  label: string;
  color: string;
  barColor: string;
}

function getStrength(password: string): Strength {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  const levels: Strength[] = [
    { score: 0, label: '', color: '', barColor: '' },
    { score: 1, label: 'Débil', color: 'text-red-500', barColor: 'bg-red-500' },
    { score: 2, label: 'Regular', color: 'text-orange-500', barColor: 'bg-orange-500' },
    { score: 3, label: 'Buena', color: 'text-yellow-500', barColor: 'bg-yellow-500' },
    { score: 4, label: 'Fuerte', color: 'text-green-500', barColor: 'bg-green-500' },
  ];

  return levels[score] ?? levels[0];
}

interface Criterion {
  label: string;
  met: boolean;
}

function getCriteria(password: string): Criterion[] {
  return [
    { label: 'Mínimo 6 caracteres', met: password.length >= 6 },
    { label: 'Mayúsculas y minúsculas', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: 'Al menos un número', met: /[0-9]/.test(password) },
    { label: 'Al menos un carácter especial', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <Lock className="h-4 w-4 text-default-400" />
        </div>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-default-200 bg-default-100 py-2.5 pl-9 pr-10 text-sm text-foreground placeholder:text-default-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute inset-y-0 right-3 flex items-center text-default-400 hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const strength = getStrength(next);
  const criteria = getCriteria(next);
  const matchError = confirm.length > 0 && next !== confirm;

  const reset = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);

    if (!current || !next || !confirm) {
      setError('Completa todos los campos');
      return;
    }
    if (next !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!criteria[0].met) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!criteria[3].met) {
      setError('La contraseña debe contener al menos un carácter especial');
      return;
    }

    setLoading(true);
    const result = await changePassword(current, next);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Error al cambiar la contraseña');
      return;
    }

    setSuccess(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isDismissable={false} size="sm">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          Cambiar contraseña
        </ModalHeader>

        <ModalBody>
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="font-semibold text-foreground">¡Contraseña actualizada!</p>
              <p className="text-sm text-default-500">Tu contraseña se cambió correctamente.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <PasswordField
                label="Contraseña actual"
                value={current}
                onChange={setCurrent}
                placeholder="Ingresa tu contraseña actual"
              />

              <PasswordField
                label="Nueva contraseña"
                value={next}
                onChange={v => { setNext(v); setError(null); }}
                placeholder="Ingresa la nueva contraseña"
              />

              {/* Medidor de fortaleza */}
              {next.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-default-400">Fortaleza</span>
                    <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.barColor : 'bg-default-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {criteria.map(c => (
                      <div key={c.label} className="flex items-center gap-1.5">
                        {c.met ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-default-300 shrink-0" />
                        )}
                        <span className={`text-xs ${c.met ? 'text-green-600 dark:text-green-400' : 'text-default-400'}`}>
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <PasswordField
                  label="Confirmar nueva contraseña"
                  value={confirm}
                  onChange={v => { setConfirm(v); setError(null); }}
                  placeholder="Repite la nueva contraseña"
                />
                {matchError && (
                  <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 px-3 py-2">
                  <p className="text-xs text-danger">{error}</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {success ? (
            <Button color="primary" onPress={handleClose} className="w-full">
              Cerrar
            </Button>
          ) : (
            <>
              <Button variant="light" onPress={handleClose} isDisabled={loading}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={loading}
                isDisabled={loading || matchError}
              >
                Guardar
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
