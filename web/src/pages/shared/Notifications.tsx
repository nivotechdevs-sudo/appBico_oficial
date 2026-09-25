import { BackBar } from '../../components/BackBar';
import { EmptyState } from '../../components/EmptyState';
import { Icon, type IconName } from '../../components/icons/Icon';
import { useRole } from '../../hooks/useStore';
import { notificationsFor } from '../../services/notifications';
import { goBack } from '../../services/router';
import type { NotificationKind } from '../../types/models';

type NotifTone = 'success' | 'danger' | 'accent' | 'brand';

// How each kind of notification looks.
const LOOK: Record<NotificationKind, { icon: IconName; tone: NotifTone }> = {
  pre_selecionado: { icon: 'circle-check', tone: 'success' },
  bico_urgente: { icon: 'zap', tone: 'danger' },
  avaliar_diaria: { icon: 'star', tone: 'accent' },
  candidatura_em_analise: { icon: 'file-check', tone: 'brand' },
  novos_candidatos: { icon: 'users', tone: 'brand' },
  bico_fechado: { icon: 'circle-check', tone: 'success' },
  avaliar_trabalhador: { icon: 'star', tone: 'accent' }
};

const TONE_BG: Record<NotifTone, string> = {
  success: 'bg-success-50',
  danger: 'bg-danger-50',
  accent: 'bg-accent-50',
  brand: 'bg-brand-50'
};
const TONE_FG: Record<NotifTone, string> = {
  success: 'var(--green-500)',
  danger: 'var(--red-500)',
  accent: 'var(--teal-500)',
  brand: 'var(--brand)'
};

export default function Notifications() {
  const list = notificationsFor(useRole());
  return (
    <div className="min-h-screen flex flex-col bg-concrete-50 lg:bg-transparent lg:min-h-0">
      <BackBar title="Notificações" onBack={() => goBack('/mural')} />
      {list.length === 0 ? (
        <EmptyState
          icon="bell"
          title="Nenhuma notificação"
          description="Avisamos aqui quando algo importante acontecer."
        />
      ) : (
        <div className="flex flex-col px-4 py-2 gap-2">
          {list.map((n) => (
            <div key={n.title} className="flex gap-3 p-4 bg-white border border-concrete-200 rounded-card">
              <span
                className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full ${TONE_BG[LOOK[n.kind].tone]}`}
              >
                <Icon name={LOOK[n.kind].icon} size={18} color={TONE_FG[LOOK[n.kind].tone]} />
              </span>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-semibold text-concrete-900">{n.title}</span>
                <span className="text-sm text-concrete-600">{n.text}</span>
                <span className="text-xs text-concrete-400">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
