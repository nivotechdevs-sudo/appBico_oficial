import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Icon } from '../../components/icons/Icon';
import { BackBar } from '../../components/TopBar';
import { useDb } from '../../hooks/useStore';
import type { ScreenProps } from '../../types/screen';
import { goBack, navigate } from '../../services/router';
import { getCompany, getJob } from '../../services/selectors';
import { formatBRL } from '../../utils/format';
import { dateText } from '../../utils/jobInfo';

export default function ApplicationSent({ params }: ScreenProps) {
  const db = useDb();
  const job = getJob(db, params.id);
  if (!job) return <div className="p-6 text-concrete-500">Vaga não encontrada.</div>;
  const company = getCompany(db, job.companyId)!;

  return (
    <div className="flex flex-col">
      <BackBar title="Bicos" onBack={() => goBack('/mural')} />
      <div className="flex flex-col items-center text-center gap-5 px-6 pt-10 pb-8 lg:max-w-app lg:mx-auto">
        <span className="inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-full bg-success-50">
          <Icon name="circle-check" size={34} color="var(--green-500)" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="font-display font-bold text-2xl text-concrete-900">Candidatura enviada</h1>
          <p className="text-base text-concrete-700">
            A construtora recebeu seu perfil. Avisamos quando você avançar de etapa.
          </p>
        </div>
        <Card tone="sunken" padding="md" className="w-full">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-semibold text-concrete-900">{job.role}</span>
              <span className="text-sm text-concrete-500">{`${company.name} · ${dateText(job)}`}</span>
            </div>
            <span className="font-mono font-bold text-xl text-concrete-900">
              {job.pay == null ? 'A combinar' : formatBRL(job.pay)}
            </span>
          </div>
        </Card>
        <div className="w-full flex flex-col gap-2 pt-2">
          <Button label="Ver minhas candidaturas" fullWidth onClick={() => navigate('/minhas-candidaturas')} />
          <Button label="Voltar ao mural" variant="ghost" fullWidth onClick={() => navigate('/mural')} />
        </div>
      </div>
    </div>
  );
}
