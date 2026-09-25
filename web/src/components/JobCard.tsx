import type { ReactNode } from 'react';
import type { Job } from '../types/models';
import { cx } from '../utils/cx';
import { formatBRL } from '../utils/format';
import { dateText } from '../utils/jobInfo';
import { jobPhotos } from '../utils/jobPhotos';
import { Card } from './Card';
import { Icon } from './icons/Icon';
import { JobCover, SaveFlag } from './JobCover';

function PayBlock({ job, muted }: { job: Job; muted: boolean }) {
  if (muted) {
    return (
      <div className="shrink-0 w-24 h-16 rounded-card bg-concrete-100 flex flex-col items-center justify-center gap-0.5">
        <span className="font-mono font-bold text-lg text-concrete-500">
          {job.pay != null ? formatBRL(job.pay) : 'A combinar'}
        </span>
        <span className="text-[0.5625rem] font-semibold tracking-wide uppercase text-concrete-500">por diária</span>
      </div>
    );
  }
  if (job.pay == null) {
    return (
      <div className="shrink-0 w-24 h-16 rounded-card bg-white border-[1.5px] border-brand-200 flex flex-col items-center justify-center gap-1">
        <Icon name="handshake" size={16} color="var(--text-brand)" />
        <span className="text-xs font-semibold text-brand-600">A combinar</span>
      </div>
    );
  }
  return (
    <div className="shrink-0 w-24 h-16 rounded-card bg-brand-500 shadow-card flex flex-col items-center justify-center gap-0.5">
      <span className="font-mono font-bold text-lg text-white">{formatBRL(job.pay)}</span>
      <span className="text-[0.5625rem] font-semibold tracking-wide uppercase text-white/85">por diária</span>
    </div>
  );
}

export interface JobCardProps {
  job: Job;
  companyName?: string;
  onClick?: () => void;
  overlay?: ReactNode;
  footer?: ReactNode;
  photoLabel?: string;
  muted?: boolean;
  saved?: boolean;
  onToggleSave?: (() => void) | null;
}

/**
 * Card-style job summary (photo + role + pay + date/place). Part of the component library; the
 * screens now use JobTile — kept, as in the legacy app, for card-shaped contexts.
 */
export function JobCard({
  job,
  companyName,
  onClick,
  overlay = null,
  footer = null,
  photoLabel = 'Foto do canteiro',
  muted = false,
  saved = false,
  onToggleSave = null
}: JobCardProps) {
  const cover = jobPhotos(job)[0];
  return (
    <Card padding="none" onClick={onClick} className="flex flex-col">
      <div className={cx('relative h-[9.25rem] bg-concrete-200 overflow-hidden', muted ? 'grayscale' : '')}>
        {cover ? (
          <img src={cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="lg:hidden w-full h-full flex items-center justify-center text-concrete-400 text-xs">
              {photoLabel}
            </div>
            <div className="hidden lg:block absolute inset-0">
              <JobCover job={job} />
            </div>
          </>
        )}
        {overlay}
        {onToggleSave ? <SaveFlag saved={saved} onToggle={onToggleSave} /> : null}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex-1 min-w-0 font-display font-semibold text-lg leading-tight text-concrete-900 truncate">
            {job.role}
          </span>
          <PayBlock job={job} muted={muted} />
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-concrete-100 text-sm font-semibold text-concrete-900">
            <Icon name="calendar" size={14} />
            {dateText(job)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-concrete-500">
            <Icon name="map-pin" size={14} color="var(--text-subtle)" />
            {companyName ? `${companyName} · ${job.location}` : job.location}
          </span>
        </div>
      </div>
      {footer}
    </Card>
  );
}

export interface JobCardFooterProps {
  badgeEl?: ReactNode;
  hint?: string;
  hintColor?: string;
  extra?: ReactNode;
}

export function JobCardFooter({ badgeEl, hint, hintColor = 'var(--text-brand)', extra }: JobCardFooterProps) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-concrete-100 border-t border-concrete-200">
      {badgeEl}
      {extra ||
        (hint ? (
          <span
            className="inline-flex items-center gap-0.5 text-sm font-semibold whitespace-nowrap"
            style={{ color: hintColor }}
          >
            {hint}
            <Icon name="chevron-right" size={16} color={hintColor} />
          </span>
        ) : null)}
    </div>
  );
}
