import type { getStudyMaterials, getStudyMaterial } from '@/lib/queries/study-materials';

export type LibraryData = Awaited<ReturnType<typeof getStudyMaterials>>;
export type StudyMaterialItem = LibraryData['materials'][number];
export type StudyMaterialDetail = NonNullable<Awaited<ReturnType<typeof getStudyMaterial>>>;
