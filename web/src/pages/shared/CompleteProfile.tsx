import type { ReactNode } from 'react';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { PhotoSlot } from '../../components/PhotoSlot';
import { Select } from '../../components/Select';
import { Tag } from '../../components/Tag';
import { useUI } from '../../hooks/useStore';
import { finishSignUp } from '../../services/auth';
import {
  CARGOS_TRABALHADOR,
  ESPECIALIDADES,
  REGIOES_RECRUTADOR,
  REGIOES_TRABALHADOR,
  TIPOS_OBRA
} from '../../services/catalog';
import type { ScreenProps } from '../../types/screen';
import { navigate } from '../../services/router';
import { toggleItem } from '../../utils/list';

export default function CompleteProfile({ params }: ScreenProps) {
  return params.role === 'recrutador' ? <RecruiterFlow /> : <WorkerFlow />;
}

interface ShellProps {
  step: number;
  total: number;
  onBack: () => void;
  children: ReactNode;
  onContinue: () => void;
  label: string;
}

function Shell({ step, total, onBack, children, onContinue, label }: ShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white lg:max-w-app lg:mx-auto lg:shadow-card lg:my-10 lg:rounded-card lg:overflow-hidden">
      <div className="sticky top-0 z-10 bg-white border-b border-concrete-200 px-2 pb-3">
        <div className="flex items-center gap-1.5 min-h-14">
          {step > 0 ? <IconButton icon="arrow-left" label="Voltar" onClick={onBack} /> : <span className="w-11 h-11" />}
          <span className="flex-1 text-sm font-semibold text-concrete-500">{`Passo ${step + 1} de ${total}`}</span>
        </div>
        <div className="h-1 mx-2 rounded-full bg-concrete-200 overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-200"
            style={{ width: ((step + 1) / total) * 100 + '%' }}
          />
        </div>
      </div>
      <div className="flex-1 px-5 sm:px-8 py-8 flex flex-col gap-7 bg-concrete-50">{children}</div>
      <div className="px-5 sm:px-8 py-3 bg-white shadow-bar">
        <Button label={label} size="lg" fullWidth onClick={onContinue} />
      </div>
    </div>
  );
}

function Heading({ overline, title, help }: { overline: string; title: string; help: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500">{overline}</span>
      <h1 className="font-display font-bold text-3xl text-concrete-900">{title}</h1>
      <p className="text-base text-concrete-700">{help}</p>
    </div>
  );
}

interface WorkerUI {
  step: number;
  photo: string | null;
  cargo: string;
  regiao: string;
  especialidades: string[];
  errors: { cargo?: string | null; regiao?: string | null; especialidades?: string | null };
}

function WorkerFlow() {
  const [ui, setUi] = useUI<WorkerUI>('completar-trabalhador', {
    step: 0,
    photo: null,
    cargo: '',
    regiao: '',
    especialidades: [],
    errors: {}
  });

  if (ui.step === 0) {
    return (
      <Shell
        step={0}
        total={2}
        onBack={() => navigate('/verificar-email')}
        onContinue={() => {
          if (!ui.cargo) {
            setUi({ errors: { cargo: 'Selecione seu cargo ou especialidade principal.' } });
            return;
          }
          setUi({ step: 1, errors: {} });
        }}
        label="Continuar"
      >
        <Heading
          overline="Completar perfil"
          title="Uma foto e o seu cargo"
          help="Isso aparece no seu perfil para as construtoras que virem seu bico."
        />
        <div className="flex flex-col items-center gap-3">
          <PhotoSlot
            shape="circle"
            value={ui.photo}
            onChange={(v) => setUi({ photo: v })}
            className="w-24 h-24"
            placeholder="Sua foto"
          />
          <Button label="Pular por enquanto" variant="ghost" onClick={() => setUi({ step: 1 })} />
        </div>
        <Select
          label="Cargo ou especialidade principal"
          placeholder="Selecione seu cargo"
          options={CARGOS_TRABALHADOR}
          value={ui.cargo}
          error={ui.errors.cargo}
          onChange={(v) => setUi({ cargo: v, errors: { ...ui.errors, cargo: null } })}
        />
      </Shell>
    );
  }

  return (
    <Shell
      step={1}
      total={2}
      onBack={() => setUi({ step: 0 })}
      onContinue={() => {
        const errors: WorkerUI['errors'] = {};
        if (!ui.regiao) errors.regiao = 'Selecione sua região de atuação.';
        if (ui.especialidades.length === 0) errors.especialidades = 'Escolha ao menos uma especialidade.';
        if (Object.keys(errors).length) {
          setUi({ errors });
          return;
        }
        finishSignUp('trabalhador');
        navigate('/mural');
      }}
      label="Concluir perfil"
    >
      <Heading
        overline="Completar perfil"
        title="Onde e no que você trabalha"
        help="Usamos para mostrar bicos perto de você e do jeito certo para seu ofício."
      />
      <Select
        label="Região de atuação"
        placeholder="Selecione bairro e cidade"
        options={REGIOES_TRABALHADOR}
        value={ui.regiao}
        error={ui.errors.regiao}
        onChange={(v) => setUi({ regiao: v, errors: { ...ui.errors, regiao: null } })}
      />
      <div className="flex flex-col gap-2.5">
        <span className="text-sm font-semibold text-concrete-900">Especialidades</span>
        <div className="flex flex-wrap gap-2">
          {ESPECIALIDADES.map((e) => (
            <Tag
              key={e}
              label={e}
              selected={ui.especialidades.includes(e)}
              onClick={() =>
                setUi({
                  especialidades: toggleItem(ui.especialidades, e),
                  errors: { ...ui.errors, especialidades: null }
                })
              }
            />
          ))}
        </div>
        {ui.errors.especialidades ? <span className="text-sm text-danger-500">{ui.errors.especialidades}</span> : null}
      </div>
    </Shell>
  );
}

interface RecruiterUI {
  step: number;
  capa: string | null;
  logo: string | null;
  tipoObra: string;
  regiao: string;
  errors: { tipoObra?: string | null; regiao?: string | null };
}

function RecruiterFlow() {
  const [ui, setUi] = useUI<RecruiterUI>('completar-recrutador', {
    step: 0,
    capa: null,
    logo: null,
    tipoObra: '',
    regiao: '',
    errors: {}
  });

  if (ui.step === 0) {
    return (
      <Shell
        step={0}
        total={2}
        onBack={() => navigate('/verificar-email')}
        onContinue={() => setUi({ step: 1 })}
        label="Continuar"
      >
        <Heading
          overline="Completar perfil"
          title="Capa e logo da construtora"
          help="Isso aparece no perfil que os candidatos veem antes de se candidatar."
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-concrete-900">Foto de capa</span>
          <PhotoSlot
            shape="rect"
            value={ui.capa}
            onChange={(v) => setUi({ capa: v })}
            height="7.5rem"
            placeholder="Capa da construtora"
          />
        </div>
        <div className="flex items-center gap-4">
          <PhotoSlot
            shape="circle"
            value={ui.logo}
            onChange={(v) => setUi({ logo: v })}
            className="w-[4.5rem] h-[4.5rem] shrink-0"
            placeholder="Logo"
          />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-concrete-900">Foto ou logo de perfil</span>
            <Button label="Pular por enquanto" variant="ghost" size="sm" onClick={() => setUi({ step: 1 })} />
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      step={1}
      total={2}
      onBack={() => setUi({ step: 0 })}
      onContinue={() => {
        const errors: RecruiterUI['errors'] = {};
        if (!ui.tipoObra) errors.tipoObra = 'Selecione o tipo de obra.';
        if (!ui.regiao) errors.regiao = 'Selecione sua região de atuação.';
        if (Object.keys(errors).length) {
          setUi({ errors });
          return;
        }
        finishSignUp('recrutador');
        navigate('/mural');
      }}
      label="Concluir perfil"
    >
      <Heading
        overline="Completar perfil"
        title="Sobre a sua obra"
        help="Usamos para destacar o tipo de obra e mostrar suas vagas na região certa."
      />
      <Select
        label="Tipo de obra"
        placeholder="Selecione o tipo de obra"
        options={TIPOS_OBRA}
        value={ui.tipoObra}
        error={ui.errors.tipoObra}
        onChange={(v) => setUi({ tipoObra: v, errors: { ...ui.errors, tipoObra: null } })}
      />
      <Select
        label="Região de atuação"
        placeholder="Selecione a região"
        options={REGIOES_RECRUTADOR}
        value={ui.regiao}
        error={ui.errors.regiao}
        onChange={(v) => setUi({ regiao: v, errors: { ...ui.errors, regiao: null } })}
      />
    </Shell>
  );
}
