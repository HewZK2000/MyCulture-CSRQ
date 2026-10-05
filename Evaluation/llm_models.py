from __future__ import annotations

import asyncio
from typing import Any


class LLM:
    """Small async wrapper around the providers used by the original evaluation."""

    def __init__(
        self,
        model: str,
        api_key: str,
        provider: str,
        reasoning: bool = False,
        base_url: str | None = None,
    ) -> None:
        self.model = model
        self.api_key = api_key
        self.provider = provider
        self.reasoning = reasoning
        self.base_url = base_url
        self.client: Any = None

    async def __aenter__(self) -> "LLM":
        if self.provider == "zhipu":
            from zhipuai import ZhipuAI

            self.client = ZhipuAI(api_key=self.api_key)
            return self

        from openai import AsyncOpenAI

        provider_urls = {
            "gemini": "https://generativelanguage.googleapis.com/v1beta/openai/",
            "deepseek": "https://api.deepseek.com",
        }
        resolved_url = self.base_url or provider_urls.get(self.provider)
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=resolved_url,
            timeout=120,
        )
        return self

    async def __aexit__(self, exc_type, exc_value, traceback) -> None:
        if self.client is not None and hasattr(self.client, "close"):
            result = self.client.close()
            if asyncio.iscoroutine(result):
                await result

    async def generate(self, prompt: str, json_output: bool = False) -> str | None:
        if self.provider == "zhipu":
            return await self._generate_zhipu(prompt, json_output)
        return await self._generate_openai_compatible(prompt, json_output)

    async def _generate_openai_compatible(
        self,
        prompt: str,
        json_output: bool,
    ) -> str | None:
        kwargs: dict[str, Any] = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
        }
        if json_output:
            kwargs["response_format"] = {"type": "json_object"}
        if self.reasoning and self.provider in {"openai", "gemini"}:
            kwargs["reasoning_effort"] = "medium"
        if self.provider == "openai-compatible" and "glm" in self.model.lower():
            kwargs["extra_body"] = {
                "chat_template_kwargs": {"enable_thinking": self.reasoning}
            }

        response = await self.client.chat.completions.create(**kwargs)
        return response.choices[0].message.content

    async def _generate_zhipu(self, prompt: str, json_output: bool) -> str | None:
        kwargs: dict[str, Any] = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0,
            "thinking": {"type": "enabled" if self.reasoning else "disabled"},
        }
        if json_output:
            kwargs["response_format"] = {"type": "json_object"}
        response = await asyncio.to_thread(
            self.client.chat.completions.create,
            **kwargs,
        )
        return response.choices[0].message.content

