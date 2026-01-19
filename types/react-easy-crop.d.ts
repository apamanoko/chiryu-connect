'use client';

declare module 'react-easy-crop' {
  import * as React from 'react';

  export interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface Crop {
    x: number;
    y: number;
  }

  export interface CropperProps {
    image: string;
    crop: Crop;
    zoom: number;
    aspect?: number;
    minZoom?: number;
    maxZoom?: number;
    cropShape?: 'rect' | 'round';
    showGrid?: boolean;
    onCropChange: (location: Crop) => void;
    onZoomChange: (zoom: number) => void;
    onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void;
    restrictPosition?: boolean;
    classes?: Partial<Record<string, string>>;
  }

  const Cropper: React.FC<CropperProps>;
  export default Cropper;
}

