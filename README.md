# MyCulture: Evaluating LLMs with Option-Free Deterministic Scoring

Official repository for the paper **"Between Multiple Choice and Open Response: Evaluating LLMs with Option-Free Deterministic Scoring."**

**Zhong Ken Hew\***, **Sze Jue Yang\***, and **Chee Seng Chan**  
Universiti Malaya, Malaysia  
\* Equal contribution

Paper (coming soon) · [Dataset](Dataset/) · Converter (coming soon) · [Evaluation](Evaluation/)

## Overview

LLM benchmark scores depend not only on model capability, but also on how questions are presented and scored:

- **Multiple-choice questions (MCQs)** are easy to score objectively, but visible answer options can provide hints through recognition, elimination, or chance.
- **Constructed-response questions (CRQs)** remove answer options, but typically require human or LLM judges, making scores sensitive to the selected judge and rubric interpretation.
- **Constrained Structured Response Questions (CSRQs)** remove final-answer options while retaining deterministic, exact-match scoring.

CSRQs ask a model to construct a canonical answer using one of three structured response types:

| CSRQ type | Required output | Example |
|---|---|---|
| Multi-select | Select every statement that satisfies the question | `{B, C}` |
| Ordering | Arrange the provided statements in the correct sequence | `(D, A, C, B)` |
| Matching | Construct the correct pairwise associations | `{A-3, B-1, C-2}` |

This provides an auditable middle ground between selecting a visible answer in an MCQ and producing a freely worded answer in a CRQ.

## MyCulture

**MyCulture** is a Malaysia-centered cultural benchmark written in Bahasa Malaysia. To our knowledge, it is the first benchmark of this kind. It contains parallel MCQ, CSRQ, and CRQ versions that preserve the underlying cultural knowledge while changing the evaluation instrument.

| Property | Description |
|---|---|
| Language | Bahasa Malaysia |
| Focus | Malaysian cultural knowledge |
| Cultural dimensions | Arts, attire, customary practices, entertainment, food, and religions |
| Total questions | 5,463 |
| Questions per format | 1,821 MCQs, 1,821 CSRQs, and 1,821 CRQs |
| CSRQ structures | Multi-select, ordering, and matching |
| Source material | Reliable Malaysian cultural sources and academic materials |
| Quality control | Automated format and evidence checks, model-assisted ambiguity screening, and human auditing of a 5% subsample |

## Main Results on MyCulture

The table below reports accuracy (%) from the paper. **Loose** scoring accepts partially correct responses according to the evaluation protocol, while **strict** scoring requires the complete expected answer. See the paper for the full model list, prompts, judging setup, and per-structure results.

| Model | MCQ | CSRQ (loose) | CSRQ (strict) | CRQ (loose) | CRQ (strict) |
|---|---:|---:|---:|---:|---:|
| Random baseline | 25.53 | 40.33 | 4.28 | - | - |
| GPT-5† | 88.14 | **78.10** | **56.78** | 68.41 | 22.90 |
| GPT-4o | **90.28** | 78.00 | 56.01 | **68.61** | 21.14 |
| Gemini-2.5-Pro† | 85.56 | 77.78 | 55.68 | 66.87 | 20.26 |
| GLM-4.6† | 84.46 | 76.37 | 53.38 | 63.20 | 17.74 |
| Qwen3-235B-Thinking† | 61.01 | 62.62 | 42.12 | 50.13 | 18.51 |
| Qwen3-235B-Instruct | 80.12 | 73.55 | 51.29 | 62.93 | 18.34 |
| SeaLLMs-v3-7B | 29.98 | 52.96 | 26.30 | 47.62 | 7.86 |
| Qwen-SEA-LION-v4-32B-IT | 83.25 | 76.16 | 53.54 | 62.55 | 18.23 |

† Reasoning model; medium reasoning effort is used where available.

The results show that measured performance changes substantially even when the underlying knowledge is held constant:

- MCQ scores are generally higher than strict CSRQ scores, demonstrating sensitivity to the removal of final-answer options.
- Strict CRQ scores vary from deterministic CSRQ scores and are sensitive to the LLM judge used for grading.
- MCQ and strict CSRQ evaluations retain highly consistent model rankings (Spearman's ρ = 0.95; Kendall's τ = 0.86), despite their different absolute scores.

These findings do not imply that CSRQs prove genuine understanding or should replace existing benchmarks. Instead, CSRQs provide a matched, deterministic audit for studying how much a benchmark score depends on its evaluation format.

## Repository layout

- `Dataset/` contains the aligned 1,821-item MCQ, CSRQ, and CRQ benchmark files.
- `CSRQ_Converter/` contains the six-stage question-generation and formatting pipeline, prompt templates, source adapters, tests, and its [usage guide](CSRQ_Converter/README.md). The pipeline generates new structured questions from source questions; it is not a direct reformat of the published benchmark files.
- `Evaluation/` contains the scoring harness and its [usage guide](Evaluation/README.md).

Start with `python -m CSRQ_Converter --help` from this repository root, or follow the converter guide for installation and a dry run. Live generation requires provider API access; offline tests do not.

Repository Status
---
This repository is being prepared for public release.
- ☑ MyCulture dataset
- [ ] CSRQ conversion code and prompts
- ☑ Evaluation and deterministic scoring scripts

The dataset and code will be released soon. Please watch this repository for updates.

## Citation

If you find this work useful, please cite the paper. The final BibTeX entry will be added when publication metadata is available.

```bibtex
@inproceedings{hew2025myculture,
  title={Between Multiple Choice and Open Response:
Evaluating LLMs with Option-Free Deterministic Scoring},
  author={Hew, Zhong Ken and Yang, Sze Jue and Chan, Chee Seng},
  booktitle={Proceedings of the 2026 Conference on Empirical Methods in Natural Language Processing},
  year={2026}
}
```

## Contact

For questions about this work, please contact **Chee Seng Chan** at `cs.chan@um.edu.my`.
