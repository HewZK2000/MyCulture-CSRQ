'use client';

import { useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ChartProps = { fallbackHref: string };
type DatasetFilter = 'all' | 'malay' | 'cs';
type GapFilter = 'all' | 'option' | 'judge';

const optionModels = [
  { name: 'GPT-5', malay: { mcq: 81.98, csrq: 59.46 }, cs: { mcq: 76.32, csrq: 63.16 } },
  { name: 'Gemini-2.5-Pro', malay: { mcq: 84.38, csrq: 56.16 }, cs: { mcq: 80.26, csrq: 51.32 } },
  { name: 'GLM-4.6', malay: { mcq: 73.87, csrq: 47.15 }, cs: { mcq: 75.0, csrq: 46.05 } },
  { name: 'Qwen3-235B-Thinking', malay: { mcq: 77.18, csrq: 45.65 }, cs: { mcq: 76.32, csrq: 57.89 } },
];

const optionSeries = [
  { dataset: 'malay' as const, format: 'mcq' as const, label: 'MalayMMLU · MCQ', color: 'var(--chart-blue-soft)' },
  { dataset: 'malay' as const, format: 'csrq' as const, label: 'MalayMMLU · CSRQ', color: 'var(--chart-blue)' },
  { dataset: 'cs' as const, format: 'mcq' as const, label: 'CS-EN · MCQ', color: 'var(--chart-green-soft)' },
  { dataset: 'cs' as const, format: 'csrq' as const, label: 'CS-EN · CSRQ', color: 'var(--chart-green)' },
];

const gapModels = [
  { name: 'GPT-5', option: 31.4, judge: 33.9 },
  { name: 'Gemini-2.5-Pro', option: 29.9, judge: 35.4 },
  { name: 'GLM-4.6', option: 31.1, judge: 35.6 },
  { name: 'Qwen3-235B-Thinking', option: 18.9, judge: 23.6 },
];

const judgeNames = ['Qwen3-235B Inst', 'Qwen3-30B Inst', 'Gemini-2.5 Flash-Lite', 'GPT-5 Nano'];
const judgeDisplayNames = ['Qwen 235B', 'Qwen 30B', 'Gemini Lite', 'GPT-5 Nano'];
const judgedModels = [
  { name: 'GPT-5', shortName: 'GPT-5', values: [22.9, 42.45, 14.28, 16.53], deviation: 12.8 },
  { name: 'Gemini-2.5-Pro', shortName: 'Gemini Pro', values: [20.26, 40.09, 12.58, 13.84], deviation: 12.72 },
  { name: 'GLM-4.6', shortName: 'GLM-4.6', values: [17.68, 35.58, 9.94, 10.54], deviation: 11.96 },
  { name: 'Qwen3-235B-Thinking', shortName: 'Qwen 235B Think', values: [18.51, 25.7, 13.45, 10.87], deviation: 6.53 },
  { name: 'Qwen3-235B-Instruct', shortName: 'Qwen 235B Inst', values: [15.27, 37.12, 11.59, 8.84], deviation: 12.88 },
];

function useChartReveal(ref: RefObject<HTMLDivElement | null>, selector: string, axis: 'x' | 'y') {
  useGSAP(() => {
    if (!ref.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(selector, { scaleX: 1, scaleY: 1, autoAlpha: 1 });
      return;
    }

    gsap.fromTo(
      selector,
      { [axis === 'x' ? 'scaleX' : 'scaleY']: 0, autoAlpha: 0.45 },
      {
        [axis === 'x' ? 'scaleX' : 'scaleY']: 1,
        autoAlpha: 1,
        duration: 0.9,
        stagger: 0.055,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 82%',
          once: true,
        },
      },
    );
  }, { scope: ref });
}

function ChartToolbar({ label, fallbackHref, children }: ChartProps & { label: string; children: ReactNode }) {
  return (
    <div className="interactive-chart-toolbar">
      <span>{label}</span>
      <div className="chart-toolbar-actions">{children}<a href={fallbackHref}>Original figure ↗</a></div>
    </div>
  );
}

export function OptionRemovalChart({ fallbackHref }: ChartProps) {
  const root = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<DatasetFilter>('all');
  const [selectedModel, setSelectedModel] = useState(0);
  useChartReveal(root, '.option-bar-fill', 'y');

  const visibleSeries = optionSeries.filter((series) => filter === 'all' || series.dataset === filter);
  const selected = optionModels[selectedModel];
  const selectedMalayGap = selected.malay.mcq - selected.malay.csrq;
  const selectedCsGap = selected.cs.mcq - selected.cs.csrq;

  return (
    <div className="interactive-chart option-chart" ref={root}>
      <ChartToolbar label="Interactive comparison" fallbackHref={fallbackHref}>
        <div className="chart-segmented" aria-label="Filter benchmark dataset">
          {([['all', 'Both'], ['malay', 'MalayMMLU'], ['cs', 'CS-EN']] as const).map(([value, label]) => (
            <button key={value} type="button" className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>
          ))}
        </div>
      </ChartToolbar>

      <div className="option-chart-summary" aria-label="Average score change">
        <div><span>MalayMMLU average</span><strong>71.5 <b>→</b> 41.9</strong><small>−29.64 points</small></div>
        <div><span>CS-EN average</span><strong>72.6 <b>→</b> 48.9</strong><small>−23.68 points</small></div>
      </div>

      <div className="option-selected-detail" key={selected.name} aria-live="polite">
        <div className="option-selected-heading"><span>Selected model</span><strong>{selected.name}</strong></div>
        <div className="option-selected-dataset">
          <span>MalayMMLU</span>
          <strong><b>{selected.malay.mcq.toFixed(2)}</b><i>MCQ</i><em>→</em><b>{selected.malay.csrq.toFixed(2)}</b><i>CSRQ</i></strong>
          <small>−{selectedMalayGap.toFixed(2)} points</small>
        </div>
        <div className="option-selected-dataset">
          <span>CS-EN</span>
          <strong><b>{selected.cs.mcq.toFixed(2)}</b><i>MCQ</i><em>→</em><b>{selected.cs.csrq.toFixed(2)}</b><i>CSRQ</i></strong>
          <small>−{selectedCsGap.toFixed(2)} points</small>
        </div>
      </div>

      <div className="option-chart-plot">
        <div className="chart-y-axis" aria-hidden="true"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
        <div className="chart-grid-lines" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="option-chart-groups">
          {optionModels.map((model, modelIndex) => {
            const malayGap = model.malay.mcq - model.malay.csrq;
            const csGap = model.cs.mcq - model.cs.csrq;
            return (
            <div className={`option-model-group ${selectedModel === modelIndex ? 'is-selected' : ''}`} key={model.name}>
              <div className="option-bar-cluster">
                {visibleSeries.map((series) => {
                  const score = model[series.dataset][series.format];
                  return (
                    <div className="option-bar-slot" style={{ height: `${score}%` }} key={`${series.dataset}-${series.format}`}>
                      <button
                        className="option-bar-fill"
                        type="button"
                        style={{ background: series.color }}
                        onMouseEnter={() => setSelectedModel(modelIndex)}
                        onFocus={() => setSelectedModel(modelIndex)}
                        onClick={() => setSelectedModel(modelIndex)}
                        aria-label={`${model.name}, ${series.label}: ${score.toFixed(2)} percent`}
                      >
                        <span>{score.toFixed(2)}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <button className="option-model-name" type="button" onClick={() => setSelectedModel(modelIndex)} aria-pressed={selectedModel === modelIndex}>
                <strong>{model.name}</strong>
                <small>
                  {filter !== 'cs' && <span>M −{malayGap.toFixed(2)}</span>}
                  {filter !== 'malay' && <span>CS −{csGap.toFixed(2)}</span>}
                </small>
              </button>
            </div>
          )})}
        </div>
      </div>

      <div className="chart-legend" aria-label="Chart legend">
        {visibleSeries.map((series) => <span key={series.label}><i style={{ background: series.color }} />{series.label}</span>)}
      </div>
      <p className="chart-interaction-hint">Every bar shows its exact score. Hover, focus, or click a model to update the breakdown above; use the dataset controls to simplify the chart.</p>
    </div>
  );
}

export function InstrumentGapChart({ fallbackHref }: ChartProps) {
  const root = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<GapFilter>('all');
  const previousFilter = useRef<GapFilter>('all');
  useChartReveal(root, '.gap-bar-fill', 'x');

  useGSAP(() => {
    if (!root.current) return;
    const previous = previousFilter.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tracks = gsap.utils.toArray<HTMLElement>('.gap-bar-track');

    if (reduced) {
      gsap.set(tracks, { clearProps: 'all' });
      previousFilter.current = filter;
      return;
    }

    const timeline = gsap.timeline({ defaults: { overwrite: 'auto' } });
    tracks.forEach((track, index) => {
      const kind = track.dataset.gapKind as Exclude<GapFilter, 'all'>;
      const wasVisible = previous === 'all' || previous === kind;
      const isVisible = filter === 'all' || filter === kind;
      const fill = track.querySelector('.gap-bar-fill');

      if (wasVisible !== isVisible) {
        timeline.fromTo(
          track,
          { height: wasVisible ? 25 : 0, autoAlpha: wasVisible ? 1 : 0, scaleY: wasVisible ? 1 : 0.55, y: wasVisible ? 0 : -4 },
          {
            height: isVisible ? 25 : 0,
            autoAlpha: isVisible ? 1 : 0,
            scaleY: isVisible ? 1 : 0.55,
            y: isVisible ? 0 : -4,
            duration: 0.48,
            ease: 'power3.inOut',
            clearProps: 'height,opacity,visibility,transform',
          },
          index * 0.025,
        );
      }

      if (isVisible && fill) {
        timeline.fromTo(
          fill,
          { scaleX: wasVisible ? 0.93 : 0.62 },
          { scaleX: 1, duration: 0.58, ease: 'back.out(1.35)', clearProps: 'transform' },
          0.12 + index * 0.035,
        );
      }
    });

    previousFilter.current = filter;
  }, { scope: root, dependencies: [filter], revertOnUpdate: true });

  return (
    <div className="interactive-chart gap-chart" ref={root}>
      <ChartToolbar label="Interactive gap explorer" fallbackHref={fallbackHref}>
        <div className="chart-segmented" aria-label="Filter instrument gap">
          {([['all', 'Both'], ['option', 'MCQ–CSRQ'], ['judge', 'CSRQ–CRQ']] as const).map(([value, label]) => (
            <button key={value} type="button" className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>
          ))}
        </div>
      </ChartToolbar>
      <div className="gap-axis" aria-hidden="true"><span>0</span><span>10</span><span>20</span><span>30</span><span>40 points</span></div>
      <div className="gap-rows">
        {gapModels.map((model) => (
          <div className="gap-row" key={model.name}>
            <span>{model.name}</span>
            <div className="gap-bars">
              {(['option', 'judge'] as const).map((kind) => {
                const hidden = filter !== 'all' && filter !== kind;
                return (
                <div className={`gap-bar-track ${hidden ? 'is-hidden' : ''}`} data-gap-kind={kind} key={kind} aria-hidden={hidden}>
                  <button
                    type="button"
                    className={`gap-bar-fill gap-${kind}`}
                    style={{ width: `${(model[kind] / 40) * 100}%` }}
                    disabled={hidden}
                    aria-label={`${model.name}, ${kind === 'option' ? 'MCQ to CSRQ' : 'CSRQ to CRQ'} gap: ${model[kind].toFixed(1)} points`}
                  ><span>{model[kind].toFixed(1)}</span></button>
                </div>
              )})}
            </div>
          </div>
        ))}
      </div>
      <div className="chart-legend"><span><i className="legend-blue" />MCQ − CSRQ strict</span><span><i className="legend-green" />CSRQ strict − CRQ strict</span></div>
      <p className="chart-interaction-hint">Toggle either gap to isolate option-removal sensitivity or the shift to judge-based scoring.</p>
    </div>
  );
}

type ActiveCell = { row: number; column: number };

export function JudgeSensitivityChart({ fallbackHref }: ChartProps) {
  const root = useRef<HTMLDivElement>(null);
  const [activeCell, setActiveCell] = useState<ActiveCell>({ row: 0, column: 1 });
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  useChartReveal(root, '.heat-cell', 'y');

  const activeModel = judgedModels[activeCell.row];
  const activeJudge = judgeNames[activeCell.column];
  const activeScore = activeModel.values[activeCell.column];

  const heatStyle = (value: number): CSSProperties => {
    const intensity = Math.round(14 + ((value - 8) / 35) * 76);
    return {
      background: `color-mix(in srgb, #b91f34 ${Math.max(14, Math.min(90, intensity))}%, #fff7f1)`,
      color: value >= 30 ? 'white' : 'var(--ink)',
    };
  };

  return (
    <div className="interactive-chart heatmap-chart" ref={root}>
      <ChartToolbar label="Interactive judge matrix" fallbackHref={fallbackHref}>
        <button className="chart-reset" type="button" onClick={() => setHighlightedRow(null)} disabled={highlightedRow === null}>Show all models</button>
      </ChartToolbar>

      <div className="heatmap-highlight-controls" aria-label="Highlight evaluated model">
        <span>Highlight:</span>
        {judgedModels.map((model, row) => (
          <button type="button" key={model.name} className={highlightedRow === row ? 'is-active' : ''} onClick={() => setHighlightedRow(highlightedRow === row ? null : row)} aria-pressed={highlightedRow === row}>{model.name}</button>
        ))}
      </div>

      <div className="heatmap-scroll">
        <div className="heatmap-grid" role="grid" aria-label="Strict CRQ scores by evaluated model and judge model">
          <div className="heat-corner">Evaluated model ↓ / Judge →</div>
          {judgeNames.map((judge, column) => <div className="heat-column-label" role="columnheader" title={judge} key={judge}>{judgeDisplayNames[column]}</div>)}
          <div className="heat-column-label">Std. dev.</div>

          {judgedModels.map((model, row) => (
            <div className={`heat-row-contents ${highlightedRow !== null && highlightedRow !== row ? 'is-dimmed' : ''}`} role="row" key={model.name}>
              <button className="heat-row-label" type="button" title={model.name} onClick={() => setHighlightedRow(highlightedRow === row ? null : row)}>{model.shortName}</button>
              {model.values.map((value, column) => (
                <button
                  className={`heat-cell ${activeCell.row === row && activeCell.column === column ? 'is-active' : ''}`}
                  type="button"
                  style={heatStyle(value)}
                  key={judgeNames[column]}
                  onMouseEnter={() => setActiveCell({ row, column })}
                  onFocus={() => setActiveCell({ row, column })}
                  onClick={() => setActiveCell({ row, column })}
                  role="gridcell"
                  aria-label={`${model.name} evaluated by ${judgeNames[column]}: ${value.toFixed(2)} percent`}
                >{value.toFixed(2)}</button>
              ))}
              <div className="heat-deviation" aria-label={`${model.name} standard deviation ${model.deviation.toFixed(2)} percent`}>
                <i style={{ width: `${(model.deviation / 14) * 100}%` }} /><span>{model.deviation.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="heatmap-reading" aria-live="polite">
        <span>Selected comparison</span>
        <strong>{activeScore.toFixed(2)}%</strong>
        <p><b>{activeModel.name}</b> evaluated by <b>{activeJudge}</b>. This evaluated model varies by σ = {activeModel.deviation.toFixed(2)} points across judges.</p>
      </div>
      <p className="chart-interaction-hint">Hover, focus, or click a cell for context. Highlight a row to compare how judges score one model.</p>
    </div>
  );
}
