from __future__ import annotations

import argparse
import asyncio
import os
import random
import re
from pathlib import Path

from dotenv import load_dotenv
from tqdm.asyncio import tqdm_asyncio

from evaluators import Evaluator
from llm_models import LLM
from utils import infer_provider, load_json, load_text, parse_boxed, save_json


ROOT = Path(__file__).resolve().parent
DATA_ROOT = ROOT.parent / "Dataset"
PROMPT_ROOT = ROOT / "prompts"

MODE_CONFIG = {
    "mcq": {
        "data": DATA_ROOT / "MCQ.json",
        "prompt": PROMPT_ROOT / "mcq_ms.txt",
    },
    "csrq": {
        "data": DATA_ROOT / "CSRQ.json",
        "prompt": PROMPT_ROOT / "open_mcq_ms.txt",
    },
    "crq": {
        "data": DATA_ROOT / "CRQ.json",
        "prompt": PROMPT_ROOT / "open_ended_ms.txt",
    },
}
MODE_ALIASES = {"open-mcq": "csrq", "open-ended": "crq"}

QUESTION_TYPE_TRANSLATIONS = {
    "en": {"Gabungan": "Combination", "Padanan": "Matching", "Berurutan": "Ordering"},
    "zh": {"Gabungan": "组合型", "Padanan": "匹配型", "Berurutan": "排序型"},
}

PROVIDER_KEY_ENV = {
    "openai": "OPENAI_API_KEY",
    "gemini": "GEMINI_API_KEY",
    "zhipu": "ZHIPU_API_KEY",
    "deepseek": "DEEPSEEK_API_KEY",
    "openai-compatible": "API_KEY",
}


def render_question_prompt(record: dict, template: str, language: str) -> str:
    question = record["question"]
    question_type = record.get("question_type", "")
    if language in QUESTION_TYPE_TRANSLATIONS:
        translated_field = f"translated_{language}"
        if translated_field not in record:
            raise KeyError(
                f"Record {record.get('id')} has no {translated_field!r} field"
            )
        question = record[translated_field]
        question_type = QUESTION_TYPE_TRANSLATIONS[language].get(
            question_type,
            question_type,
        )
    return template.replace("{soalan}", question).replace(
        "{jenissoalan}",
        question_type,
    )


async def infer_one(
    record: dict,
    template: str,
    language: str,
    client: LLM,
    semaphore: asyncio.Semaphore,
) -> str:
    prompt = render_question_prompt(record, template, language)
    async with semaphore:
        for attempt in range(3):
            try:
                response = await asyncio.wait_for(client.generate(prompt), timeout=120)
                return response or "error-empty-response"
            except Exception as exc:
                if attempt == 2:
                    return f"error-request: {exc}"
                await asyncio.sleep(2 ** (attempt + 1) + random.uniform(0, 1))
    return "error-failed-after-retries"


def resolve_api_key(provider: str, explicit_env: str | None) -> str:
    env_name = explicit_env or PROVIDER_KEY_ENV[provider]
    key = os.getenv(env_name)
    if provider == "openai-compatible" and not key:
        return "none"
    if not key:
        raise SystemExit(f"Missing API key. Set {env_name} or use --api-key-env.")
    return key


def safe_model_name(model: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", model)


def validate_records(records: object, mode: str, language: str, path: Path) -> list[dict]:
    if not isinstance(records, list):
        raise SystemExit(f"Expected a JSON array in {path}")

    for index, record in enumerate(records):
        label = f"{path} record {index + 1}"
        if not isinstance(record, dict) or not isinstance(record.get("question"), str):
            raise SystemExit(f"{label}: expected an object with a question string")

        if language != "ms" and not isinstance(
            record.get(f"translated_{language}"), str
        ):
            raise SystemExit(
                f"{label}: --language {language} requires a translated_{language} string"
            )

        if mode == "crq":
            points = record.get("answer_point")
            if not isinstance(points, list) or not points or not all(
                isinstance(point, str) for point in points
            ):
                raise SystemExit(f"{label}: CRQ requires a nonempty answer_point list")
            continue

        question_type = record.get("question_type")
        if question_type not in {"Gabungan", "Padanan", "Berurutan"}:
            raise SystemExit(f"{label}: invalid or missing question_type")
        answer = record.get("answer")
        if not isinstance(answer, list) or not answer:
            raise SystemExit(f"{label}: {mode.upper()} requires a nonempty answer list")
        if mode == "csrq" and question_type == "Padanan":
            valid = all(
                isinstance(pair, list)
                and len(pair) == 2
                and all(isinstance(value, str) for value in pair)
                for pair in answer
            )
        else:
            valid = all(isinstance(value, str) for value in answer)
        if not valid:
            raise SystemExit(f"{label}: answer shape does not match {mode.upper()}")

    return records


async def run(args: argparse.Namespace) -> Path:
    load_dotenv(ROOT / ".env")
    mode = MODE_ALIASES.get(args.mode, args.mode)
    config = MODE_CONFIG[mode]
    data_path = Path(args.data) if args.data else config["data"]
    prompt_path = Path(args.prompt) if args.prompt else config["prompt"]
    if mode == "csrq" and args.language in {"en", "zh"} and not args.prompt:
        prompt_path = PROMPT_ROOT / f"open_mcq_{args.language}.txt"

    if not prompt_path.is_file():
        raise SystemExit(f"Prompt file not found: {prompt_path}. Use --prompt PATH.")
    if args.language != "ms" and not args.prompt and mode != "csrq":
        raise SystemExit(f"--language {args.language} requires --prompt PATH")

    records = validate_records(load_json(data_path), mode, args.language, data_path)
    if args.limit is not None:
        records = records[: args.limit]

    provider = args.provider or infer_provider(args.model, args.base_url)
    api_key = resolve_api_key(provider, args.api_key_env)
    template = load_text(prompt_path)
    semaphore = asyncio.Semaphore(args.workers)

    async with LLM(
        model=args.model,
        api_key=api_key,
        provider=provider,
        reasoning=args.reasoning,
        base_url=args.base_url,
    ) as client:
        responses = await tqdm_asyncio.gather(
            *(
                infer_one(
                    record,
                    template,
                    args.language,
                    client,
                    semaphore,
                )
                for record in records
            ),
            desc=f"Evaluating {args.model}",
        )

    for record, response in zip(records, responses):
        record["model_resp"] = {
            "resp": response,
            "extracted_resp": None
            if response.startswith("error-")
            else parse_boxed(response),
        }

    if mode == "mcq":
        score = Evaluator.run_mcq_judge(records)
    elif mode == "csrq":
        score = Evaluator.run_open_mcq_judge(records)
    else:
        judge_provider = args.judge_provider or infer_provider(
            args.judge_model,
            args.judge_base_url,
        )
        judge_api_key = resolve_api_key(judge_provider, args.judge_api_key_env)
        async with LLM(
            model=args.judge_model,
            api_key=judge_api_key,
            provider=judge_provider,
            reasoning=False,
            base_url=args.judge_base_url,
        ) as judge_client:
            score = await Evaluator.run_open_ended_judge(
                records,
                judge_client,
                PROMPT_ROOT / "open_ended_judge.txt",
                workers=args.judge_workers,
            )

    output_path = (
        Path(args.output)
        if args.output
        else ROOT
        / "results"
        / safe_model_name(args.model)
        / f"{args.mode}.json"
    )
    save_json(
        output_path,
        {"model": args.model, "mode": args.mode, "score": score, "records": records},
    )
    print(f"Score: {score}")
    print(f"Saved: {output_path}")
    return output_path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the MyCulture evaluation")
    parser.add_argument("--mode", choices=(*MODE_CONFIG, *MODE_ALIASES), required=True)
    parser.add_argument("--model", required=True)
    parser.add_argument(
        "--provider",
        choices=PROVIDER_KEY_ENV,
        help="Inferred from --model unless supplied",
    )
    parser.add_argument("--base-url")
    parser.add_argument("--api-key-env")
    parser.add_argument("--reasoning", action="store_true")
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--data")
    parser.add_argument("--prompt")
    parser.add_argument("--output")
    parser.add_argument("--language", choices=["ms", "en", "zh"], default="ms")
    parser.add_argument("--judge-model", default="gpt-5-nano")
    parser.add_argument(
        "--judge-provider",
        choices=PROVIDER_KEY_ENV,
    )
    parser.add_argument("--judge-base-url")
    parser.add_argument("--judge-api-key-env")
    parser.add_argument("--judge-workers", type=int, default=50)
    return parser


if __name__ == "__main__":
    try:
        asyncio.run(run(build_parser().parse_args()))
    except KeyboardInterrupt:
        print("Terminated by user.")
