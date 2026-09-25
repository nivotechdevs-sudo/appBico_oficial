// The logged-in side's notifications. Demo data, as in the legacy app: a fixed list per side, the
// newest first; the navigation's bell counts the unread ones.
import type { AppNotification, Role } from '../types/models';

const WORKER: AppNotification[] = [
  {
    kind: 'pre_selecionado',
    title: 'Você foi pré-selecionado',
    text: 'Construtora Meridiano quer falar com você sobre Pedreiro de acabamento.',
    time: 'Há 12 min',
    read: false
  },
  {
    kind: 'bico_urgente',
    title: 'Bico urgente perto de você',
    text: 'Pintor em Mooca, hoje às 8h. A combinar.',
    time: 'Há 2h',
    read: false
  },
  {
    kind: 'avaliar_diaria',
    title: 'Avalie sua última diária',
    text: 'Obra Cangaíba · Servente de obra, 30 ago.',
    time: 'Ontem',
    read: true
  },
  {
    kind: 'candidatura_em_analise',
    title: 'Candidatura em análise',
    text: 'Reforma Serra de Bragança está avaliando seu perfil.',
    time: '2 dias atrás',
    read: true
  }
];

const RECRUITER: AppNotification[] = [
  {
    kind: 'novos_candidatos',
    title: '2 novos candidatos',
    text: 'Pedreiro de acabamento · Tatuapé recebeu novas candidaturas.',
    time: 'Há 30 min',
    read: false
  },
  {
    kind: 'bico_fechado',
    title: 'Bico fechado',
    text: 'Todas as vagas de Servente de obra foram preenchidas.',
    time: 'Há 3h',
    read: false
  },
  {
    kind: 'avaliar_trabalhador',
    title: 'Avalie o trabalhador',
    text: 'Marcos Aurélio concluiu a diária em 21 ago.',
    time: 'Ontem',
    read: false
  }
];

export function notificationsFor(role: Role): AppNotification[] {
  return role === 'recrutador' ? RECRUITER : WORKER;
}

/** The bell's badge. */
export function unreadCount(role: Role): number {
  return notificationsFor(role).filter((n) => !n.read).length;
}
