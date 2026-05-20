'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { addToast } from '@heroui/toast';
import { Camera, Phone, X } from 'lucide-react';
import Image from 'next/image';
import { updateProfile } from '@/actions/user/update-profile';
import { useSession } from 'next-auth/react';
import { getProfileUserData } from '@/actions/user/get-profile-user-data';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getInitials(name: string) {
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { data: session, update: updateSession } = useSession();
  const [isPending, startTransition] = useTransition();

  const [phone, setPhone] = useState('');
  const [initialPhone, setInitialPhone] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(session?.user?.image ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialImage = session?.user?.image ?? null;

  // Cargar teléfono desde DB al abrir
  useEffect(() => {
    if (!isOpen || !session?.user?.id) return;
    getProfileUserData(session.user.id).then(_res => {
      // phoneNumber no está en el response pero sí en la DB — lo leemos de la session si existe
      // La modal usará la sesión extendida o vacío
    });
    // Tomar de la sesión extendida si está disponible
    const sessionPhone = (session.user as { phoneNumber?: string }).phoneNumber ?? '';
    setPhone(sessionPhone);
    setInitialPhone(sessionPhone);
    setImagePreview(session.user.image ?? null);
    setSelectedFile(null);
  }, [isOpen, session?.user]);

  const hasChanges =
    phone !== initialPhone ||
    selectedFile !== null ||
    (imagePreview === null && initialImage !== null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      addToast({ title: 'Formato no válido', description: 'Solo JPG, PNG, WEBP o SVG', color: 'danger', timeout: 3000 });
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    setPhone(initialPhone);
    setImagePreview(session?.user?.image ?? null);
    setSelectedFile(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!/^\d{9}$/.test(phone) && phone !== '') {
      addToast({ title: 'Teléfono inválido', description: 'Debe tener exactamente 9 dígitos', color: 'danger', timeout: 3000 });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('phone', phone);
      if (selectedFile) formData.set('image', selectedFile);

      const result = await updateProfile(formData);

      if (!result.ok) {
        addToast({ title: 'Error', description: result.message, color: 'danger', timeout: 3000 });
        return;
      }

      // Actualizar sesión con los nuevos datos
      await updateSession({
        phoneNumber: phone,
        ...(result.imageUrl ? { image: result.imageUrl } : {}),
      });

      addToast({ title: 'Perfil actualizado', description: 'Los cambios se han guardado correctamente', color: 'success', timeout: 2500, icon: '✅' });
      onClose();
    });
  };

  const displayName = session?.user?.name ?? '';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm" backdrop="blur">
      <ModalContent>
        <ModalHeader>Editar perfil</ModalHeader>
        <ModalBody className="space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden bg-[#03c9d7] dark:bg-[#327f84] flex items-center justify-center text-white font-bold text-2xl cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <Image src={imagePreview} alt={displayName} fill sizes="96px" className="object-cover" />
              ) : (
                getInitials(displayName)
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[#03c9d7] hover:underline"
              >
                {imagePreview ? 'Cambiar foto' : 'Subir foto'}
              </button>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <X size={10} /> Quitar
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Teléfono <small><i>(sin +56)</i></small>
            </label>
            <div className="flex items-center gap-2 border border-default-300 rounded-lg px-3 py-2 focus-within:border-[#03c9d7] transition-colors">
              <Phone className="h-4 w-4 text-default-400 shrink-0" />
              <span className="text-xs text-default-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">+56</span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="912345678"
                maxLength={9}
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            {phone !== '' && !/^\d{9}$/.test(phone) && (
              <p className="text-xs text-red-500">Debe tener exactamente 9 dígitos</p>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between">
          <Button variant="flat" color="default" onPress={handleClose} isDisabled={isPending}>
            Cancelar
          </Button>
          <Button
            color="primary"
            style={{ backgroundColor: '#03c9d7' }}
            onPress={handleSubmit}
            isLoading={isPending}
            isDisabled={!hasChanges || isPending || (phone !== '' && !/^\d{9}$/.test(phone))}
          >
            Guardar cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
