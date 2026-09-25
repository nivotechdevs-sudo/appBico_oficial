import { cx } from '../utils/cx';
import { Button } from './Button';
import { Icon } from './icons/Icon';

const TONES = {
  default: { iconBg: 'bg-concrete-100', iconColor: 'var(--text-subtle)' },
  danger: { iconBg: 'bg-danger-50', iconColor: 'var(--red-500)' },
  offline: { iconBg: 'bg-warning-50', iconColor: 'var(--amber-500)' }
};

export interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string | null;
  onAction?: (() => void) | null;
  tone?: keyof typeof TONES;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  tone = 'default',
  className = ''
}: EmptyStateProps) {
  const t = TONES[tone] || TONES.default;
  return (
    <div className={cx('flex flex-col items-center text-center gap-4 px-6 py-12', className)}>
      <span className={cx('inline-flex items-center justify-center w-16 h-16 rounded-full', t.iconBg)}>
        <Icon name={icon} size={30} color={t.iconColor} />
      </span>
      <div className="flex flex-col gap-1.5 max-w-xs">
        <h3 className="text-base font-bold text-concrete-900">{title}</h3>
        {description ? <p className="text-sm text-concrete-500">{description}</p> : null}
      </div>
      {actionLabel ? (
        <Button label={actionLabel} variant="secondary" size="sm" onClick={onAction ? () => onAction() : undefined} />
      ) : null}
    </div>
  );
}
