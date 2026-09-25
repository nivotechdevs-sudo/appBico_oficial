import { EmptyState } from './EmptyState';

export interface ErrorStateProps {
  offline?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Failure state for a screen that loads remote data (feed, candidates, etc). `offline` swaps the
 * copy/tone for the "sem sinal" case, which in this product is a first-class state, not a generic
 * error. (Part of the component library; no screen uses it yet — same as the legacy app.)
 */
export function ErrorState({ offline = false, onRetry, retryLabel }: ErrorStateProps) {
  if (offline) {
    return (
      <EmptyState
        icon="wifi-off"
        tone="offline"
        title="Sem internet"
        description="Mostrando o que já estava salvo no aparelho. Atualizamos quando o sinal voltar."
        actionLabel={retryLabel || 'Tentar de novo'}
        onAction={onRetry}
      />
    );
  }
  return (
    <EmptyState
      icon="circle-alert"
      tone="danger"
      title="Não conseguimos carregar"
      description="Alguma coisa falhou do nosso lado. Toque para tentar de novo."
      actionLabel={retryLabel || 'Tentar de novo'}
      onAction={onRetry}
    />
  );
}
