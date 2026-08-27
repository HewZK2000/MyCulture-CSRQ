'use client';

import { useState } from 'react';

const citation = `@misc{hew2026myculture,
  title={Between Multiple Choice and Open Response: Evaluating LLMs with Option-Free Deterministic Scoring},
  author={Hew, Zhong Ken and Yang, Sze Jue and Chan, Chee Seng},
  year={2026},
  note={Preprint}
}`;

export default function CopyCitation() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="citation-box">
      <div className="citation-header">
        <span>BibTeX</span>
        <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy citation'}</button>
      </div>
      <pre><code>{citation}</code></pre>
    </div>
  );
}
