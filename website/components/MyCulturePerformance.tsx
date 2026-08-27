'use client';

import { useMemo, useState } from 'react';

type ScoreKey = 'mcq' | 'csrqLoose' | 'csrqStrict' | 'crqLoose' | 'crqStrict';
type ReasoningFilter = 'all' | 'reasoning' | 'standard';

type ModelResult = {
  id: string;
  family: string;
  model: string;
  reasoning: boolean;
  formatFailure?: boolean;
  scores: Record<ScoreKey, number | null>;
};

const metrics: Array<{ key: ScoreKey; label: string; short: string }> = [
  { key: 'mcq', label: 'MCQ', short: 'MCQ' },
  { key: 'csrqLoose', label: 'CSRQ loose', short: 'CSRQ L' },
  { key: 'csrqStrict', label: 'CSRQ strict', short: 'CSRQ S' },
  { key: 'crqLoose', label: 'CRQ loose', short: 'CRQ L' },
  { key: 'crqStrict', label: 'CRQ strict', short: 'CRQ S' },
];

const results: ModelResult[] = [
  { id: 'baseline', family: 'Baseline', model: 'Random baseline', reasoning: false, scores: { mcq: 25.53, csrqLoose: 40.33, csrqStrict: 4.28, crqLoose: null, crqStrict: null } },
  { id: 'gpt-5', family: 'OpenAI', model: 'GPT-5', reasoning: true, scores: { mcq: 88.14, csrqLoose: 78.10, csrqStrict: 56.78, crqLoose: 68.41, crqStrict: 22.90 } },
  { id: 'gpt-5-mini', family: 'OpenAI', model: 'GPT-5-mini', reasoning: true, scores: { mcq: 84.73, csrqLoose: 77.50, csrqStrict: 55.46, crqLoose: 67.25, crqStrict: 25.65 } },
  { id: 'gpt-5-nano', family: 'OpenAI', model: 'GPT-5-nano', reasoning: true, scores: { mcq: 80.12, csrqLoose: 73.61, csrqStrict: 48.38, crqLoose: 63.10, crqStrict: 20.76 } },
  { id: 'gpt-4o', family: 'OpenAI', model: 'GPT-4o', reasoning: false, scores: { mcq: 90.28, csrqLoose: 78.00, csrqStrict: 56.01, crqLoose: 68.61, crqStrict: 21.14 } },
  { id: 'gpt-4o-mini', family: 'OpenAI', model: 'GPT-4o-mini', reasoning: false, scores: { mcq: 78.36, csrqLoose: 74.30, csrqStrict: 49.20, crqLoose: 65.78, crqStrict: 20.37 } },
  { id: 'gemini-25-pro', family: 'Google', model: 'Gemini-2.5-Pro', reasoning: true, scores: { mcq: 85.56, csrqLoose: 77.78, csrqStrict: 55.68, crqLoose: 66.87, crqStrict: 20.26 } },
  { id: 'gemini-25-flash', family: 'Google', model: 'Gemini-2.5-Flash', reasoning: true, scores: { mcq: 82.87, csrqLoose: 71.05, csrqStrict: 47.39, crqLoose: 65.23, crqStrict: 21.47 } },
  { id: 'gemini-25-flash-lite', family: 'Google', model: 'Gemini-2.5-Flash-Lite', reasoning: true, scores: { mcq: 79.57, csrqLoose: 72.90, csrqStrict: 48.00, crqLoose: 62.56, crqStrict: 18.95 } },
  { id: 'glm-46-reasoning', family: 'Z.ai', model: 'GLM-4.6', reasoning: true, scores: { mcq: 84.46, csrqLoose: 76.37, csrqStrict: 53.38, crqLoose: 63.20, crqStrict: 17.74 } },
  { id: 'glm-46-standard', family: 'Z.ai', model: 'GLM-4.6', reasoning: false, scores: { mcq: 87.37, csrqLoose: 77.45, csrqStrict: 54.91, crqLoose: 56.72, crqStrict: 17.68 } },
  { id: 'glm-4-32b', family: 'Z.ai', model: 'GLM-4-32B-128K', reasoning: false, scores: { mcq: 75.18, csrqLoose: 71.88, csrqStrict: 47.83, crqLoose: 59.26, crqStrict: 16.09 } },
  { id: 'qwen-235b-thinking', family: 'Alibaba', model: 'Qwen3-235B-Thinking', reasoning: true, scores: { mcq: 61.01, csrqLoose: 62.62, csrqStrict: 42.12, crqLoose: 50.13, crqStrict: 18.51 } },
  { id: 'qwen-30b-thinking', family: 'Alibaba', model: 'Qwen3-30B-Thinking', reasoning: true, scores: { mcq: 79.57, csrqLoose: 70.49, csrqStrict: 43.82, crqLoose: 62.48, crqStrict: 17.35 } },
  { id: 'qwen-4b-thinking', family: 'Alibaba', model: 'Qwen3-4B-Thinking', reasoning: true, scores: { mcq: 71.61, csrqLoose: 66.42, csrqStrict: 37.67, crqLoose: 48.47, crqStrict: 10.98 } },
  { id: 'qwen-235b-instruct', family: 'Alibaba', model: 'Qwen3-235B-Instruct', reasoning: false, scores: { mcq: 80.12, csrqLoose: 73.55, csrqStrict: 51.29, crqLoose: 62.93, crqStrict: 18.34 } },
  { id: 'qwen-30b-instruct', family: 'Alibaba', model: 'Qwen3-30B-Instruct', reasoning: false, scores: { mcq: 82.48, csrqLoose: 75.21, csrqStrict: 52.50, crqLoose: 59.03, crqStrict: 17.13 } },
  { id: 'qwen-4b-instruct', family: 'Alibaba', model: 'Qwen3-4B-Instruct', reasoning: false, scores: { mcq: 76.06, csrqLoose: 65.64, csrqStrict: 35.48, crqLoose: 55.97, crqStrict: 15.27 } },
  { id: 'seallm-7b', family: 'SeaLLM', model: 'SeaLLMs-v3-7B', reasoning: false, scores: { mcq: 29.98, csrqLoose: 52.96, csrqStrict: 26.30, crqLoose: 47.62, crqStrict: 7.86 } },
  { id: 'seallm-15b', family: 'SeaLLM', model: 'SeaLLMs-v3-1.5B', reasoning: false, formatFailure: true, scores: { mcq: 0.00, csrqLoose: 0.16, csrqStrict: 0.00, crqLoose: 39.54, crqStrict: 6.45 } },
  { id: 'sea-lion-32b', family: 'AI SG', model: 'Qwen-SEA-LION-v4-32B-IT', reasoning: false, scores: { mcq: 83.25, csrqLoose: 76.16, csrqStrict: 53.54, crqLoose: 62.55, crqStrict: 18.23 } },
  { id: 'mallam-11b', family: 'Mesolitica', model: 'MaLLaM-1.1B', reasoning: false, formatFailure: true, scores: { mcq: 0.00, csrqLoose: 0.00, csrqStrict: 0.00, crqLoose: 39.56, crqStrict: 5.44 } },
  { id: 'mallam-5b', family: 'Mesolitica', model: 'MaLLaM-5B', reasoning: false, formatFailure: true, scores: { mcq: 0.00, csrqLoose: 0.00, csrqStrict: 0.00, crqLoose: 46.10, crqStrict: 6.64 } },
];

const families = ['All', 'OpenAI', 'Google', 'Z.ai', 'Alibaba', 'SeaLLM', 'AI SG', 'Mesolitica'];
const lineColors = ['#4f8a69', '#4778b8', '#c43f4f', '#c89b3c', '#7c6296', '#2f7884'];
const defaultSelection = ['gpt-5', 'gpt-4o', 'gemini-25-pro', 'glm-46-reasoning', 'qwen-30b-instruct'];

function scoreLabel(value: number | null) {
  return value === null ? '—' : value.toFixed(2);
}

export default function MyCulturePerformance() {
  const [family, setFamily] = useState('All');
  const [reasoning, setReasoning] = useState<ReasoningFilter>('all');
  const [query, setQuery] = useState('');
  const [metric, setMetric] = useState<ScoreKey>('csrqStrict');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<string[]>(defaultSelection);
  const [hovered, setHovered] = useState<{ id: string; key: ScoreKey } | null>(null);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return results
      .filter((row) => family === 'All' || row.family === family)
      .filter((row) => reasoning === 'all' || (reasoning === 'reasoning' ? row.reasoning : !row.reasoning))
      .filter((row) => !normalizedQuery || `${row.family} ${row.model}`.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        const aValue = a.scores[metric] ?? -1;
        const bValue = b.scores[metric] ?? -1;
        return direction === 'desc' ? bValue - aValue : aValue - bValue;
      });
  }, [direction, family, metric, query, reasoning]);

  const chartRows = results.filter((row) => selected.includes(row.id));
  const leader = filtered.find((row) => row.scores[metric] !== null);
  const scoredRows = filtered.filter((row) => row.family !== 'Baseline' && row.scores[metric] !== null);
  const averageOptionGap = scoredRows.length
    ? scoredRows.reduce((sum, row) => sum + ((row.scores.mcq ?? 0) - (row.scores.csrqStrict ?? 0)), 0) / scoredRows.length
    : 0;
  const hoveredRow = hovered ? results.find((row) => row.id === hovered.id) : null;
  const hoveredMetric = hovered ? metrics.find((item) => item.key === hovered.key) : null;
  const bestByMetric = Object.fromEntries(metrics.map(({ key }) => [key, Math.max(...results.filter((row) => row.family !== 'Baseline').map((row) => row.scores[key] ?? -1))])) as Record<ScoreKey, number>;

  function chooseFamily(nextFamily: string) {
    setFamily(nextFamily);
    const candidates = results
      .filter((row) => row.family !== 'Baseline' && (nextFamily === 'All' || row.family === nextFamily))
      .sort((a, b) => (b.scores[metric] ?? -1) - (a.scores[metric] ?? -1))
      .slice(0, 5)
      .map((row) => row.id);
    setSelected(candidates);
  }

  function chooseReasoning(nextReasoning: ReasoningFilter) {
    setReasoning(nextReasoning);
  }

  function chooseMetric(nextMetric: ScoreKey) {
    if (nextMetric === metric) setDirection((current) => current === 'desc' ? 'asc' : 'desc');
    else {
      setMetric(nextMetric);
      setDirection('desc');
    }
  }

  function toggleModel(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 6) return [...current.slice(1), id];
      return [...current, id];
    });
  }

  function selectTopFive() {
    setSelected(filtered.filter((row) => row.family !== 'Baseline' && row.scores[metric] !== null).slice(0, 5).map((row) => row.id));
  }

  const xPosition = (index: number) => 82 + index * 194;
  const yPosition = (value: number) => 30 + (100 - value) * 2.38;

  return (
    <div className="performance-explorer">
      <div className="performance-toolbar">
        <div className="performance-search">
          <label htmlFor="performance-search">Find a model</label>
          <input id="performance-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search model or family…" />
        </div>
        <div className="performance-reasoning" aria-label="Filter by reasoning mode">
          {([['all', 'All modes'], ['reasoning', 'Reasoning'], ['standard', 'Standard']] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={reasoning === value} onClick={() => chooseReasoning(value)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="performance-family-filter" aria-label="Filter model family">
        {families.map((item) => (
          <button key={item} type="button" aria-pressed={family === item} onClick={() => chooseFamily(item)}>{item}</button>
        ))}
      </div>

      <div className="performance-metric-strip" aria-label="Choose score metric and table sort">
        {metrics.map((item) => (
          <button key={item.key} type="button" aria-pressed={metric === item.key} onClick={() => chooseMetric(item.key)}>
            <span>{item.label}</span>
            <strong>{metric === item.key ? (direction === 'desc' ? '↓' : '↑') : '·'}</strong>
          </button>
        ))}
      </div>

      <div className="performance-summary">
        <article><span>Rows in view</span><strong>{filtered.length}</strong><small>of {results.length} published rows</small></article>
        <article><span>Leader · {metrics.find((item) => item.key === metric)?.label}</span><strong>{leader ? scoreLabel(leader.scores[metric]) : '—'}</strong><small>{leader?.model ?? 'No matching rows'}</small></article>
        <article><span>Mean MCQ → CSRQ strict gap</span><strong>{averageOptionGap.toFixed(2)}</strong><small>points across the current view</small></article>
      </div>

      <div className="performance-profile-card">
        <div className="performance-profile-header">
          <div><p>Instrument score profile</p><h3>Follow each model as the evaluation format changes.</h3><span>Scores are percentages. Lines connect discrete instruments for comparison; they do not represent time.</span></div>
          <div className="performance-profile-actions"><button type="button" onClick={selectTopFive}>Plot top 5</button><button type="button" onClick={() => setSelected([])}>Clear</button></div>
        </div>

        <div className="performance-profile-status" aria-live="polite">
          {hovered && hoveredRow && hoveredMetric
            ? <><span>{hoveredRow.model} · {hoveredMetric.label}</span><strong>{scoreLabel(hoveredRow.scores[hovered.key])}</strong></>
            : <><span>Hover a point for its exact score</span><strong>{selected.length}/6 models</strong></>}
        </div>

        <div className="performance-svg-wrap">
          <svg className="performance-profile-chart" viewBox="0 0 940 330" role="img" aria-label="Interactive score profile comparing selected models across MCQ, CSRQ loose, CSRQ strict, CRQ loose, and CRQ strict">
            {[0, 25, 50, 75, 100].map((tick) => (
              <g key={tick}>
                <line x1="70" x2="870" y1={yPosition(tick)} y2={yPosition(tick)} className="profile-grid-line" />
                <text x="55" y={yPosition(tick) + 4} textAnchor="end" className="profile-axis-label">{tick}</text>
              </g>
            ))}
            {metrics.map((item, index) => (
              <g key={item.key}>
                <line x1={xPosition(index)} x2={xPosition(index)} y1="30" y2="268" className="profile-column-line" />
                <text x={xPosition(index)} y="296" textAnchor="middle" className="profile-stage-label">{item.short}</text>
              </g>
            ))}
            {chartRows.map((row, rowIndex) => {
              let started = false;
              const path = metrics.map((item, index) => {
                const value = row.scores[item.key];
                if (value === null) {
                  started = false;
                  return '';
                }
                const command = started ? 'L' : 'M';
                started = true;
                return `${command}${xPosition(index)},${yPosition(value)}`;
              }).join(' ');
              const color = lineColors[rowIndex % lineColors.length];
              const isHovered = hovered?.id === row.id;
              return (
                <g key={row.id} className={hovered && !isHovered ? 'profile-series is-muted' : 'profile-series'}>
                  <path d={path} fill="none" stroke={color} className="profile-line" />
                  {metrics.map((item, index) => {
                    const value = row.scores[item.key];
                    if (value === null) return null;
                    return <circle key={item.key} cx={xPosition(index)} cy={yPosition(value)} r={isHovered && hovered.key === item.key ? 7 : 5} fill={color} className="profile-point" tabIndex={0} role="img" aria-label={`${row.model}, ${item.label}: ${value.toFixed(2)}`} onMouseEnter={() => setHovered({ id: row.id, key: item.key })} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered({ id: row.id, key: item.key })} onBlur={() => setHovered(null)} />;
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="performance-line-legend">
          {chartRows.map((row, index) => <button type="button" key={row.id} onClick={() => toggleModel(row.id)} onMouseEnter={() => setHovered({ id: row.id, key: metric })} onMouseLeave={() => setHovered(null)}><i style={{ background: lineColors[index % lineColors.length] }} />{row.model}<span aria-hidden="true">×</span></button>)}
          {chartRows.length === 0 && <p>Select rows from the table to draw a comparison.</p>}
        </div>
      </div>

      <div className="performance-table-card">
        <div className="performance-table-heading"><div><p>Full published results</p><h3>Every MyCulture model configuration.</h3></div><span>Click a metric header to sort. Select up to six rows to draw.</span></div>
        <div className="performance-table-scroll">
          <table className="performance-table">
            <thead>
              <tr><th scope="col"><span className="visually-hidden">Plot</span></th><th scope="col">Family</th><th scope="col">Model</th><th scope="col">Reasoning</th>{metrics.map((item) => <th scope="col" key={item.key} data-active={metric === item.key}><button type="button" onClick={() => chooseMetric(item.key)}>{item.short}<span aria-hidden="true">{metric === item.key ? (direction === 'desc' ? ' ↓' : ' ↑') : ''}</span></button></th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} data-selected={selected.includes(row.id)}>
                  <td><label className="performance-check"><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleModel(row.id)} aria-label={`${selected.includes(row.id) ? 'Remove' : 'Plot'} ${row.model}`} /><span /></label></td>
                  <td><span className="performance-family-name">{row.family}</span></td>
                  <td><strong>{row.model}{row.formatFailure ? <sup>*</sup> : ''}</strong></td>
                  <td><span className={row.reasoning ? 'reasoning-yes' : 'reasoning-no'}>{row.reasoning ? 'Yes' : '—'}</span></td>
                  {metrics.map((item) => {
                    const value = row.scores[item.key];
                    const isBest = value !== null && value === bestByMetric[item.key];
                    return <td key={item.key} data-active={metric === item.key} data-best={isBest}>{scoreLabel(value)}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="performance-empty">No model configurations match these filters.</div>}
        </div>
        <div className="performance-table-notes"><span>* Output could not be extracted in a parseable format for at least one structured setting.</span><span>Reasoning models use medium effort where available. CRQ values use the paper&apos;s reported judge configuration.</span></div>
      </div>
    </div>
  );
}
