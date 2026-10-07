import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { IconAlertTriangle, IconPlus, IconTool, IconSearch, IconPackage, IconBoxSeam, IconCalendarPlus } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import type { EnrichedInventar } from '@/types/enriched';
import { LivingAppsService } from '@/services/livingAppsService';
import { formatDate } from '@/lib/formatters';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { tx, appLabel, dateFnsLocale } from '@/i18n';
import { DashboardGrid } from '@/components/DashboardGrid';
import { HeroBanner } from '@/components/HeroBanner';
import { WorkList } from '@/components/WorkList';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChartWidget, type ChartRow, type ChartSegment } from '@/components/widgets/ChartWidget';

const VISIBLE_STEP = 12;

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { setInventar } = data;
  const clock = useClock();
  const crud = useEntityCrud(data, {
    footer: (top) => {
      if (top.type !== 'inventar') return undefined;
      const r = top.record as EnrichedInventar;
      return isLow(r) ? { label: tx('Bestand auffüllen'), onClick: () => restock(r) } : undefined;
    },
  });
  const enrichedInventar = crud.enriched.inventar;

  const [search, setSearch] = useState('');
  const [defectOnly, setDefectOnly] = useState(false);
  const [sel, setSel] = useState<ChartSegment<EnrichedInventar> | null>(null);
  const [visible, setVisible] = useState(VISIBLE_STEP);

  function isLow(r: EnrichedInventar) {
    const min = r.fields.mindestbestand;
    return min != null && (r.fields.menge ?? 0) < min;
  }
  function isDefect(r: EnrichedInventar) {
    const k = r.fields.zustand?.key;
    return k === 'defekt' || k === 'in_reparatur';
  }

  // Shared write path: hero, overlay footer and row actions all fill up to the minimum.
  function restock(r: EnrichedInventar) {
    const min = r.fields.mindestbestand;
    if (min == null) return;
    const prev = r.fields.menge ?? 0;
    const write = (menge: number) => {
      setInventar(list => list.map(x => x.record_id === r.record_id ? { ...x, fields: { ...x.fields, menge } } : x));
      LivingAppsService.updateInventarEntry(r.record_id, { menge }).catch(() => { void data.fetchAll(); });
    };
    write(min);
    undoToast(tx`${r.fields.artikelname ?? ''} — Bestand auf ${min} aufgefüllt`, () => write(prev));
  }

  const qty = (r: EnrichedInventar) =>
    `${r.fields.menge ?? 0} ${r.fields.einheit?.label ?? ''}`.trim();

  const low = useMemo(
    () => enrichedInventar.filter(isLow).sort((a, b) =>
      ((a.fields.menge ?? 0) - (a.fields.mindestbestand ?? 0)) - ((b.fields.menge ?? 0) - (b.fields.mindestbestand ?? 0))),
    [enrichedInventar],
  );
  const defect = useMemo(() => enrichedInventar.filter(isDefect), [enrichedInventar]);
  const recent = useMemo(
    () => enrichedInventar
      .filter(r => r.fields.anschaffungsdatum)
      .sort((a, b) => (b.fields.anschaffungsdatum ?? '').localeCompare(a.fields.anschaffungsdatum ?? '')),
    [enrichedInventar],
  );

  const rows = useMemo<ChartRow<EnrichedInventar>[]>(
    () => enrichedInventar.map(r => ({ id: `inventar:${r.record_id}`, data: r })),
    [enrichedInventar],
  );

  const listed = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enrichedInventar
      .filter(r => !defectOnly || isDefect(r))
      .filter(r => !sel || sel.test({ id: `inventar:${r.record_id}`, data: r }))
      .filter(r => !q || [r.fields.artikelname, r.fields.artikelnummer, r.fields.standort, r.kategorieName, r.lieferantName]
        .some(v => (v ?? '').toLowerCase().includes(q)))
      .sort((a, b) => Number(isLow(b)) - Number(isLow(a)) || (a.fields.artikelname ?? '').localeCompare(b.fields.artikelname ?? ''));
  }, [enrichedInventar, search, defectOnly, sel]);

  const total = enrichedInventar.length;
  const todayLabel = format(clock, 'EEEE, d. MMMM', { locale: dateFnsLocale() });

  let context: string;
  if (total === 0) context = tx('Richte dein Lager ein — erfasse den ersten Artikel.');
  else if (low.length > 0) context = tx`${namen(low.map(r => r.fields.artikelname ?? ''), 3)} ist bzw. sind knapp — Zeit nachzubestellen.`;
  else if (defect.length > 0) context = tx`Bestände sind in Ordnung — ${namen(defect.map(r => r.fields.artikelname ?? ''), 3)} braucht Aufmerksamkeit.`;
  else context = tx`Alle Bestände sind in Ordnung.`;

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{context}</p>
        <p className="text-xs text-muted-foreground">{todayLabel}</p>
      </div>
      {crud.inventar.canWrite && (
        <Button onClick={() => crud.inventar.openCreate({})} className="max-sm:w-full">
          <IconPlus size={16} className="shrink-0" />
          {tx('Artikel erfassen')}
        </Button>
      )}
    </div>
  );

  if (total === 0) {
    return (
      <div className="space-y-6">
        {header}
        <div className="flex flex-col items-center gap-3 rounded-[27px] bg-card p-10 text-center shadow-lg">
          <IconBoxSeam size={48} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{tx('Noch keine Artikel im Lager. Starte mit dem ersten Eintrag.')}</p>
          {crud.inventar.canWrite && (
            <Button onClick={() => crud.inventar.openCreate({})}>{tx('Ersten Artikel aufnehmen')}</Button>
          )}
        </div>
        {crud.surfaces}
      </div>
    );
  }

  const shown = listed.slice(0, visible);

  return (
    <div className="space-y-6">
      {header}
      <DashboardGrid
        variant="split"
        hero={low.length > 0 ? (
          <HeroBanner
            icon={<IconAlertTriangle size={18} />}
            action={{ label: tx`${low[0].fields.artikelname ?? ''} auffüllen`, onClick: () => restock(low[0]) }}
          >
            <b>{tx`${low.length} Artikel unter Mindestbestand`}</b>
            {' — '}
            {namen(low.map(r => `${r.fields.artikelname ?? ''} (${qty(r)} / ${r.fields.mindestbestand})`), 3)}
          </HeroBanner>
        ) : undefined}
        kpis={
          <StatStrip>
            <StatStripItem
              title={tx('Defekt / in Reparatur')}
              value={defect.length}
              icon={<IconTool size={18} className="text-muted-foreground" />}
              tone={defect.length > 0 ? 'warning' : 'default'}
              onClick={() => { setDefectOnly(v => !v); setVisible(VISIBLE_STEP); }}
              active={defectOnly}
            />
            <StatStripItem
              title={tx('Artikel gesamt')}
              value={total}
              icon={<IconPackage size={18} className="text-muted-foreground" />}
              onClick={() => { setDefectOnly(false); setSel(null); setSearch(''); }}
            />
          </StatStrip>
        }
        primary={
          <section className="rounded-[27px] bg-card p-5 shadow-lg overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {appLabel('inventar')}{defectOnly ? ` · ${tx('Defekt / in Reparatur')}` : ''}{sel ? ` · ${sel.label}` : ''}
              </h2>
              <div className="relative w-full sm:w-64">
                <IconSearch size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setVisible(VISIBLE_STEP); }}
                  placeholder={tx('Name, Standort, Lieferant …')}
                  className="pl-8"
                />
              </div>
            </div>
            {shown.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{tx('Keine Artikel für diese Auswahl.')}</p>
            ) : (
              <ul className="mt-3 divide-y divide-border -mx-2">
                {shown.map(r => {
                  const isL = isLow(r);
                  const z = r.fields.zustand;
                  return (
                    <li key={r.record_id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => crud.inventar.openDetail(r)}
                        onKeyDown={e => { if (e.key === 'Enter') crud.inventar.openDetail(r); }}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-muted/40 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{r.fields.artikelname ?? '—'}</div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">
                            {[r.kategorieName, r.fields.standort, r.lieferantName].filter(Boolean).join(' · ') || '—'}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className={`text-sm font-semibold ${isL ? 'text-destructive' : ''}`}>{qty(r)}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.fields.mindestbestand != null ? tx`Min. ${r.fields.mindestbestand}` : ''}
                            {z ? <span className={isDefect(r) ? ' font-medium text-amber-600' : ''}>{r.fields.mindestbestand != null ? ' · ' : ''}{z.label}</span> : null}
                          </div>
                        </div>
                        {isL && crud.inventar.canWrite && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={e => { e.stopPropagation(); restock(r); }}
                            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); restock(r); } }}
                            className="shrink-0 inline-flex items-center justify-center min-h-8 max-sm:min-h-11 rounded-lg border border-border px-2 max-sm:px-4 py-1 text-xs max-sm:text-sm font-medium hover:bg-muted transition-colors"
                          >
                            {tx('Auffüllen')}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {listed.length > visible && (
              <div className="mt-2 flex justify-center">
                <Button variant="ghost" size="sm" onClick={() => setVisible(v => v + VISIBLE_STEP)}>
                  {tx`Mehr anzeigen (${listed.length - visible} weitere)`}
                </Button>
              </div>
            )}
          </section>
        }
        aside={
          <>
            <WorkList
              title={tx('Zuletzt angeschafft')}
              icon={<IconCalendarPlus size={14} />}
              items={recent.map(r => ({
                id: r.record_id,
                title: r.fields.artikelname ?? '—',
                secondLine: (
                  <span className="text-muted-foreground">
                    {formatDate(r.fields.anschaffungsdatum)} · {qty(r)}{r.lieferantName ? ` · ${r.lieferantName}` : ''}
                  </span>
                ),
              }))}
              max={5}
              onItemClick={id => {
                const rec = enrichedInventar.find(x => x.record_id === id);
                if (rec) crud.inventar.openDetail(rec);
              }}
              empty={{ text: tx('Noch kein Anschaffungsdatum erfasst.') }}
            />
            <ChartWidget<EnrichedInventar>
              title={tx('Artikel nach Kategorie')}
              rows={rows}
              dimension={{ kind: 'category', accessor: r => r.data.kategorieName || null, label: tx('Kategorie') }}
              interaction={{ mode: 'filter', selectedKey: sel?.key ?? null, onSelect: s => { setSel(s); setVisible(VISIBLE_STEP); } }}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
