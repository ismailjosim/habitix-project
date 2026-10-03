'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IconAlertCircle, IconPhoto, IconTrash, IconUpload } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import type { ImageUploadDropzoneProps } from '@/types';
export type { ImageUploadDropzoneProps };

export function ImageUploadDropzone({
  name,
  value,
  onChange,
  aspectRatio = 'square',
  maxSizeMB = 8,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  label = 'Upload image',
  description = 'PNG, JPG, WebP, or GIF up to 8 MB',
  disabled = false,
  className,
  previewHeight = 'h-48',
}: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocalPreview(null);
    setRemoved(false);
  }

  const preview = removed ? null : (localPreview ?? value ?? null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds maximum allowed size of ${maxSizeMB} MB`);
        return;
      }

      // Validate MIME type
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      if (
        !acceptedTypes.some(
          (type) => file.type === type || file.type.startsWith(type.replace('*', ''))
        )
      ) {
        setError('Unsupported file type. Please choose a valid image.');
        return;
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setLocalPreview(url);
      setRemoved(false);
      setSelectedFileName(file.name);
      onChange?.(file, url);
    },
    [accept, maxSizeMB, onChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (inputRef.current) {
        try {
          const dt = new DataTransfer();
          dt.items.add(file);
          inputRef.current.files = dt.files;
        } catch {
          // Fallback if DataTransfer constructor not supported
        }
      }
      handleFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setLocalPreview(null);
    setRemoved(true);
    setSelectedFileName(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onChange?.(null, null);
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'h-48 w-48 shrink-0'
      : aspectRatio === 'video'
        ? 'aspect-video w-full'
        : 'w-full';

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}

      {preview ? (
        <div
          className={cn(
            'group relative overflow-hidden rounded-2xl border border-border bg-muted/40 shadow-xs transition-all',
            aspectClass,
            aspectRatio === 'auto' && previewHeight
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Upload preview" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="cursor-pointer gap-1.5 shadow-md"
              >
                <IconUpload className="size-4" /> Change
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={disabled}
                className="cursor-pointer gap-1.5 shadow-md"
              >
                <IconTrash className="size-4" /> Remove
              </Button>
            </div>
          </div>
          {selectedFileName && (
            <div className="absolute bottom-2 left-2 right-2 truncate rounded-md bg-black/60 px-2 py-1 text-center text-xs text-white backdrop-blur-xs">
              {selectedFileName}
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200',
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-border bg-card/60 hover:border-primary/60 hover:bg-muted/40',
            disabled && 'cursor-not-allowed opacity-50',
            aspectRatio === 'square' && 'max-w-50 aspect-square'
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <IconPhoto className="size-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            <span className="text-primary hover:underline">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      )}

      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <IconAlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
