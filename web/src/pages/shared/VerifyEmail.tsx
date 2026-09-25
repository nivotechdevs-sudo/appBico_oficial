import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Icon } from '../../components/icons/Icon';
import { useUI } from '../../hooks/useStore';
import { navigate } from '../../services/router';
import type { AuthFlowUI } from './Signup';

export default function VerifyEmail() {
  const [flow] = useUI<AuthFlowUI>('authFlow', { role: 'trabalhador', email: 'voce@email.com' });

  return (
    <div className="min-h-screen flex flex-col bg-concrete-50 lg:max-w-app lg:mx-auto">
      <div className="flex-1 flex flex-col items-center text-center gap-6 px-6 pt-16 pb-8">
        <span className="inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-full bg-brand-50">
          <Icon name="mail-check" size={34} color="var(--brand)" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="font-display font-bold text-2xl text-concrete-900">Conta criada. Confirme seu e-mail</h1>
          <p className="text-base text-concrete-700">
            Enviamos um link de confirmação para <strong className="text-concrete-900">{flow.email}</strong>. Abra o
            link para ativar sua conta.
          </p>
        </div>
        <Card tone="sunken" padding="md" className="w-full text-left">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2.5 items-center">
              <Icon name="clock" size={20} color="var(--text-subtle)" />
              <span className="text-sm text-concrete-700">O link vale por 24 horas.</span>
            </div>
            <div className="flex gap-2.5 items-center">
              <Icon name="search-x" size={20} color="var(--text-subtle)" />
              <span className="text-sm text-concrete-700">Não chegou? Confira a caixa de spam.</span>
            </div>
          </div>
        </Card>
      </div>
      <div className="px-6 pb-8 flex flex-col gap-2">
        <Button
          label="Abrir meu e-mail"
          size="lg"
          fullWidth
          iconLeft="mail"
          onClick={() => navigate('/completar-perfil/' + flow.role)}
        />
        <Button label="Reenviar o link" variant="ghost" fullWidth onClick={() => {}} />
      </div>
    </div>
  );
}
