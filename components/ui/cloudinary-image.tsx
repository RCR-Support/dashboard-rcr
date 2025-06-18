"use client";

import { useState } from 'react';
import Image from 'next/image';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

export default function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc = '/placeholder-user.png',
  priority = false
}: CloudinaryImageProps) {
  const [error, setError] = useState(false);

  // Si no hay src o hay error, mostrar imagen de respaldo
  if (!src || error) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  // Usar Image para todas las imágenes hasta que instalemos next-cloudinary
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}

// NOTA: Una vez que hayas instalado next-cloudinary, puedes recuperar
// la implementación original para aprovechar las optimizaciones de Cloudinary.
