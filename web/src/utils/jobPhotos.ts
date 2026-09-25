import type { Job } from '../types/models';

/** A job's photos (a job may have none). */
export function jobPhotos(job: Pick<Job, 'photos'>): string[] {
  return job.photos ?? [];
}

/** Lets a file <input> report the same file again: the legacy app re-created the input on every render. */
export function resetFileInput(input: HTMLInputElement): void {
  input.value = '';
}
