import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { DIRECT_EMAIL } from '@/lib/contact';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Questions about MyCulture, the CSRQ evaluation toolkit, or a collaboration? Send the research team a message.',
};

const reasons = [
  ['Dataset', 'access, formats, and how the items were built.'],
  ['Evaluation toolkit', 'running the scoring harness on your own model.'],
  ['Collaboration', 'joint studies, new languages, or new cultures.'],
  ['Report an error', 'a wrong answer key or an unclear item.'],
];

export default function ContactPage() {
  return (
    <main className="contact-page">
      <nav className="site-nav" aria-label="Contact navigation">
        <a className="brand" href={`${basePath}/`}><img src={`${basePath}/assets/malaysia-flag.png`} alt="" /><span>MyCulture</span><span className="brand-mark"><span aria-hidden="true">×</span><span className="csrq-wordmark">CSRQ</span></span></a>
        <div className="nav-links"><a href={`${basePath}/`}>Paper site</a><a href={`${basePath}/benchmark/`}>Benchmark</a><a href="https://github.com/HewZK2000/MyCulture-CSRQ">GitHub</a></div>
        <a className="nav-paper nav-benchmark" href={`${basePath}/benchmark/`}>Explore benchmark <span aria-hidden="true">→</span></a>
      </nav>

      <section className="section shell contact-section">
        <div className="contact-grid">
          <div className="contact-intro">
            <p className="section-label">Contact</p>
            <h1>Get in touch.</h1>
            <p className="contact-lead">Questions about the MyCulture dataset, the CSRQ evaluation toolkit, or a possible collaboration? Send us a message and the team will reply by email.</p>
            <ul className="contact-reasons">
              {reasons.map(([topic, detail]) => <li key={topic}><span><b>{topic}:</b> {detail}</span></li>)}
            </ul>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="site-footer"><div className="shell footer-grid"><div><a className="brand footer-brand" href={`${basePath}/`}><img src={`${basePath}/assets/malaysia-flag.png`} alt="" /><span>MyCulture × <span className="csrq-wordmark">CSRQ</span></span></a><p>Universiti Malaya · Malaysia</p></div><div><strong>Benchmark</strong><p>5,463 questions · Bahasa Malaysia</p></div><div><strong>Contact</strong><a href={`mailto:${DIRECT_EMAIL}`}>{DIRECT_EMAIL}</a></div></div></footer>
    </main>
  );
}
