# MyCulture Evaluation Harness

This folder contains the evaluation code and prompts used for the three
MyCulture dataset formats:

- **MCQ**: questions with answer options; exact A/B/C/D accuracy.
- **CSRQ** (`open-mcq`): questions without the combined answer options; exact matching
  plus type-specific partial-credit metrics.
- **CRQ** (`open-ended`): free-text answers evaluated for reference-point coverage by
  an LLM judge.

The code was extracted from `src/` and cleaned for public release. It contains
no API keys, local cluster paths, generated outputs, or notebook-only analysis.

## Evaluation set

The default data files are the aligned 1,821-question datasets in:

```text
../Dataset/MCQ.json
../Dataset/CSRQ.json
../Dataset/CRQ.json
```

All three files contain the same 1,821 unique IDs in the same order. A custom
dataset can be selected with `--data PATH`. The loader checks that its answer
fields match the selected mode before making model requests. The provided files
contain Malay questions only; `--language en` or `--language zh` requires a
translated dataset and an appropriate prompt passed with `--prompt PATH`.

## Included prompts

All prompts are plain text under `prompts/` so the exact evaluation setup is
visible and versionable:

| File | Purpose |
|---|---|
| `mcq_ms.txt` | Malay MCQ generation prompt |
| `open_mcq_ms.txt` | Malay Open-MCQ prompt with Malaysian-local context |
| `open_ended_ms.txt` | Malay Open-Ended generation prompt |
| `open_ended_judge.txt` | Full LLM-judge instruction and output schema |

The judge prompt is the system-style evaluation instruction previously embedded
inside `src/evaluators.py`. As in the original implementation, the rendered
instruction is submitted as one message to the judge model.

## Installation

Python 3.10 or newer is recommended.

```bash
cd Evaluation
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set only the keys needed by the selected providers:

```env
OPENAI_API_KEY=
GEMINI_API_KEY=
ZHIPU_API_KEY=
API_KEY=none
```

`API_KEY` is used for an OpenAI-compatible local endpoint and can normally be
set to `none` when the server does not authenticate.

## Running evaluations

### MCQ

```bash
python main.py \
  --mode mcq \
  --provider gemini \
  --model gemini-2.5-flash \
  --reasoning \
  --workers 20
```

### CSRQ

```bash
python main.py \
  --mode csrq \
  --provider gemini \
  --model gemini-2.5-flash \
  --reasoning \
  --workers 20
```

### CRQ with an OpenAI judge

```bash
python main.py \
  --mode crq \
  --provider gemini \
  --model gemini-2.5-flash \
  --reasoning \
  --judge-provider openai \
  --judge-model gpt-5-nano \
  --workers 20 \
  --judge-workers 50
```

### OpenAI-compatible local server

```bash
python main.py \
  --mode csrq \
  --provider openai-compatible \
  --model your-served-model-name \
  --base-url http://localhost:8000/v1 \
  --workers 20
```

Use `--limit 10` for a smoke test. Use `--output PATH` to override the default
`results/<model>/<mode>.json` path. Run `python main.py --help` for every option.
The older `open-mcq` and `open-ended` mode names remain accepted as aliases.

## Judging existing Open-Ended responses

An existing result file containing `model_resp.resp` can be judged without
rerunning inference:

```bash
python judge_results.py \
  --input path/to/open_ended_result.json \
  --output results/judged_open_ended.json \
  --provider openai \
  --judge-model gpt-5-nano
```

The command accepts both the current flat `records` array and the nested
`records.records` structure found in some historical outputs.

## Metrics

### MCQ

The final value inside `\\boxed{}` is compared with the accepted reference
options. Two MCQ records have more than one accepted option.

```text
accuracy = exact matches / total questions
```

### Open-MCQ

- `Gabungan`: order-insensitive exact multiset match; Jaccard partial credit.
- `Padanan`: order-insensitive exact pair match; pair-level Jaccard credit.
- `Berurutan`: order-sensitive exact sequence match; sequence similarity credit.

### Open-Ended

The judge assigns every numbered reference point to `exist_index` or
`non_exist_index`. Responses with missing, duplicate, or out of range indices
receive zero coverage. Per-question coverage is:

```text
coverage = matched reference points / total reference points
```

- **Loose accuracy**: mean reference-point coverage across all questions.
- **Strict accuracy**: percentage of questions with 100% coverage.

For the historical Gemini 2.5 Flash result, strict accuracy is
`391 / 1,821 = 21.47%`.

## Tests

```bash
python -m unittest discover -s tests -v
```

The repository regression test recomputes the reported Gemini MCQ and Open-MCQ
scores from their stored model responses. It is skipped when this folder is
distributed without the surrounding repository outputs.

## Security before publication

This folder contains no embedded credentials. Legacy scripts elsewhere in the
private repository contained hard-coded API keys. Those keys must be revoked or
rotated, and the repository history must be cleaned before publishing the full
repository. Publishing only this `eval/` folder avoids copying those files but
does not revoke the credentials.

## License

MIT. See `LICENSE`.
