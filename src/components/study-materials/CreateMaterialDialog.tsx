'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IconFileTypePdf, IconPlus, IconUpload, IconX } from '@tabler/icons-react';
import { createStudyMaterialWithUpload } from '@/lib/actions/study-materials';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function CreateMaterialDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 15 * 1024 * 1024) {
        setError('File size must be under 15MB.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  }

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      if (file) {
        formData.set('file', file);
      }
      const result = await createStudyMaterialWithUpload(formData);
      if (!result.success) return setError(result.message);
      setOpen(false);
      setError(null);
      setFile(null);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setError(null);
          setFile(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-1.5 size-4" /> Add material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form action={handleCreate} className="space-y-3">
          <DialogHeader>
            <DialogTitle>Create Study Resource</DialogTitle>
            <DialogDescription>
              Upload a PDF or document to Cloudinary, or enter an external URL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Title *</label>
            <Input
              aria-label="Resource title"
              name="title"
              placeholder="e.g. System Design Handbook"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Author</label>
            <Input aria-label="Book author" name="author" placeholder="e.g. Alex Xu" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea
              aria-label="Description"
              name="description"
              placeholder="Brief description of the material..."
              rows={2}
            />
          </div>

          {/* Cloudinary File Upload section */}
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3.5">
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Upload File to Cloudinary (PDF, Docs up to 15MB)
            </label>
            {file ? (
              <div className="flex items-center justify-between rounded-lg bg-card p-2.5 border text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <IconFileTypePdf className="size-5 shrink-0 text-red-500" />
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <IconX className="size-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-1.5 py-3 text-center transition hover:opacity-80"
              >
                <IconUpload className="size-6 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">
                  Click or drag to upload document
                </p>
                <p className="text-[10px] text-muted-foreground">PDF, EPUB, DOCX up to 15MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.epub,.doc,.docx,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-border"></div>
            <span className="shrink mx-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Or External URL
            </span>
            <div className="grow border-t border-border"></div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Resource URL {file ? '(Optional if file uploaded)' : '*'}
            </label>
            <Input
              aria-label="Resource URL"
              name="url"
              type="url"
              placeholder="https://example.com/handbook.pdf"
              required={!file}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Module *</label>
              <Input aria-label="Module" name="module" placeholder="e.g. Next.js" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Milestone</label>
              <Input aria-label="Milestone" name="milestone" placeholder="e.g. Milestone 3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tags</label>
            <Input aria-label="Tags" name="tags" placeholder="e.g. react, nextjs, advanced" />
          </div>

          <label className="flex items-center gap-2 pt-1 text-sm">
            <input type="checkbox" name="published" defaultChecked /> Publish immediately
          </label>

          {error && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Uploading & Creating...' : 'Create Resource'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
