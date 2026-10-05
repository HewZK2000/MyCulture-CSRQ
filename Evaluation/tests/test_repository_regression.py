from __future__ import annotations

import copy
import sys
import unittest
from pathlib import Path


EVAL_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = EVAL_ROOT.parent
sys.path.insert(0, str(EVAL_ROOT))

from evaluators import Evaluator  # noqa: E402
from utils import load_json  # noqa: E402


MCQ_RESULT = (
    REPO_ROOT
    / "src"
    / "performance_output"
    / "output"
    / "gemini-2.5-flash_reasoning_True"
    / "gemini-2.5-flash_mcq.json"
)
OPEN_MCQ_RESULT = (
    REPO_ROOT
    / "src"
    / "performance_output"
    / "output"
    / "gemini-2.5-flash_reasoning_True"
    / "gemini-2.5-flash_open_mcq.json"
)
OPEN_ENDED_RESULT = (
    REPO_ROOT
    / "src"
    / "performance_output"
    / "open_ended_output"
    / "gemini-2.5-flash_qwen3.json"
)


@unittest.skipUnless(
    MCQ_RESULT.exists() and OPEN_MCQ_RESULT.exists() and OPEN_ENDED_RESULT.exists(),
    "Repository result files are not available",
)
class RepositoryRegressionTests(unittest.TestCase):
    def test_gemini_mcq_score(self) -> None:
        payload = load_json(MCQ_RESULT)
        records = copy.deepcopy(payload["records"])
        score = Evaluator.run_mcq_judge(records)
        self.assertEqual(score["total_samples"], 1821)
        self.assertEqual(score["overall_accuracy"], 82.87)

    def test_gemini_open_mcq_score(self) -> None:
        payload = load_json(OPEN_MCQ_RESULT)
        records = copy.deepcopy(payload["records"])
        score = Evaluator.run_open_mcq_judge(records)
        self.assertEqual(score["total_samples"], 1821)
        self.assertEqual(score["overall_accuracy"], 47.39)
        self.assertEqual(score["breakdown"]["matching"], 41.9)
        self.assertEqual(score["breakdown"]["ordering"], 46.4)

    def test_gemini_open_ended_score(self) -> None:
        payload = load_json(OPEN_ENDED_RESULT)
        records = payload["records"]["records"]
        score = Evaluator.summarize_open_ended(records)
        self.assertEqual(score["total_samples"], 1821)
        self.assertEqual(score["strict_accuracy"], 21.47)
        self.assertEqual(score["loose_accuracy"], 65.23)

    def test_all_three_result_id_sets_match(self) -> None:
        mcq_ids = {record["id"] for record in load_json(MCQ_RESULT)["records"]}
        open_mcq_ids = {
            record["id"] for record in load_json(OPEN_MCQ_RESULT)["records"]
        }
        open_ended_ids = {
            record["id"]
            for record in load_json(OPEN_ENDED_RESULT)["records"]["records"]
        }
        self.assertEqual(len(mcq_ids), 1821)
        self.assertEqual(mcq_ids, open_mcq_ids)
        self.assertEqual(mcq_ids, open_ended_ids)


if __name__ == "__main__":
    unittest.main()

