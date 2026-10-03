'use client';

import { IconDownload, IconExternalLink, IconFileTypePdf } from '@tabler/icons-react';
import { trackStudyMaterial } from '@/lib/actions/study-materials';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EditMaterialDialog } from './EditMaterialDialog';

type Detail = Awaited<ReturnType<typeof import('@/lib/queries/study-materials').getStudyMaterial>>;

export function MaterialDetail({ data }: { data: Detail }) {
  const { material } = data;

  function open(action: 'view' | 'download') {
    void trackStudyMaterial({ materialId: material.id, action });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start gap-4">
        <span className="grid size-14 place-items-center rounded-xl bg-red-100 text-red-700">
          <IconFileTypePdf className="size-7" />
        </span>
        <div>
          <p className="text-sm text-primary">
            {material.module ?? 'General'}
            {material.milestone ? ` · ${material.milestone}` : ''}
          </p>
          <h1 className="text-3xl font-bold">{material.title}</h1>
          {material.author && <p className="text-sm text-muted-foreground">by {material.author}</p>}
          <p className="mt-1 text-sm text-muted-foreground">
            Curated by {material.owner.displayName} · {material._count.views} tracked actions
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="space-y-5 p-6">
          <p className="whitespace-pre-wrap leading-7">
            {material.description || 'No description provided.'}
          </p>
          <div className="flex flex-wrap gap-2">
            {material.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.tag}
              </Badge>
            ))}
          </div>
          {material.url ? (
            <div className="flex gap-2">
              <Button asChild onClick={() => open('view')}>
                <a href={material.url} target="_blank" rel="noreferrer">
                  <IconExternalLink className="mr-1.5 size-4" /> Open PDF
                </a>
              </Button>
              <Button asChild variant="outline" onClick={() => open('download')}>
                <a href={material.url} download>
                  <IconDownload className="mr-1.5 size-4" /> Download
                </a>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No file URL is available.</p>
          )}

          {data.canEdit && <EditMaterialDialog material={material} />}
        </CardContent>
      </Card>
    </div>
  );
}
