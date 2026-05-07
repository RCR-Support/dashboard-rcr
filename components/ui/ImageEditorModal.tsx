'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  getCroppedImg,
  resizeAndCompressImage,
  blobToFile,
} from '@/lib/image-utils';
import { formatFileSize } from '@/lib/file-utils';
import { ZoomIn, RotateCw, Check, X } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageEditorModalProps {
  isOpen: boolean;
  imageSrc: string;
  originalFile: File;
  onSave: (file: File) => void;
  onCancel: () => void;
}

export function ImageEditorModal({
  isOpen,
  imageSrc,
  originalFile,
  onSave,
  onCancel,
}: ImageEditorModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback(
    (_croppedArea: CropArea, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setProcessing(true);
    try {
      // 1. Recortar imagen
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );

      // 2. Redimensionar a tamaño de credencial (300x400px)
      const resizedBlob = await resizeAndCompressImage(
        croppedBlob,
        300,
        400,
        0.9 // 90% calidad
      );

      // 3. Convertir a File
      const fileName = `credencial-${originalFile.name.replace(/\.[^/.]+$/, '')}.jpg`;
      const finalFile = blobToFile(resizedBlob, fileName);

      onSave(finalFile);
    } catch (error) {
      console.error('❌ Error al procesar imagen:', error);
      alert('Error al procesar la imagen. Por favor intenta de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold">Editar Foto de Credencial</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ajusta la imagen para que muestre el rostro completo
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative flex-1 bg-gray-100 dark:bg-gray-800">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={3 / 4} // Proporción vertical para credencial
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            cropShape="rect"
            showGrid={true}
            objectFit="contain"
          />

          {/* Guías visuales */}
          <div className="absolute top-4 left-4 bg-blue-500/90 text-white px-3 py-2 rounded-lg text-sm">
            <p className="font-medium">📷 Guía de foto</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>✓ Rostro centrado</li>
              <li>✓ Fondo uniforme</li>
              <li>✓ Buena iluminación</li>
            </ul>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t dark:border-gray-700 space-y-4">
          {/* Zoom */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                Zoom
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value: number[]) => setZoom(value[0])}
              className="w-full"
            />
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                Rotación
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {rotation}°
              </span>
            </div>
            <Slider
              value={[rotation]}
              min={0}
              max={360}
              step={1}
              onValueChange={(value: number[]) => setRotation(value[0])}
              className="w-full"
            />
          </div>

          {/* Info */}
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 pt-2 border-t dark:border-gray-700">
            <span>Tamaño original: {formatFileSize(originalFile.size)}</span>
            <span>Formato final: 300x400px (JPEG optimizado)</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={processing}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={processing}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Guardar foto
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
