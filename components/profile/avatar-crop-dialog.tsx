'use client';

import { useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AvatarCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropped: (croppedDataUrl: string) => void;
}

/**
 * プロフィール画像用のトリミングダイアログ（Instagram風）
 */
export function AvatarCropDialog({
  open,
  imageSrc,
  onClose,
  onCropped,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!imageSrc) {
    return null;
  }

  const onCropComplete = (_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas not supported');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleConfirm = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    try {
      setIsProcessing(true);
      const croppedDataUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropped(croppedDataUrl);
    } catch (error) {
      console.error('Failed to crop image', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>プロフィール画像をトリミング</DialogTitle>
        </DialogHeader>
        <div className="relative w-full aspect-square bg-black/80 rounded-md overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="flex items-center gap-3 mt-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? '処理中...' : 'この画像を使う'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

