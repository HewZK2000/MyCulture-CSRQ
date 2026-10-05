from __future__ import annotations

import asyncio
import difflib
import json
from collections import Counter
from pathlib import Path
from typing import Any, Iterable

from tqdm.asyncio import tqdm_asyncio

from llm_models import LLM
from utils import load_text


class Evaluator:
    @staticmethod
    def normalize(value: Any) -> str:
        return str(value).strip().lower()

    @staticmethod
    def _percentage(values: list[float | bool]) -> float:
        return round(sum(values) / len(values) * 100, 2) if values else 0.0

    @classmethod
    def compare_sequences(cls, left: Iterable, right: Iterable, ordered: bool) -> bool:
        try:
            normalized_left = [cls.normalize(value) for value in left]
            normalized_right = [cls.normalize(value) for value in right]
            if ordered:
                return normalized_left == normalized_right
            return Counter(normalized_left) == Counter(normalized_right)
        except Exception:
            return False

    @staticmethod
    def _normalize_pair(pair: Iterable) -> tuple[str, ...]:
        return tuple(sorted(str(value).strip().lower() for value in pair))

    @classmethod
    def compare_pairs(cls, left: Iterable, right: Iterable) -> bool:
        try:
            return Counter(cls._normalize_pair(pair) for pair in left) == Counter(
                cls._normalize_pair(pair) for pair in right
            )
        except Exception:
            return False

    @classmethod
    def multi_answer_jaccard(cls, left: Iterable, right: Iterable) -> float:
        try:
            left_set = {cls.normalize(value) for value in left}
            right_set = {cls.normalize(value) for value in right}
            union = left_set | right_set
            return len(left_set & right_set) / len(union) if union else 0.0
        except Exception:
            return 0.0

    @classmethod
    def matching_jaccard(cls, left: Iterable, right: Iterable) -> float:
        try:
            left_set = {cls._normalize_pair(pair) for pair in left}
            right_set = {cls._normalize_pair(pair) for pair in right}
            union = left_set | right_set
            return len(left_set & right_set) / len(union) if union else 0.0
        except Exception:
            return 0.0

    @classmethod
    def ordering_similarity(cls, truth: Iterable, prediction: Iterable) -> float:
        try:
            truth_values = [cls.normalize(value) for value in truth] if truth else []
            predicted_values = (
                [cls.normalize(value) for value in prediction] if prediction else []
            )
            if not truth_values and not predicted_values:
                return 1.0
            if not truth_values or not predicted_values:
                return 0.0
            return difflib.SequenceMatcher(None, truth_values, predicted_values).ratio()
        except Exception:
            return 0.0

    @classmethod
    def run_mcq_judge(cls, records: list[dict]) -> dict:
        for record in records:
            prediction = record["model_resp"].get("extracted_resp")
            if isinstance(prediction, list) and len(prediction) == 1:
                prediction = prediction[0]
            record["judge"] = isinstance(prediction, str) and any(
                cls.normalize(prediction) == cls.normalize(truth)
                for truth in record["answer"]
            )
        return cls._exact_summary(records)

    @classmethod
    def run_open_mcq_judge(cls, records: list[dict]) -> dict:
        for record in records:
            prediction = record["model_resp"].get("extracted_resp")
            truth = record["answer"]
            question_type = record["question_type"]

            if question_type == "Padanan":
                exact = cls.compare_pairs(prediction, truth)
                partial = cls.matching_jaccard(prediction, truth)
            elif question_type == "Berurutan":
                exact = cls.compare_sequences(prediction, truth, ordered=True)
                partial = cls.ordering_similarity(truth, prediction)
            elif question_type == "Gabungan":
                exact = cls.compare_sequences(prediction, truth, ordered=False)
                partial = cls.multi_answer_jaccard(prediction, truth)
            else:
                raise ValueError(f"Unsupported question_type: {question_type}")

            record["judge"] = exact
            record["special_metric"] = partial

        summary = cls._exact_summary(records)
        summary["partial_credit_breakdown"] = cls._type_breakdown(
            records,
            "special_metric",
        )
        return summary

    @classmethod
    def _exact_summary(cls, records: list[dict]) -> dict:
        return {
            "overall_accuracy": cls._percentage(
                [record["judge"] for record in records]
            ),
            "breakdown": cls._type_breakdown(records, "judge"),
            "total_samples": len(records),
        }

    @classmethod
    def _type_breakdown(cls, records: list[dict], field: str) -> dict:
        mapping = {
            "multi_answer": "Gabungan",
            "matching": "Padanan",
            "ordering": "Berurutan",
        }
        return {
            label: cls._percentage(
                [
                    record[field]
                    for record in records
                    if record.get("question_type") == question_type
                ]
            )
            for label, question_type in mapping.items()
        }

    @staticmethod
    def format_answer_points(points: list[str]) -> str:
        return "\n".join(f"{index + 1}: {point}" for index, point in enumerate(points))

    @classmethod
    async def run_open_ended_judge(
        cls,
        records: list[dict],
        judge_client: LLM,
        judge_prompt_path: str | Path,
        workers: int = 50,
    ) -> dict:
        template = load_text(judge_prompt_path)
        semaphore = asyncio.Semaphore(workers)

        async def judge_one(record: dict) -> dict[str, list[str]]:
            prompt = template.format(
                question=record["question"],
                model_response=record["model_resp"]["resp"],
                answer_points=cls.format_answer_points(record["answer_point"]),
            )
            async with semaphore:
                try:
                    raw_response = await judge_client.generate(prompt, json_output=True)
                    if not raw_response:
                        raise ValueError("Empty judge response")
                    cleaned = raw_response.strip().replace("```json", "").replace("```", "")
                    parsed = json.loads(cleaned)
                    if not isinstance(parsed["exist_index"], list) or not isinstance(
                        parsed["non_exist_index"], list
                    ):
                        raise ValueError("Judge indices must be lists")
                    exist = [str(value) for value in parsed["exist_index"]]
                    non_exist = [str(value) for value in parsed["non_exist_index"]]
                    expected = {
                        str(index) for index in range(1, len(record["answer_point"]) + 1)
                    }
                    if (
                        len(exist) != len(set(exist))
                        or len(non_exist) != len(set(non_exist))
                        or set(exist) & set(non_exist)
                        or set(exist) | set(non_exist) != expected
                    ):
                        raise ValueError("Judge indices must partition the answer points")
                    return {"exist_index": exist, "non_exist_index": non_exist}
                except Exception:
                    return {"exist_index": [], "non_exist_index": []}

        responses = await tqdm_asyncio.gather(
            *(judge_one(record) for record in records),
            desc="Judging open-ended responses",
        )
        for record, response in zip(records, responses):
            record["judge_response"] = response
            total_points = len(record["answer_point"])
            record["performance"] = (
                round(len(response["exist_index"]) / total_points * 100, 2)
                if total_points
                else 0.0
            )
        return cls.summarize_open_ended(records)

    @classmethod
    def summarize_open_ended(cls, records: list[dict]) -> dict:
        performances = [float(record.get("performance", 0.0)) for record in records]
        return {
            "loose_accuracy": round(sum(performances) / len(performances), 2)
            if performances
            else 0.0,
            "strict_accuracy": cls._percentage(
                [performance == 100 for performance in performances]
            ),
            "total_samples": len(records),
            "fully_correct_samples": sum(
                performance == 100 for performance in performances
            ),
        }
