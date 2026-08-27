'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const examples = [
  {
    id: 'multi-select',
    short: 'MS',
    name: 'Multi-select',
    instruction: 'Return every statement that satisfies the question.',
    prompt: 'Apakah kenyataan yang betul mengenai permainan Lansaran?',
    primitives: ['A · Dibina secara individu', 'B · Berukuran 8–30 kaki persegi', 'C · Menggunakan kayu Selangan Batu', 'D · Hanya untuk kanak-kanak'],
    answer: '{ B, C }',
  },
  {
    id: 'ordering',
    short: 'O',
    name: 'Ordering',
    instruction: 'Construct the correct sequence over the supplied statements.',
    prompt: 'Susun peringkat mengikut urutan yang betul.',
    primitives: ['1 · Penyediaan bahan', '2 · Pembinaan rangka', '3 · Mengikat dengan rotan', '4 · Pemeriksaan akhir'],
    answer: '( 1, 2, 3, 4 )',
  },
  {
    id: 'matching',
    short: 'M',
    name: 'Matching',
    instruction: 'Construct the correct pairwise associations.',
    prompt: 'Padankan unsur budaya dengan keterangannya.',
    primitives: ['A · Seni persembahan', 'B · Pakaian tradisional', '1 · Busana komuniti', '2 · Amalan pentas'],
    answer: '{ A→2, B→1 }',
  },
];

export default function CsrqDemo() {
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const example = examples[active];

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from(body.current, {
      y: 14,
      autoAlpha: 0,
      duration: 0.42,
      ease: 'power2.out',
      clearProps: 'transform,visibility',
    });
  }, { dependencies: [active], scope: body, revertOnUpdate: true });

  function switchExample(index: number) {
    setActive(index);
    setRevealed(false);
  }

  return (
    <div className="demo-card">
      <div className="demo-tabs" role="tablist" aria-label="CSRQ response variants">
        {examples.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active === index}
            onClick={() => switchExample(index)}
          >
            <span>{item.short}</span>{item.name}
          </button>
        ))}
      </div>
      <div className="demo-body" role="tabpanel" ref={body}>
        <div className="demo-question">
          <p className="demo-rule">{example.instruction}</p>
          <h3 lang="ms">{example.prompt}</h3>
          <div className="primitive-grid">
            {example.primitives.map((primitive) => <div key={primitive}>{primitive}</div>)}
          </div>
        </div>
        <div className="canonical-panel">
          <span className="canonical-label">Canonical response</span>
          <div className={`answer-field ${revealed ? 'revealed' : ''}`} aria-live="polite">
            {revealed ? example.answer : '••••••••••'}
          </div>
          <button className="reveal-button" type="button" onClick={() => setRevealed((value) => !value)}>
            {revealed ? 'Hide answer' : 'Reveal exact answer'}
          </button>
          <p>Canonicalize → compare with key → exact score</p>
        </div>
      </div>
    </div>
  );
}
