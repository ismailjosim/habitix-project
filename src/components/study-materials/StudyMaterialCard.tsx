import Link from 'next/link';
import { IconBook2, IconFileTypePdf } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LibraryData } from '@/types';

export function StudyMaterialCard({ item }: { item: LibraryData['materials'][number] }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between">
          <span className="grid size-11 place-items-center rounded-xl bg-red-100 text-red-700">
            <IconFileTypePdf />
          </span>
          <Badge variant={item.isPublished ? 'secondary' : 'outline'}>
            {item.isPublished ? 'Published' : 'Draft'}
          </Badge>
        </div>
        <div>
          <p className="text-xs font-medium text-primary">
            {item.module ?? 'General'}
            {item.milestone ? ` · ${item.milestone}` : ''}
          </p>
          <h2 className="mt-1 font-semibold">{item.title}</h2>
          {item.author && <p className="text-xs text-muted-foreground">by {item.author}</p>}
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
            {item.description || 'PDF learning resource'}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag.tag} variant="outline">
              {tag.tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{item.owner.displayName}</span>
          <span>{item._count.views} actions</span>
        </div>
        <Button asChild className="w-full">
          <Link href={`/study-materials/${item.id}`}>
            <IconBook2 className="mr-1.5 size-4" /> View resource
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
