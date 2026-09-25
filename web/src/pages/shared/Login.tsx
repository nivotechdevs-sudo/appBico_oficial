import { Button } from '../../components/Button';
import { GoogleIcon, Icon } from '../../components/icons/Icon';
import { Input, PasswordInput } from '../../components/Input';
import { Tag } from '../../components/Tag';
import { useUI } from '../../hooks/useStore';
import { signIn } from '../../services/auth';
import { navigate } from '../../services/router';
import type { Role } from '../../types/models';

interface LoginUI {
  identifier: string;
  password: string;
  visible: boolean;
  role: Role;
  submitting: boolean;
}

export default function Login() {
  const [ui, setUi] = useUI<LoginUI>('login', {
    identifier: '',
    password: '',
    visible: false,
    role: 'trabalhador',
    submitting: false
  });

  // Demo sign-in: e-mail/password, Google and phone all log straight into the chosen account type.
  function submit() {
    setUi({ submitting: true });
    signIn(ui.role).then(() => {
      setUi({ submitting: false });
      navigate('/mural');
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-app mx-auto px-6 sm:px-8 pt-14 pb-10 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500">
            <Icon name="hammer" size={22} color="#fff" />
          </span>
          <h1 className="font-display font-bold text-3xl text-concrete-900">Olá de novo</h1>
        </div>
        <div className="flex flex-col gap-5">
          <Input
            id="login-identifier"
            label="E-mail, CPF ou CNPJ"
            placeholder="voce@email.com"
            icon="mail"
            value={ui.identifier}
            onInput={(v) => setUi({ identifier: v })}
          />
          <PasswordInput
            id="login-password"
            value={ui.password}
            visible={ui.visible}
            onToggleVisible={() => setUi({ visible: !ui.visible })}
            onInput={(v) => setUi({ password: v })}
          />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-concrete-900">Entrar como (demonstração)</span>
            <div className="flex gap-2">
              <Tag
                label="Trabalhador"
                selected={ui.role === 'trabalhador'}
                onClick={() => setUi({ role: 'trabalhador' })}
              />
              <Tag
                label="Recrutador"
                selected={ui.role === 'recrutador'}
                onClick={() => setUi({ role: 'recrutador' })}
              />
            </div>
          </div>
          <Button label="Entrar" size="lg" fullWidth loading={ui.submitting} onClick={submit} />
          <div className="flex items-center gap-3 py-1">
            <span className="flex-1 h-px bg-concrete-200" />
            <span className="text-xs text-concrete-500">ou</span>
            <span className="flex-1 h-px bg-concrete-200" />
          </div>
          <Button
            label="Continuar com o Google"
            variant="secondary"
            fullWidth
            iconLeftNode={<GoogleIcon size={20} />}
            onClick={submit}
          />
          <Button
            label="Continuar com o celular"
            variant="secondary"
            fullWidth
            iconLeft="phone-call"
            onClick={submit}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Button label="Esqueci minha senha" variant="ghost" onClick={() => navigate('/esqueci-senha')} />
          <Button label="Criar minha conta" variant="ghost" onClick={() => navigate('/escolha-perfil')} />
        </div>
      </div>
    </div>
  );
}
