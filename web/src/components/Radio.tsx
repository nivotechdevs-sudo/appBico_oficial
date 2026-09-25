import { useId } from 'react';
import { cx } from '../utils/cx';
import { Icon } from './icons/Icon';

interface RadioCardProps {
  name: string;
  icon: string;
  label: string;
  description: string;
  checked?: boolean;
  onChange?: () => void;
}

/** Card-style radio: used for the "Trabalhador vs Recrutador" account-type choice. */
export function RadioCard({ name, icon, label, description, checked = false, onChange }: RadioCardProps) {
  const fieldId = useId();
  return (
    <label
      htmlFor={fieldId}
      className={cx(
        'flex items-center gap-3.5 min-h-[5.5rem] p-4 rounded-card border cursor-pointer transition-colors',
        checked ? 'bg-brand-50 border-brand-500' : 'bg-white border-concrete-300 hover:bg-concrete-50'
      )}
    >
      <input
        id={fieldId}
        type="radio"
        name={name}
        checked={checked}
        className="sr-only"
        onChange={() => onChange && onChange()}
      />
      <span
        className={cx(
          'inline-flex items-center justify-center w-11 h-11 rounded-full shrink-0',
          checked ? 'bg-brand-500 text-white' : 'bg-concrete-100 text-concrete-600'
        )}
      >
        <Icon name={icon} size={22} />
      </span>
      <span className="flex flex-col gap-0.5 min-w-0">
        <span className={cx('text-base font-bold', checked ? 'text-brand-600' : 'text-concrete-900')}>{label}</span>
        <span className="text-sm text-concrete-500">{description}</span>
      </span>
    </label>
  );
}

interface SwitchProps {
  label: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Switch({ label, description, checked = false, onChange }: SwitchProps) {
  const fieldId = useId();
  return (
    <label htmlFor={fieldId} className="flex items-center gap-3 min-h-12 py-2 cursor-pointer select-none">
      <span className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-concrete-900">{label}</span>
        {description ? <span className="text-sm text-concrete-500">{description}</span> : null}
      </span>
      <input
        id={fieldId}
        type="checkbox"
        checked={checked}
        className="sr-only"
        onChange={(e) => onChange && onChange(e.target.checked)}
      />
      <span
        className={cx(
          'relative inline-flex items-center w-11 h-6 rounded-full shrink-0 transition-colors',
          checked ? 'bg-brand-500' : 'bg-concrete-300'
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-card transition-transform',
            checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5'
          )}
        />
      </span>
    </label>
  );
}
