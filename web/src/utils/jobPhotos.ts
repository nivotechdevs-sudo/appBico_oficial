import type { Job } from '../types/models';

/** A job's photos, oldest data (single `photo`) included. */
export function jobPhotos(job: Pick<Job, 'photos' | 'photo'>): string[] {
  if (Array.isArray(job.photos)) return job.photos;
  return job.photo ? [job.photo] : [];
}

/** Lets a file <input> report the same file again: the legacy app re-created the input on every render. */
export function resetFileInput(input: HTMLInputElement): void {
  input.value = '';
}
