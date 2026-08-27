import CsrqDemo from '@/components/CsrqDemo';
import CopyCitation from '@/components/CopyCitation';
import { InstrumentGapChart, JudgeSensitivityChart, OptionRemovalChart } from '@/components/InteractiveCharts';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const formats = [
  {
    name: 'MCQ',
    score: '88.1',
    eyebrow: 'Visible final options',
    detail: 'Easy to score, but answer choices can turn recall into recognition.',
    tone: 'blue',
  },
  {
    name: 'CSRQ',
    score: '56.8',
    eyebrow: 'Option-free + deterministic',
    detail: 'Construct a canonical subset, ordering, or matching—then verify it exactly.',
    tone: 'green',
  },
  {
    name: 'CRQ',
    score: '22.9',
    eyebrow: 'Open response + judge',
    detail: 'Expressive answers, but the result can depend on who evaluates them.',
    tone: 'gold',
  },
];

const formatFeatures = [
  {
    index: '01',
    name: 'Multiple choice',
    short: 'MCQ',
    claim: 'Select from visible final answers.',
    points: ['Deterministic scoring', 'Recognition and elimination cues', 'Non-trivial chance success'],
    className: 'feature-blue',
  },
  {
    index: '02',
    name: 'Constrained structured response',
    short: 'CSRQ',
    claim: 'Construct a canonical structured answer.',
    points: ['No final-answer combinations', 'Deterministic exact verification', 'Auditable answer space'],
    className: 'feature-green',
  },
  {
    index: '03',
    name: 'Constructed response',
    short: 'CRQ',
    claim: 'Generate an open natural-language response.',
    points: ['Option-free elicitation', 'Human or LLM adjudication', 'Judge-dependent scores'],
    className: 'feature-gold',
  },
];

const domains = ['Arts', 'Attire', 'Customary practices', 'Entertainment', 'Food', 'Religions'];

export default function Home() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="MyCulture and CSRQ home">
          <img src={`${basePath}/assets/malaysia-flag.png`} alt="" />
          <span>MyCulture</span>
          <span className="brand-mark"><span aria-hidden="true">×</span><span className="csrq-wordmark">CSRQ</span></span>
        </a>
        <div className="nav-links" aria-label="Page sections">
          <a href="#idea">The idea</a>
          <a href="#results">Results</a>
          <a href="#pipeline">Pipeline</a>
          <a href={`${basePath}/assets/myculture-paper.pdf`}>Paper</a>
        </div>
        <a className="nav-paper nav-benchmark" href={`${basePath}/benchmark`}>
          Explore benchmark <span aria-hidden="true">→</span>
        </a>
      </nav>

      <header className="hero shell" id="top">
        <div className="hero-copy">
          <div className="venue-pill"><span className="venue-dot" /> EMNLP 2026 · Universiti Malaya</div>
          <h1>Between Multiple Choice and Open Response</h1>
          <p className="hero-subtitle">Evaluating LLMs with <em>option-free</em>, deterministic scoring.</p>
          <p className="hero-thesis">A benchmark score measures not only the model, but also the instrument used to evaluate it.</p>
          <div className="authors" aria-label="Authors">
            <a href="#authors">Zhong Ken Hew<sup>*</sup></a>
            <a href="#authors">Sze Jue Yang<sup>*</sup></a>
            <a href="#authors">Chee Seng Chan<sup>†</sup></a>
          </div>
          <p className="author-notes"><sup>*</sup> Equal contribution · <sup>†</sup> Corresponding author</p>
          <div className="hero-actions">
            <a className="button button-primary" href={`${basePath}/benchmark`}>Explore the benchmark <span aria-hidden="true">→</span></a>
            <a className="button button-secondary" href={`${basePath}/assets/myculture-paper.pdf`}>Read the paper <span aria-hidden="true">↗</span></a>
            <span className="button button-muted" aria-disabled="true">Code · soon</span>
          </div>
          <div className="scroll-cue" aria-hidden="true"><span className="scroll-cue-line" />Scroll to explore</div>
        </div>

        <div className="instrument-panel" aria-label="GPT-5 scores across evaluation instruments">
          <div className="panel-kicker"><span>Fixed setting</span><span>GPT-5 · MyCulture · aligned knowledge</span></div>
          <div className="format-stack">
            {formats.map((format, index) => (
              <article className={`format-card ${format.tone}`} key={format.name}>
                <div className="format-index">0{index + 1}</div>
                <div>
                  <div className="format-heading"><h2 className={format.name === 'CSRQ' ? 'csrq-wordmark' : undefined}>{format.name}</h2><strong>{format.score}</strong></div>
                  <p className="format-eyebrow">{format.eyebrow}</p>
                  <p className="format-detail">{format.detail}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="instrument-axis"><span>Evaluation instrument changes</span><span aria-hidden="true">→</span></div>
        </div>
      </header>

      <section className="stats-band" aria-label="MyCulture benchmark at a glance">
        <div className="shell stats-grid">
          <div><strong data-count="5463">5,463</strong><span>questions in total</span></div>
          <div><strong data-count="1821">1,821</strong><span>per evaluation format</span></div>
          <div><strong data-count="6">6</strong><span>cultural dimensions</span></div>
          <div><strong data-count="3">3</strong><span>parallel instruments</span></div>
        </div>
      </section>

      <aside className="benchmark-gateway shell" aria-labelledby="benchmark-gateway-title">
        <div className="gateway-mark" aria-hidden="true"><span>01</span><strong>→</strong></div>
        <div className="gateway-copy">
          <p>There is more to explore</p>
          <h2 id="benchmark-gateway-title">Open the full MyCulture benchmark guide.</h2>
          <span>See all six cultural dimensions, matched MCQ–CSRQ–CRQ examples, the construction workflow, audit criteria, and planned release schema.</span>
        </div>
        <a className="gateway-action" href={`${basePath}/benchmark`}>
          <span>Explore MyCulture</span>
          <strong aria-hidden="true">→</strong>
        </a>
      </aside>

      <section className="section shell" id="idea">
        <div className="section-intro">
          <p className="section-label">The evaluation problem</p>
          <h2>What looks like model competence can partly be a property of the test.</h2>
          <p>MCQs expose candidate answers. CRQs remove those candidates, but their scores depend on an evaluator. CSRQs examine whether these useful functions can be recomposed.</p>
        </div>
        <div className="feature-grid">
          {formatFeatures.map((format) => (
            <article className={`feature-card ${format.className}`} key={format.short}>
              <div className="feature-top"><span>{format.index}</span><strong className={format.short === 'CSRQ' ? 'csrq-wordmark' : undefined}>{format.short}</strong></div>
              <h3>{format.name}</h3>
              <p>{format.claim}</p>
              <ul>{format.points.map((point) => <li key={point}>{point}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section demo-section">
        <div className="shell">
          <div className="split-heading">
            <div><p className="section-label">How <span className="csrq-wordmark">CSRQ</span> works</p><h2>Construct the answer. Verify the structure.</h2></div>
            <p>CSRQs use familiar multi-select, ordering, and matching structures as canonical answer spaces for LLM evaluation—not as new human-test item archetypes.</p>
          </div>
          <CsrqDemo />
          <div className="equation-line" aria-label="Strict scoring equation">
            <span>Strict score</span><code>𝟙 [ canonicalize(prediction) = canonicalize(answer) ]</code><span>No judge required</span>
          </div>
        </div>
      </section>

      <section className="section culture-section" id="benchmark">
        <div className="shell culture-grid">
          <div className="culture-copy">
            <p className="section-label">The cultural testbed</p>
            <h2>Meet <em>MyCulture</em>.</h2>
            <p className="culture-lead">A Malaysia-centered benchmark in Bahasa Malaysia, built to hold cultural knowledge constant while changing how that knowledge is elicited and scored.</p>
            <div className="domain-list" aria-label="Cultural dimensions">
              {domains.map((domain, index) => <span key={domain}><b>0{index + 1}</b>{domain}</span>)}
            </div>
            <a className="text-link" href={`${basePath}/benchmark`}>Open the full benchmark guide <span aria-hidden="true">→</span></a>
          </div>
          <aside className="passport-card" aria-label="MyCulture benchmark passport">
            <div className="passport-header"><img src={`${basePath}/assets/malaysia-flag.png`} alt="Malaysian flag" /><span>Benchmark passport</span></div>
            <dl>
              <div><dt>Language</dt><dd>Bahasa Malaysia</dd></div>
              <div><dt>Region</dt><dd>Malaysia</dd></div>
              <div><dt>Formats</dt><dd>MCQ · CSRQ · CRQ</dd></div>
              <div><dt>Source base</dt><dd>JKKN + academic materials</dd></div>
              <div><dt>Human audit</dt><dd>5% qualified-resident sample</dd></div>
            </dl>
            <p>Each underlying knowledge item appears in parallel evaluation formats.</p>
          </aside>
        </div>
      </section>

      <section className="section results-section" id="results">
        <div className="shell">
          <div className="section-intro results-intro">
            <p className="section-label">Empirical validation</p>
            <h2>The same knowledge produces different measured scores.</h2>
            <p>Across benchmark families and model scales, removing final-answer combinations changes performance—even when scoring remains deterministic.</p>
          </div>

          <figure className="chart-card chart-wide">
            <div className="chart-copy"><span className="finding-number">−26.66</span><div><h3>Average option-removal gap</h3><p>Across MalayMMLU and CS-EN, models consistently score lower under CSRQ evaluation.</p></div></div>
            <OptionRemovalChart fallbackHref={`${basePath}/assets/benchmark-options.png`} />
            <figcaption>Option-removal sensitivity is observed across model families, including models above 100B parameters.</figcaption>
          </figure>

          <div className="result-grid">
            <figure className="chart-card">
              <div className="mini-kicker">MyCulture</div>
              <h3>Instrument gaps remain substantial.</h3>
              <InstrumentGapChart fallbackHref={`${basePath}/assets/instrument-gaps.png`} />
              <figcaption>MCQ–CSRQ captures option-removal sensitivity; CSRQ–CRQ captures the shift to judge-based scoring.</figcaption>
            </figure>
            <article className="result-statement">
              <span className="quote-mark">“</span>
              <blockquote>Benchmark scores are model–instrument outcomes, not properties of the model alone.</blockquote>
              <div className="rank-note"><strong>ρ = 0.95</strong><span>MCQ and strict CSRQ still produce highly consistent model rankings.</span></div>
            </article>
          </div>

          <figure className="judge-card">
            <div className="judge-copy">
              <p className="section-label">Judge-dependent scoring</p>
              <h3>Change the judge. Change the score.</h3>
              <p>The same CRQ outputs were evaluated under the same rubric by different LLM judges. Pairwise ranking agreement ranged from 0.40 to 1.00.</p>
              <div className="judge-stat"><strong>12.8</strong><span>percentage-point standard deviation for GPT-5 across judges</span></div>
            </div>
            <JudgeSensitivityChart fallbackHref={`${basePath}/assets/judge-sensitivity.png`} />
          </figure>
        </div>
      </section>

      <section className="section pipeline-section" id="pipeline">
        <div className="shell">
          <div className="split-heading">
            <div><p className="section-label">Benchmark conversion</p><h2>From knowledge point to auditable item.</h2></div>
            <p>The documented workflow converts suitable MCQ or CRQ items into CSRQs through knowledge acquisition, structured generation, and independent verification.</p>
          </div>
          <figure className="pipeline-figure">
            <img src={`${basePath}/assets/conversion-pipeline.png`} alt="CSRQ benchmark conversion workflow from knowledge acquisition to question generation and verification" loading="lazy" />
            <figcaption>Only statements that pass format and source-supported verification are retained.</figcaption>
          </figure>
          <ol className="pipeline-steps">
            <li><span>01</span><div><strong>Acquire</strong><p>Extract the factual, relational, or procedural knowledge point.</p></div></li>
            <li><span>02</span><div><strong>Select</strong><p>Choose multi-select, ordering, or matching for the target knowledge.</p></div></li>
            <li><span>03</span><div><strong>Generate</strong><p>Construct the question, statements, and canonical answer.</p></div></li>
            <li><span>04</span><div><strong>Verify</strong><p>Check structure, answerability, and source-supported evidence.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section guidance-section">
        <div className="shell">
          <div className="section-intro compact"><p className="section-label">Practical selection</p><h2>Choose the instrument for the claim you need to support.</h2></div>
          <div className="guidance-grid">
            <article><span className="guidance-dot blue-dot" /><h3>Use MCQ</h3><p>For broad, low-cost screening and reproducible leaderboard comparison.</p></article>
            <article className="recommended"><span className="recommend-pill">Matched audit</span><span className="guidance-dot green-dot" /><h3>Use <span className="csrq-wordmark">CSRQ</span></h3><p>When answer-option scaffolding may distort absolute scores and judge-free scoring matters.</p></article>
            <article><span className="guidance-dot gold-dot" /><h3>Use CRQ</h3><p>When expressive responses are essential and reliable human or multi-judge adjudication is available.</p></article>
          </div>
        </div>
      </section>

      <section className="section limitations-section">
        <div className="shell limitations-grid">
          <div><p className="section-label">Responsible interpretation</p><h2>What <span className="csrq-wordmark">CSRQ</span> does—and does not—claim.</h2></div>
          <div className="limitations-list">
            <p><span>01</span>CSRQs do not prove genuine understanding or higher-order comprehension.</p>
            <p><span>02</span>They work best when an answer can be decomposed into valid response units.</p>
            <p><span>03</span>The answer space remains finite and does not fully replicate open generation.</p>
            <p><span>04</span>Construction adds costs for generation, distractor design, and verification.</p>
          </div>
        </div>
      </section>

      <section className="section resources-section" id="resources">
        <div className="shell resource-grid">
          <div className="resource-copy">
            <p className="section-label">Resources</p>
            <h2>Read, reproduce, and extend the work.</h2>
            <p>The paper is available now. Dataset files, prompts, filtering logs, and conversion code will be connected here when released.</p>
            <div className="resource-links">
              <a href={`${basePath}/assets/myculture-paper.pdf`}><span>PDF</span><b>Paper</b><i>Available ↗</i></a>
              <div aria-disabled="true"><span>DATA</span><b>MyCulture</b><i>Coming soon</i></div>
              <div aria-disabled="true"><span>CODE</span><b>Evaluation toolkit</b><i>Coming soon</i></div>
            </div>
          </div>
          <CopyCitation />
        </div>
      </section>

      <footer className="site-footer" id="authors">
        <div className="shell footer-grid">
          <div><a className="brand footer-brand" href="#top"><img src={`${basePath}/assets/malaysia-flag.png`} alt="" /><span>MyCulture × <span className="csrq-wordmark">CSRQ</span></span></a><p>Universiti Malaya · Malaysia</p></div>
          <div><strong>Authors</strong><p>Zhong Ken Hew · Sze Jue Yang · Chee Seng Chan</p></div>
          <div><strong>Contact</strong><a href="mailto:cs.chan@um.edu.my">cs.chan@um.edu.my</a></div>
        </div>
        <div className="shell footer-bottom"><span>© 2026 MyCulture</span><span>Built for clear, auditable evaluation.</span></div>
      </footer>
    </main>
  );
}
