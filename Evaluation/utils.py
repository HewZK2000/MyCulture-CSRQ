from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


def load_json(path: str | Path) -> Any:
    with Path(path).open(encoding="utf-8") as handle:
        return json.load(handle)


def save_json(path: str | Path, data: Any) -> None:
    output_path = Path(path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)


def load_text(path: str | Path) -> str:
    return Path(path).read_text(encoding="utf-8")


def parse_boxed(text: str | None) -> Any:
    """Extract the content of the final ``\\boxed{...}`` response."""
    if not text:
        return []
    text = text.split("</think>")[-1].lstrip() if "</think>" in text else text
    matches = re.findall(r"\\boxed\{([^}]*)\}", text)
    if not matches:
        return []

    value = matches[-1].strip()
    if value.startswith("[["):
        inner = value[2:-2]
        return [
            [token.strip() for token in pair.split(",") if token.strip()]
            for pair in inner.split("],[")
        ]
    if value.startswith("["):
        return [token.strip() for token in value[1:-1].split(",") if token.strip()]
    if "," in value:
        return [token.strip() for token in value.split(",") if token.strip()]
    return value


def infer_provider(model_name: str, base_url: str | None = None) -> str:
    if base_url:
        return "openai-compatible"
    lowered = model_name.lower()
    if "gemini" in lowered:
        return "gemini"
    if "glm" in lowered:
        return "zhipu"
    if "deepseek" in lowered:
        return "deepseek"
    return "openai"

