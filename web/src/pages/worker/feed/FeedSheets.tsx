// The mural's two sheets: the filters, and the city picker that opens over them.
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/icons/Icon';
import { Input } from '../../../components/Input';
import { Sheet } from '../../../components/Modal';
import { Switch } from '../../../components/Switch';
import { Tag } from '../../../components/Tag';
import { TIPOS_SERVICO } from '../../../services/catalog';
import { nearestCity, searchCities } from '../../../services/cities';
import { cx } from '../../../utils/cx';
import { NO_FILTERS, setFeed, SORTS, type FeedUI } from './feedUI';

function FilterGroup({
  title,
  options,
  active,
  onSelect
}: {
  title: string;
  options: string[];
  active: string | null;
  onSelect: (o: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500">{title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Tag key={o} label={o} selected={active === o} onClick={() => onSelect(o)} />
        ))}
      </div>
    </div>
  );
}

/** One filter panel for both layouts: a bottom sheet on phones, a dialog on desktop. */
export function FiltersSheet({ ui, count }: { ui: FeedUI; count: number }) {
  return (
    <Sheet open={ui.filtersOpen} title="Filtros" onClose={() => setFeed({ filtersOpen: false })}>
      <div className="flex flex-col gap-2.5">
        <div className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500">Onde você quer trabalhar</div>
        <button
          type="button"
          aria-haspopup="dialog"
          className="flex items-center gap-3 w-full p-3 rounded-card border border-concrete-300 bg-white text-left transition-colors hover:bg-concrete-50 hover:border-concrete-400"
          onClick={() => setFeed({ pickerOpen: true, cityQuery: '', geo: null })}
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 shrink-0">
            <Icon name="map-pin" size={20} color="var(--brand)" />
          </span>
          <span className="flex-1 min-w-0 flex flex-col">
            <span className="text-xs text-concrete-500">Cidade</span>
            <span className="font-semibold text-concrete-900 truncate">{ui.location}</span>
          </span>
          <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600 shrink-0">
            Escolher
            <Icon name="chevron-right" size={16} color="var(--text-brand)" />
          </span>
        </button>
      </div>
      {/* The phone has these as a segmented control on the mural itself. */}
      <div className="hidden lg:flex flex-col gap-2.5">
        <div className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500">Ordenar por</div>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((o) => (
            <Tag key={o.id} label={o.label} selected={ui.sort === o.id} onClick={() => setFeed({ sort: o.id })} />
          ))}
        </div>
      </div>
      <FilterGroup
        title="Tipo de serviço"
        options={TIPOS_SERVICO}
        active={ui.tipo}
        onSelect={(v) => setFeed({ tipo: ui.tipo === v ? null : v })}
      />
      <FilterGroup
        title={'Distância do centro de ' + ui.location.split(',')[0]}
        options={['5', '10', '20', 'Toda a cidade'].map((d) => (d === 'Toda a cidade' ? d : `Até ${d} km`))}
        active={ui.dist}
        onSelect={(v) => setFeed({ dist: v })}
      />
      <FilterGroup
        title="Quando"
        options={['Hoje', 'Amanhã', 'Durante a semana', 'Fim de semana']}
        active={ui.quando}
        onSelect={(v) => setFeed({ quando: ui.quando === v ? null : v })}
      />
      <div className="flex flex-col gap-1 pt-1 border-t border-concrete-200">
        <Switch
          label="Avisar quando aparecer bico novo"
          description="Chega uma notificação quando surgir vaga com esses filtros perto de você."
          checked={ui.notifyUrgent}
          onChange={(v) => setFeed({ notifyUrgent: v })}
        />
      </div>
      <div className="flex gap-3 pt-1">
        <Button label="Limpar" variant="secondary" className="flex-1" onClick={() => setFeed(NO_FILTERS)} />
        <Button
          label={`Ver ${count === 1 ? '1 vaga' : count + ' vagas'}`}
          className="flex-[1.4]"
          onClick={() => setFeed({ filtersOpen: false })}
        />
      </div>
    </Sheet>
  );
}

/** "Onde você quer trabalhar": GPS or typing any Brazilian city. Opens over the filters. */
export function CityPicker({ ui }: { ui: FeedUI }) {
  const choose = (label: string) => setFeed({ location: label, pickerOpen: false, cityQuery: '', geo: null });
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setFeed({ geo: 'error' });
      return;
    }
    setFeed({ geo: 'loading' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = nearestCity(pos.coords.latitude, pos.coords.longitude);
        if (c) choose(c.label);
        else setFeed({ geo: 'error' });
      },
      (err) => setFeed({ geo: err && err.code === 1 ? 'denied' : 'error' }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  };
  const q = ui.cityQuery.trim();
  const results = ui.pickerOpen ? searchCities(q, 8) : [];
  const geoMsg =
    ui.geo === 'denied'
      ? 'Seu navegador não liberou a localização. Digite a cidade abaixo.'
      : ui.geo === 'error'
        ? 'Não conseguimos achar sua localização agora. Digite a cidade abaixo.'
        : null;

  return (
    <Sheet
      open={ui.pickerOpen}
      title="Onde você quer trabalhar"
      onClose={() => setFeed({ pickerOpen: false, geo: null })}
    >
      <Button
        label={ui.geo === 'loading' ? 'Buscando sua localização…' : 'Usar minha localização'}
        variant="secondary"
        fullWidth
        iconLeft="locate-fixed"
        loading={ui.geo === 'loading'}
        onClick={useMyLocation}
      />
      {geoMsg ? (
        <span className="flex items-start gap-2 text-sm text-concrete-700 -mt-1">
          <Icon name="circle-alert" size={16} color="var(--amber-500)" />
          {geoMsg}
        </span>
      ) : null}
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-concrete-400">
        <span className="flex-1 h-px bg-concrete-200" />
        ou
        <span className="flex-1 h-px bg-concrete-200" />
      </div>
      <Input
        id="city-search"
        placeholder="Digite o nome da cidade"
        icon="search"
        value={ui.cityQuery}
        autoFocus
        onInput={(v) => setFeed({ cityQuery: v })}
      />
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500 pb-1">
          {q ? 'Cidades encontradas' : 'Cidades mais procuradas'}
        </span>
        {results.length ? (
          <div className="flex flex-col" role="listbox" aria-label="Cidades">
            {results.map((c) => {
              const active = c.label === ui.location;
              return (
                <button
                  key={c.label}
                  type="button"
                  role="option"
                  aria-selected={active ? 'true' : 'false'}
                  className={cx(
                    'flex items-center gap-3 min-h-12 px-2 -mx-2 rounded-control text-left transition-colors hover:bg-concrete-50',
                    active ? 'text-brand-600' : 'text-concrete-900'
                  )}
                  onClick={() => choose(c.label)}
                >
                  <Icon name="map-pin" size={18} color={active ? 'var(--brand)' : 'var(--text-subtle)'} />
                  <span className="flex-1 min-w-0 truncate">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-concrete-500">{' · ' + c.uf}</span>
                  </span>
                  {active ? <Icon name="check" size={18} color="var(--brand)" /> : null}
                </button>
              );
            })}
          </div>
        ) : (
          <span className="py-3 text-sm text-concrete-500">{`Nenhuma cidade com “${q}”. Confira a grafia.`}</span>
        )}
      </div>
    </Sheet>
  );
}
