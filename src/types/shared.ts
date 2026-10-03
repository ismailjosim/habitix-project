import type React from 'react';
import type { Icon } from '@tabler/icons-react';

export type AppModule =
  | 'dashboard'
  | 'activity'
  | 'focus'
  | 'tasks'
  | 'help'
  | 'leaderboard'
  | 'team'
  | 'notifications'
  | 'profile'
  | 'materials'
  | 'admin'
  | 'corporateReport';

export interface NavItem {
  title: string;
  href: string;
  icon: Icon;
  module: AppModule;
}

export interface UploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  error?: string;
}

export type UploadedImage = {
  url: string;
  publicId: string;
};

export interface ImageUploadDropzoneProps {
  name?: string;
  value?: string | null;
  onChange?: (file: File | null, previewUrl: string | null) => void;
  aspectRatio?: 'square' | 'video' | 'auto';
  maxSizeMB?: number;
  accept?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  previewHeight?: string;
  onFileSelect?: (file: File) => void;
  isUploading?: boolean;
  previewUrl?: string | null;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}

export interface LoadingStateProps {
  message?: string;
  description?: string;
  cardCount?: number;
}

export interface FormShellProps {
  children: React.ReactNode;
  isPending?: boolean;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: Icon;
}

export interface DataPanelProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export interface DataRowProps {
  label: string;
  value: React.ReactNode;
  description?: string;
}

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export interface StatusBadgeProps {
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OPEN' | 'RESOLVED' | string;
}

export interface PriorityBadgeProps {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string;
}

export interface RoleBadgeProps {
  role: 'STUDENT' | 'MENTOR' | 'ADMIN' | 'MODERATOR' | 'CORPORATE_VIEWER' | string;
}

export interface BrandLogoProps {
  className?: string;
  priority?: boolean;
}
