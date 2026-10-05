from __future__ import annotations

import asyncio
import copy
import sys
import unittest
from pathlib import Path


EVAL_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(EVAL_ROOT))

from evaluators import Evaluator  # noqa: E402
from utils import parse_boxed  # noqa: E402


class ParseBoxedTests(unittest.TestCase):
    def test_single_answer(self) -> None:
        self.assertEqual(parse_boxed("Jawapan: \\boxed{B}"), "B")

    def test_multi_answer(self) -> None:
        self.assertEqual(parse_boxed("\\boxed{A,C,D}"), ["A", "C", "D"])

    def test_matching_pairs(self) -> None:
        self.assertEqual(
            parse_boxed("\\boxed{[[A,i],[B,ii]]}"),
            [["A", "i"], ["B", "ii"]],
        )


class EvaluatorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.open_records = [
            {
                "question_type": "Gabungan",
                "answer": ["A", "C"],
                "model_resp": {"extracted_resp": ["C", "A"]},
            },
            {
                "question_type": "Padanan",
                "answer": [["A", "i"], ["B", "ii"]],
                "model_resp": {
                    "extracted_resp": [["B", "ii"], ["A", "i"]]
                },
            },
            {
                "question_type": "Berurutan",
                "answer": ["A", "B", "C"],
                "model_resp": {"extracted_resp": ["A", "C", "B"]},
            },
        ]

    def test_open_mcq_type_semantics(self) -> None:
        records = copy.deepcopy(self.open_records)
        score = Evaluator.run_open_mcq_judge(records)
        self.assertEqual(score["overall_accuracy"], 66.67)
        self.assertEqual(score["breakdown"]["multi_answer"], 100.0)
        self.assertEqual(score["breakdown"]["matching"], 100.0)
        self.assertEqual(score["breakdown"]["ordering"], 0.0)

    def test_mcq_accepts_any_reference_option(self) -> None:
        records = [
            {"answer": ["A", "D"], "model_resp": {"extracted_resp": "D"}},
            {"answer": ["A", "C", "D"], "model_resp": {"extracted_resp": "C"}},
            {"answer": ["A", "D"], "model_resp": {"extracted_resp": "B"}},
        ]
        score = Evaluator.run_mcq_judge(records)
        self.assertEqual([record["judge"] for record in records], [True, True, False])
        self.assertEqual(score["overall_accuracy"], 66.67)

    def test_open_ended_summary(self) -> None:
        score = Evaluator.summarize_open_ended(
            [{"performance": 100.0}, {"performance": 50.0}]
        )
        self.assertEqual(score["loose_accuracy"], 75.0)
        self.assertEqual(score["strict_accuracy"], 50.0)
        self.assertEqual(score["fully_correct_samples"], 1)

    def test_open_ended_rejects_duplicate_judge_indices(self) -> None:
        class BadJudge:
            async def generate(self, prompt: str, json_output: bool = False) -> str:
                return '{"exist_index":["1","1"],"non_exist_index":["2"]}'

        records = [
            {
                "question": "Question",
                "answer_point": ["First", "Second"],
                "model_resp": {"resp": "Response"},
            }
        ]
        score = asyncio.run(
            Evaluator.run_open_ended_judge(
                records,
                BadJudge(),
                EVAL_ROOT / "prompts" / "open_ended_judge.txt",
            )
        )
        self.assertEqual(score["loose_accuracy"], 0.0)
        self.assertEqual(records[0]["judge_response"]["exist_index"], [])


if __name__ == "__main__":
    unittest.main()
