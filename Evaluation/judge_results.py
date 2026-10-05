from __future__ import annotations

import argparse
import asyncio
from pathlib import Path

from dotenv import load_dotenv

from evaluators import Evaluator
from llm_models import LLM
from main import PROVIDER_KEY_ENV, ROOT, resolve_api_key
from utils import infer_provider, load_json, save_json


def unwrap_records(payload: dict) -> list[dict]:
    records = payload.get("records", [])
    if isinstance(records, dict):
        records = records.get("records", [])
    if not isinstance(records, list):
        raise ValueError("Input must contain a records array")
    return records


async def run(args: argparse.Namespace) -> None:
    load_dotenv(ROOT / ".env")
    payload = load_json(args.input)
    records = unwrap_records(payload)
    provider = args.provider or infer_provider(args.judge_model, args.base_url)
    api_key = resolve_api_key(provider, args.api_key_env)

    async with LLM(
        model=args.judge_model,
        api_key=api_key,
        provider=provider,
        reasoning=False,
        base_url=args.base_url,
    ) as client:
        score = await Evaluator.run_open_ended_judge(
            records,
            client,
            ROOT / "prompts" / "open_ended_judge.txt",
            workers=args.workers,
        )

    output = Path(args.output)
    save_json(
        output,
        {
            "model": payload.get("model"),
            "judge_model": args.judge_model,
            "score": score,
            "records": records,
        },
    )
    print(f"Score: {score}")
    print(f"Saved: {output}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Judge existing open-ended responses")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--judge-model", default="gpt-5-nano")
    parser.add_argument("--provider", choices=PROVIDER_KEY_ENV)
    parser.add_argument("--base-url")
    parser.add_argument("--api-key-env")
    parser.add_argument("--workers", type=int, default=50)
    return parser


if __name__ == "__main__":
    asyncio.run(run(build_parser().parse_args()))

