import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/icons/Icon';
import { BackBar } from '../../components/TopBar';
import { useRole } from '../../hooks/useStore';
import { goBack } from '../../services/router';

type NotifTone = 'success' | 'danger' | 'accent' | 'brand';

interface Notification {
  icon: string;
  tone: NotifTone;
  title: string;
  text: string;
  time: string;
}

const WORKER_NOTIFS: Notification[] = [
  {
    icon: 'circle-check',
    tone: 'success',
    title: 'Você foi pré-selecionado',
    text: 'Construtora Meridiano quer falar com você sobre Pedreiro de acabamento.',
    time: 'Há 12 min'
  },
  {
    icon: 'zap',
    tone: 'danger',
    title: 'Bico urgente perto de você',
    text: 'Pintor em Mooca, hoje às 8h. A combinar.',
    time: 'Há 2h'
  },
  {
    icon: 'star',
    tone: 'accent',
    title: 'Avalie sua última diária',
    text: 'Obra Cangaíba · Servente de obra, 30 ago.',
    time: 'Ontem'
  },
  {
    icon: 'file-check',
    tone: 'brand',
    title: 'Candidatura em análise',
    text: 'Reforma Serra de Bragança está avaliando seu perfil.',
    time: '2 dias atrás'
  }
];

const RECRUITER_NOTIFS: Notification[] = [
  {
    icon: 'users',
    tone: 'brand',
    title: '2 novos candidatos',
    text: 'Pedreiro de acabamento · Tatuapé recebeu novas candidaturas.',
    time: 'Há 30 min'
  },
  {
    icon: 'circle-check',
    tone: 'success',
    title: 'Bico fechado',
    text: 'Todas as vagas de Servente de obra foram preenchidas.',
    time: 'Há 3h'
  },
  {
    icon: 'star',
    tone: 'accent',
    title: 'Avalie o trabalhador',
    text: 'Marcos Aurélio concluiu a diária em 21 ago.',
    time: 'Ontem'
  }
];

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
  const list = useRole() === 'recrutador' ? RECRUITER_NOTIFS : WORKER_NOTIFS;
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
                className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full ${TONE_BG[n.tone]}`}
              >
                <Icon name={n.icon} size={18} color={TONE_FG[n.tone]} />
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
