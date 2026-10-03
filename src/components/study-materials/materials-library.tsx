'use client';

import { IconBook2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, PaginationLinks } from '@/components/shared';
import { CreateMaterialDialog } from './CreateMaterialDialog';
import { StudyMaterialCard } from './StudyMaterialCard';
import type { LibraryData } from '@/types';

export function MaterialsLibrary({
  data,
  search,
  module,
}: {
  data: LibraryData;
  search: string;
  module: string;
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">PDF books and resources</p>
          <h1 className="text-3xl font-bold">Study Materials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse mentor-curated books by module and milestone.
          </p>
        </div>
        {data.canManage && <CreateMaterialDialog />}
      </header>

      <form className="flex flex-col gap-2 sm:flex-row">
        <Input
          aria-label="Search study materials"
          name="search"
          defaultValue={search}
          placeholder="Search books, modules..."
        />
        <select
          aria-label="Filter by module"
          name="module"
          defaultValue={module}
          className="h-8 rounded-lg border bg-background px-3 text-sm"
        >
          <option value="all">All modules</option>
          {data.modules.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {data.materials.length === 0 ? (
        <EmptyState
          icon={<IconBook2 className="size-10" />}
          title="No matching materials"
          description="Try another search or module filter."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.materials.map((item) => (
            <StudyMaterialCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <PaginationLinks
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        params={{ search: search || undefined, module: module === 'all' ? undefined : module }}
      />
    </div>
  );
}
