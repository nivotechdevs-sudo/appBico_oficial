import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/icons/Icon';
import { IconButton } from '../../components/IconButton';
import { Dialog, Sheet } from '../../components/Modal';
import { Rating } from '../../components/Rating';
import { TextArea } from '../../components/TextArea';
import { useDb, useRole, useUI } from '../../hooks/useStore';
import type { ScreenProps } from '../../types/screen';
import { goBack, navigate } from '../../services/router';
import {
  applicationFor,
  approvedCount,
  currentCompanyId,
  currentWorker,
  getJob,
  getWorker,
  isJobClosed,
  postsForWorker
} from '../../services/selectors';
import { addWorkerPost, decideApplication, deleteWorkerPost, getDb } from '../../services/store';
import type { Worker, WorkerPost } from '../../types/models';
import { formatPostDate } from '../../utils/format';
import { resetFileInput } from '../../utils/jobPhotos';

const POSTS_KEY = 'worker-posts';

interface PostsUI {
  composing: boolean;
  mediaUrl: string | null;
  mediaType: 'image' | 'video';
  caption: string;
  deleteId: string | null;
}
const POSTS_DEFAULTS: PostsUI = { composing: false, mediaUrl: null, mediaType: 'image', caption: '', deleteId: null };

export default function WorkerProfileScreen({ params }: ScreenProps) {
  const db = useDb();
  const role = useRole();
  const [ui] = useUI<{ photo: string | null }>('worker-profile-photo', { photo: null });

  const isOwn = !params.id;
  const worker = isOwn ? currentWorker(db) : getWorker(db, params.id);
  if (!worker) return <NotFound />;

  const jobIdRaw = params.jobId;
  const jobForCtx = jobIdRaw ? getJob(db, jobIdRaw) : null;
  // Only the recruiter who owns this job may see candidate-review context (approve/reject, slots left).
  const jobId = jobForCtx && role === 'recrutador' && jobForCtx.companyId === currentCompanyId() ? jobIdRaw : null;
  const job = jobId ? getJob(db, jobId) : undefined;
  const decision = jobId ? (applicationFor(db, jobId, worker.id) || { status: undefined }).status : null;
  const decidedForJob = jobId && (decision === 'pre_selecionado' || decision === 'nao_selecionado');
  const jobFull = job ? isJobClosed(db, job) : false;

  return (
    <div className="min-h-screen flex flex-col bg-concrete-50 lg:bg-transparent lg:min-h-0">
      <div className="relative">
        {isOwn && ui.photo ? (
          <img src={ui.photo} alt="" className="w-full h-52 object-cover lg:rounded-card" />
        ) : (
          <div className="h-52 bg-concrete-200 lg:rounded-card" />
        )}
        {!isOwn ? (
          <div className="absolute top-2 left-2">
            <IconButton
              icon="arrow-left"
              label="Voltar"
              variant="solid"
              onClick={() => goBack(jobId ? '/vaga-gerenciar/' + jobId : '/mural')}
            />
          </div>
        ) : null}
        <div className="absolute left-4 sm:left-6 -bottom-10 w-24 h-24 rounded-full bg-white p-1 shadow-raised">
          <div className="relative w-full h-full">
            <div className="w-full h-full rounded-full bg-accent-50 text-accent-600 flex items-center justify-center font-bold text-2xl overflow-hidden">
              {worker.initials}
            </div>
            {worker.verified ? (
              <span className="absolute -right-0.5 -bottom-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-500 border-[3px] border-white">
                <Icon name="check" size={14} color="#fff" />
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5 pt-12 px-4 sm:px-6 pb-40 lg:pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="font-display font-bold text-2xl text-concrete-900">{worker.name}</span>
            <span className="text-sm text-concrete-700">{`${worker.role} · ${worker.region}`}</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-concrete-700">
              <Icon name="hammer" size={15} color="var(--text-subtle)" />
              {`${worker.jobsDone} ${worker.jobsDone === 1 ? 'bico realizado' : 'bicos realizados'}`}
            </span>
            <div className="flex items-center gap-3">
              <Rating value={worker.rating} count={worker.jobsDone} />
              {!isOwn ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600"
                  onClick={() => navigate('/avaliacoes/trabalhador/' + worker.id)}
                >
                  Ver avaliações
                  <Icon name="chevron-right" size={16} color="var(--text-brand)" />
                </button>
              ) : null}
            </div>
          </div>
          {isOwn ? (
            <Button
              label="Editar"
              variant="secondary"
              size="sm"
              iconLeft="pencil"
              onClick={() => navigate('/perfil/editar')}
            />
          ) : worker.novo ? (
            <Badge label="Novo na plataforma" tone="accent" />
          ) : worker.verified ? (
            <Badge label="Verificado" tone="success" icon="shield-check" />
          ) : null}
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500">Especialidades</span>
          <div className="flex flex-wrap gap-2">
            {worker.specialties.map((s) => (
              <span
                key={s}
                className="inline-flex items-center h-9 px-3 rounded-full bg-white border border-concrete-300 text-sm font-semibold text-concrete-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {!isOwn && worker.facts && worker.facts.length ? (
          <Card padding="md">
            <div className="flex flex-col gap-3.5">
              {worker.facts.map((f) => (
                <div key={f} className="flex gap-2.5 items-center">
                  <Icon name="circle-check" size={18} color="var(--text-subtle)" />
                  <span className="text-sm text-concrete-700">{f}</span>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <PostsSection worker={worker} isOwn={isOwn} />

        {!isOwn && jobId ? (
          <p className="text-sm text-concrete-500">
            O contato por WhatsApp abre depois que você aprovar esse trabalhador para a vaga.
          </p>
        ) : null}
      </div>

      {!isOwn && jobId && job ? (
        <div className="sticky bottom-0 px-4 sm:px-6 py-3 bg-white shadow-bar flex flex-col gap-2 lg:static lg:bg-transparent lg:shadow-none lg:pt-0 lg:pb-6">
          {!decidedForJob && !jobFull ? (
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
              <Button
                label={`Aprovar para a vaga · ${approvedCount(db, jobId) + 1} de ${job.slots || 1}`}
                size="lg"
                fullWidth
                iconLeft="circle-check"
                className="lg:w-auto lg:px-8"
                onClick={() => {
                  decideApplication(jobId, worker.id, 'aprovado');
                  const fresh = getDb();
                  navigate(
                    isJobClosed(fresh, getJob(fresh, jobId)!) ? '/fechado/' + jobId : '/vaga-gerenciar/' + jobId
                  );
                }}
              />
              <Button
                label="Recusar candidato"
                variant="ghost"
                fullWidth
                className="lg:w-auto"
                onClick={() => {
                  decideApplication(jobId, worker.id, 'recusado');
                  navigate('/vaga-gerenciar/' + jobId);
                }}
              />
            </div>
          ) : decidedForJob ? (
            <div className="flex items-center gap-2.5">
              <Badge
                label={decision === 'pre_selecionado' ? 'Aprovado' : 'Recusado'}
                tone={decision === 'pre_selecionado' ? 'success' : 'danger'}
                icon={decision === 'pre_selecionado' ? 'circle-check' : 'circle-x'}
              />
              <span className="flex-1 text-sm text-concrete-500">
                {decision === 'pre_selecionado'
                  ? 'Contato por WhatsApp liberado para os dois lados.'
                  : 'Avisamos que dessa vez não deu certo.'}
              </span>
              <Button
                label="Desfazer"
                variant="secondary"
                size="sm"
                onClick={() => decideApplication(jobId, worker.id, null)}
              />
            </div>
          ) : (
            <span className="text-center text-xs text-concrete-500">As vagas desse bico já foram preenchidas.</span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function PostsSection({ worker, isOwn }: { worker: Worker; isOwn: boolean }) {
  const db = useDb();
  const [ui, setUi] = useUI<PostsUI>(POSTS_KEY, POSTS_DEFAULTS);
  const posts = postsForWorker(db, worker.id);
  const firstName = worker.name.split(' ')[0];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500">
          {isOwn ? 'Seus trabalhos' : `Trabalhos de ${firstName}`}
        </span>
        {isOwn ? (
          <Button
            label="Publicar"
            variant="ghost"
            size="sm"
            iconLeft="plus"
            onClick={() => setUi({ composing: true })}
          />
        ) : null}
      </div>
      {posts.length === 0 ? (
        <EmptyState
          icon="camera"
          title={isOwn ? 'Mostre o seu trabalho' : 'Nenhum post ainda'}
          description={
            isOwn
              ? 'Publique fotos ou vídeos dos seus bicos para as construtoras verem a qualidade do seu serviço.'
              : `${firstName} ainda não publicou fotos ou vídeos do trabalho.`
          }
          actionLabel={isOwn ? 'Publicar primeiro post' : null}
          onAction={isOwn ? () => setUi({ composing: true }) : null}
        />
      ) : (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} isOwn={isOwn} onDelete={() => setUi({ deleteId: p.id })} />
          ))}
        </div>
      )}
      {isOwn ? <Composer worker={worker} ui={ui} setUi={setUi} /> : null}
      {isOwn ? (
        <Dialog
          open={Boolean(ui.deleteId)}
          tone="danger"
          title="Excluir esse post?"
          description="A publicação some do seu perfil imediatamente."
          confirmLabel="Excluir post"
          onConfirm={() => {
            if (ui.deleteId) deleteWorkerPost(ui.deleteId);
            setUi({ deleteId: null });
          }}
          cancelLabel="Cancelar"
          onCancel={() => setUi({ deleteId: null })}
        />
      ) : null}
    </div>
  );
}

function PostCard({ post, isOwn, onDelete }: { post: WorkerPost; isOwn: boolean; onDelete: () => void }) {
  return (
    <div className="flex flex-col rounded-card overflow-hidden border border-concrete-200 bg-white">
      <div className="relative">
        {post.mediaUrl ? (
          post.mediaType === 'video' ? (
            <video
              src={post.mediaUrl}
              controls
              className="w-full h-72 lg:h-auto lg:aspect-square object-cover bg-concrete-900"
            />
          ) : (
            <img src={post.mediaUrl} alt="" className="w-full h-72 lg:h-auto lg:aspect-square object-cover" />
          )
        ) : (
          <div className="w-full h-72 lg:h-auto lg:aspect-square bg-concrete-200 flex items-center justify-center">
            <Icon name="camera" size={32} color="var(--text-subtle)" />
          </div>
        )}
        {post.mediaType === 'video' ? (
          <span className="absolute top-2.5 left-2.5">
            <Badge label="Vídeo" tone="neutral" />
          </span>
        ) : null}
        {isOwn ? (
          <span className="absolute top-2.5 right-2.5">
            <IconButton icon="trash-2" label="Excluir post" variant="solid" size="sm" onClick={onDelete} />
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5 p-3.5">
        {post.caption ? <p className="text-sm text-concrete-800 leading-relaxed">{post.caption}</p> : null}
        <span className="text-xs text-concrete-400">{formatPostDate(post.date)}</span>
      </div>
    </div>
  );
}

interface ComposerProps {
  worker: Worker;
  ui: PostsUI;
  setUi: (patch: Partial<PostsUI>) => void;
}

function Composer({ worker, ui, setUi }: ComposerProps) {
  const closeAndReset = () => setUi({ composing: false, mediaUrl: null, mediaType: 'image', caption: '' });

  return (
    <Sheet open={ui.composing} title="Publicar trabalho" onClose={closeAndReset}>
      <label
        className="relative flex items-center justify-center overflow-hidden cursor-pointer bg-concrete-100 border-2 border-dashed border-concrete-300 hover:border-brand-400 rounded-card w-full transition-colors"
        style={{ height: '12rem' }}
      >
        <input
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            resetFileInput(e.target);
            setUi({
              mediaUrl: URL.createObjectURL(file),
              mediaType: file.type.indexOf('video') === 0 ? 'video' : 'image'
            });
          }}
        />
        {ui.mediaUrl ? (
          ui.mediaType === 'video' ? (
            <video src={ui.mediaUrl} controls className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <img src={ui.mediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )
        ) : (
          <span className="flex flex-col items-center gap-1.5 text-concrete-500 px-3 text-center">
            <Icon name="camera" size={24} />
            <span className="text-xs font-semibold">Toque para escolher uma foto ou vídeo</span>
          </span>
        )}
      </label>
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="worker-post-caption" className="text-sm font-semibold text-concrete-900">
          Descrição
        </label>
        <TextArea
          id="worker-post-caption"
          rows={3}
          placeholder="Conte o que foi feito nesse bico..."
          value={ui.caption}
          className="w-full px-3 py-2.5 bg-white rounded-control border border-concrete-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none text-base text-concrete-900 placeholder:text-concrete-400 resize-none transition-colors duration-150"
          onInput={(v) => setUi({ caption: v })}
        />
      </div>
      <Button
        label="Publicar"
        size="lg"
        fullWidth
        disabled={!ui.mediaUrl}
        onClick={() => {
          addWorkerPost(worker.id, { mediaUrl: ui.mediaUrl, mediaType: ui.mediaType, caption: ui.caption.trim() });
          closeAndReset();
        }}
      />
    </Sheet>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <p className="text-concrete-500">Trabalhador não encontrado.</p>
      <Button label="Voltar ao mural" variant="secondary" onClick={() => navigate('/mural')} />
    </div>
  );
}
