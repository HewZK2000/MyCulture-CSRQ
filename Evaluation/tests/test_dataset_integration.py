from __future__ import annotations

import asyncio
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


EVAL_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(EVAL_ROOT))

import main  # noqa: E402
from utils import load_json  # noqa: E402


class DatasetIntegrationTests(unittest.TestCase):
    def test_all_default_datasets_run_with_offline_model(self) -> None:
        responses = {
            "mcq": r"\boxed{A}",
            "csrq": r"\boxed{B,C}",
            "crq": "Tempat permainan Lansaran berukuran antara lapan hingga 30 kaki persegi.",
        }

        with tempfile.TemporaryDirectory() as directory:
            for mode, response in responses.items():
                with self.subTest(mode=mode):
                    class FakeLLM:
                        def __init__(self, **kwargs: object) -> None:
                            pass

                        async def __aenter__(self) -> "FakeLLM":
                            return self

                        async def __aexit__(self, *args: object) -> None:
                            pass

                        async def generate(self, prompt: str, json_output: bool = False) -> str:
                            if json_output:
                                return '{"exist_index":["1","2","3","4","5","6"],"non_exist_index":[]}'
                            return response

                    output = Path(directory) / f"{mode}.json"
                    args = main.build_parser().parse_args(
                        [
                            "--mode", mode,
                            "--model", "offline-model",
                            "--provider", "openai-compatible",
                            "--judge-provider", "openai-compatible",
                            "--limit", "1",
                            "--output", str(output),
                        ]
                    )
                    with patch.object(main, "LLM", FakeLLM):
                        asyncio.run(main.run(args))

                    result = load_json(output)
                    self.assertEqual(len(result["records"]), 1)
                    self.assertEqual(result["score"]["total_samples"], 1)
                    metric = "strict_accuracy" if mode == "crq" else "overall_accuracy"
                    self.assertEqual(result["score"][metric], 100.0)

    def test_wrong_dataset_mode_fails_before_inference(self) -> None:
        path = main.DATA_ROOT / "CSRQ.json"
        with self.assertRaisesRegex(SystemExit, "answer shape does not match MCQ"):
            main.validate_records(load_json(path), "mcq", "ms", path)


if __name__ == "__main__":
    unittest.main()
