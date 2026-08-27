import type { Metadata } from 'next';
import MyCulturePerformance from '@/components/MyCulturePerformance';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: 'MyCulture Benchmark — Dataset, Formats, and Construction',
  description: 'Explore MyCulture, a Malaysia-centered cultural benchmark in Bahasa Malaysia with parallel MCQ, CSRQ, and CRQ formats.',
};

const domains = [
  ['Arts', 'Seni', 'Creative traditions, visual practices, and cultural expression.'],
  ['Attire', 'Pakaian', 'Traditional garments, materials, meanings, and community use.'],
  ['Customary practices', 'Adat', 'Social practices, ceremonies, and community traditions.'],
  ['Entertainment', 'Hiburan', 'Games, performances, and shared recreational practices.'],
  ['Food', 'Makanan', 'Dishes, preparation, ingredients, and food traditions.'],
  ['Religions', 'Agama', 'Religious traditions and culturally situated practices.'],
];

export default function BenchmarkPage() {
  return (
    <main className="benchmark-page">
      <nav className="site-nav" aria-label="Benchmark navigation">
        <a className="brand" href={`${basePath}/`}><img src={`${basePath}/assets/malaysia-flag.png`} alt="" /><span>MyCulture</span><span className="brand-mark"><span aria-hidden="true">×</span><span className="csrq-wordmark">CSRQ</span></span></a>
        <div className="nav-links"><a href="#dimensions">Dimensions</a><a href="#formats">Formats</a><a href="#performance">Performance</a><a href="#construction">Construction</a><a href="#use">Use</a></div>
        <a className="nav-paper" href={`${basePath}/`}>Paper site <span aria-hidden="true">↗</span></a>
      </nav>

      <header className="benchmark-hero">
        <div className="shell benchmark-hero-grid">
          <div>
            <div className="venue-pill"><span className="venue-dot" /> Malaysia · Bahasa Malaysia</div>
            <p className="benchmark-overline">Benchmark profile</p>
            <h1><em>MyCulture</em> makes the evaluation instrument visible.</h1>
            <p>Each underlying Malaysian cultural knowledge item is instantiated in parallel MCQ, CSRQ, and CRQ formats—holding the knowledge target constant while changing answer exposure and scoring.</p>
            <div className="hero-actions"><span className="button button-primary" aria-disabled="true">Dataset · coming soon</span><a className="button button-secondary" href={`${basePath}/assets/myculture-paper.pdf`}>Read paper ↗</a></div>
          </div>
          <div className="benchmark-orbit" aria-label="Three parallel benchmark formats">
            <div className="orbit-center"><strong data-count="1821">1,821</strong><span>knowledge targets</span></div>
            <div className="orbit-item orbit-mcq"><b>MCQ</b><span>Visible options</span></div>
            <div className="orbit-item orbit-csrq"><b className="csrq-wordmark">CSRQ</b><span>Canonical structure</span></div>
            <div className="orbit-item orbit-crq"><b>CRQ</b><span>Open response</span></div>
          </div>
        </div>
      </header>

      <section className="benchmark-facts">
        <div className="shell benchmark-fact-grid">
          <div><span>Questions</span><strong data-count="5463">5,463</strong></div>
          <div><span>Parallel formats</span><strong data-count="3">3</strong></div>
          <div><span>Cultural dimensions</span><strong data-count="6">6</strong></div>
          <div><span>Human-audited sample</span><strong data-count="5" data-suffix="%">5%</strong></div>
          <div><span>Qualified auditors</span><strong data-count="5">5</strong></div>
        </div>
      </section>

      <section className="section shell" id="dimensions">
        <div className="split-heading"><div><p className="section-label">Coverage</p><h2>Six windows into Malaysian cultural knowledge.</h2></div><p>MyCulture is a controlled testbed, not a claim to cover every Malaysian identity, community, or tradition.</p></div>
        <div className="dimension-grid">
          {domains.map(([name, ms, description], index) => (
            <article key={name}><span>0{index + 1}</span><div><p lang="ms">{ms}</p><h3>{name}</h3><small>{description}</small></div></article>
          ))}
        </div>
      </section>

      <section className="section format-example-section" id="formats">
        <div className="shell">
          <div className="section-intro compact"><p className="section-label">Parallel format example</p><h2>Same knowledge. Three elicitation and scoring procedures.</h2><p>The example below assesses knowledge about the traditional Lansaran game of the Murut community.</p></div>
          <div className="example-grid">
            <article className="example-card example-blue">
              <div className="example-label"><span>01</span><strong>MCQ</strong></div>
              <div className="example-card-body">
                <div className="example-question-block"><span className="example-kicker">Question</span><h3 lang="ms">Apakah kenyataan yang betul mengenai permainan Lansaran dan budaya suku kaum Murut?</h3></div>
                <div className="example-detail example-detail-columns" lang="ms">
                  <div><span className="example-kicker">Statements</span><ol className="statement-list" type="I"><li>Lansaran dibina secara individu tanpa melibatkan masyarakat.</li><li>Permainan Lansaran memerlukan ukuran kawasan antara 8 hingga 30 kaki persegi.</li><li>Kayu “Selangan Batu” digunakan dalam pembinaan lantai Lansaran kerana ketahanannya.</li><li>Lansaran hanya untuk kanak-kanak dan tidak melibatkan orang dewasa.</li></ol></div>
                  <div><span className="example-kicker">Options</span><ol className="option-list" type="A"><li>II, III</li><li>I, IV</li><li>I, II, IV</li><li>II, I</li></ol></div>
                </div>
              </div>
              <div className="example-card-footer"><div className="example-answer">Selected answer <code>A</code></div><p>Candidate final-answer combinations are visible.</p></div>
            </article>

            <article className="example-card example-green">
              <div className="example-label"><span>02</span><strong className="csrq-wordmark">CSRQ</strong></div>
              <div className="example-card-body">
                <div className="example-question-block"><span className="example-kicker">Question</span><h3 lang="ms">Apakah kenyataan yang betul mengenai permainan Lansaran dan budaya suku kaum Murut?</h3></div>
                <div className="example-detail" lang="ms"><span className="example-kicker">Response primitives</span><ol className="choice-list" type="A"><li>Lansaran dibina secara individu tanpa melibatkan masyarakat.</li><li>Permainan Lansaran memerlukan ukuran kawasan antara 8 hingga 30 kaki persegi.</li><li>Kayu “Selangan Batu” digunakan dalam pembinaan lantai Lansaran kerana ketahanannya.</li><li>Lansaran hanya untuk kanak-kanak dan tidak melibatkan orang dewasa.</li></ol></div>
              </div>
              <div className="example-card-footer"><div className="example-answer">Constructed answer <code>B, C</code></div><p>No candidate subsets; exact canonical verification.</p></div>
            </article>

            <article className="example-card example-gold">
              <div className="example-label"><span>03</span><strong>CRQ</strong></div>
              <div className="example-card-body">
                <div className="example-question-block"><span className="example-kicker">Question</span><h3 lang="ms">Huraikan ciri-ciri fizikal, cara pembinaan dan peranan komuniti dalam permainan tradisional Lansaran suku kaum Murut berdasarkan amalan tradisi yang dinyatakan.</h3></div>
                <div className="example-detail rubric-preview" lang="ms"><span className="example-kicker">Rubric · six required points</span><ol className="rubric-list"><li>Tempat permainan Lansaran berukuran antara lapan (8) hingga 30 kaki persegi.</li><li>Lansaran dapat menampung lebih kurang 30 orang pemain.</li><li>Lansaran dibina secara bergotong-royong di ruang khas rumah panjang suku kaum Murut.</li><li>Beberapa batang kayu bulat yang keras dan liat sebesar lengan orang dewasa dikenali sebagai kayu “Selangan Batu”.</li><li>Kayu “Selangan Batu” diikat dengan rotan saga bagi menampung lantai Lansaran.</li><li>Lantai Lansaran dibina sekaki ke bawah daripada paras lantai rumah secara tergantung.</li></ol></div>
              </div>
              <div className="example-card-footer"><div className="example-answer">Generated answer <code>Text</code></div><p>Open response evaluated against all six rubric points by a judge.</p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="section performance-section" id="performance">
        <div className="shell">
          <div className="split-heading performance-intro"><div><p className="section-label">Full model performance</p><h2>Explore every score. Compare every instrument.</h2></div><p>The complete MyCulture result table becomes an analytical surface: filter model families, rank any metric, and draw direct score profiles across MCQ, CSRQ, and CRQ.</p></div>
          <MyCulturePerformance />
        </div>
      </section>

      <section className="section shell" id="construction">
        <div className="split-heading"><div><p className="section-label">Construction and validation</p><h2>Grounded in sources. Filtered by evidence. Audited by people.</h2></div><p>Reliable Malaysian cultural materials are transformed into matched evaluation items through automated checks and a qualified-resident audit loop.</p></div>
        <div className="construction-grid">
          <ol className="construction-steps">
            <li><span>01</span><div><strong>Curate sources</strong><p>JKKN materials and relevant academic publications.</p></div></li>
            <li><span>02</span><div><strong>Generate matched items</strong><p>Draft MCQ, CSRQ, and CRQ versions from shared evidence.</p></div></li>
            <li><span>03</span><div><strong>Filter automatically</strong><p>Check format compliance, answerability, and evidence consistency.</p></div></li>
            <li><span>04</span><div><strong>Surface ambiguity</strong><p>Strong models flag potentially ill-posed items for review.</p></div></li>
            <li><span>05</span><div><strong>Audit and iterate</strong><p>Five qualified Malaysian residents audit a 5% subsample.</p></div></li>
          </ol>
          <aside className="audit-card"><div className="audit-seal">5%</div><h3>Human audit criteria</h3><ul><li>Logical and clearly phrased</li><li>Culturally relevant</li><li>Answerable from supplied evidence</li><li>Compliant with the target format</li></ul><p>Recurring failure modes trigger prompt and filtering-rule refinement.</p></aside>
        </div>
      </section>

      <section className="section use-section" id="use">
        <div className="shell">
          <div className="section-intro compact"><p className="section-label">Intended use</p><h2>Use MyCulture to study evaluation sensitivity—not to reduce culture to a single score.</h2></div>
          <div className="use-grid"><article><span>Recommended</span><ul><li>Matched MCQ–CSRQ audit</li><li>Judge-sensitivity analysis</li><li>Format-following diagnostics</li><li>Malaysia-centered cultural evaluation</li></ul></article><article><span>Use with care</span><ul><li>Claims of complete cultural coverage</li><li>Claims of genuine understanding</li><li>Universal ranking conclusions</li><li>Unreviewed high-stakes deployment</li></ul></article></div>
          <div className="benchmark-cta"><div><h3>Ready to examine the full methodology?</h3><p>Read the paper now; return here for the dataset and evaluation toolkit when released.</p></div><a className="button button-primary" href={`${basePath}/assets/myculture-paper.pdf`}>Open the paper ↗</a></div>
        </div>
      </section>

      <footer className="site-footer"><div className="shell footer-grid"><div><a className="brand footer-brand" href={`${basePath}/`}><img src={`${basePath}/assets/malaysia-flag.png`} alt="" /><span>MyCulture × <span className="csrq-wordmark">CSRQ</span></span></a><p>Universiti Malaya · Malaysia</p></div><div><strong>Benchmark</strong><p>5,463 questions · Bahasa Malaysia</p></div><div><strong>Contact</strong><a href="mailto:cs.chan@um.edu.my">cs.chan@um.edu.my</a></div></div></footer>
    </main>
  );
}
