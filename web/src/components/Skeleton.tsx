import { cx, rem } from '../utils/cx';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '1rem', radius = '0.375rem', className = '' }: SkeletonProps) {
  return (
    <span
      className={cx('skeleton block', className)}
      style={{
        width: typeof width === 'number' ? rem(width) : width,
        height: typeof height === 'number' ? rem(height) : height,
        borderRadius: radius
      }}
    />
  );
}

/** Skeleton shaped like a JobCard, for loading states. (Part of the library; unused by screens, as before.) */
export function CardSkeleton() {
  return (
    <div className="rounded-card border border-concrete-200 bg-white overflow-hidden">
      <Skeleton width="100%" height="9.25rem" radius="0" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between gap-3">
          <Skeleton width="60%" height="1.25rem" />
          <Skeleton width="4.5rem" height="2.5rem" radius="0.5rem" />
        </div>
        <Skeleton width="80%" height="0.875rem" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-concrete-200 last:border-0">
      <Skeleton width="3rem" height="3rem" radius="9999px" />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <Skeleton width="55%" height="1rem" />
        <Skeleton width="80%" height="0.875rem" />
      </div>
    </div>
  );
}
