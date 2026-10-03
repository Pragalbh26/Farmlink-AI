"""
ai/rag/src/llm_provider.py

ADR-005: hosted LLM via a provider-agnostic adapter. Swapping providers =
editing this file only, never the RAG pipeline that calls it.
Non-negotiable per ADR-005: on any failure, return an explicit error -
NEVER a fabricated answer.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from ai.common.config import ANTHROPIC_API_KEY
from ai.common.logging_utils import get_logger

logger = get_logger(__name__)


@dataclass
class LLMResponse:
    success: bool
    text: Optional[str]
    error: Optional[str]
    model_version: str


class LLMAdapter:
    """Base interface every provider implements."""
    def generate(self, prompt: str, max_tokens: int = 500) -> LLMResponse:
        raise NotImplementedError


class AnthropicAdapter(LLMAdapter):
    def __init__(self, model: str = "claude-sonnet-4-6", api_key: Optional[str] = None):
        self.model = model
        self.api_key = api_key or ANTHROPIC_API_KEY

    def generate(self, prompt: str, max_tokens: int = 500) -> LLMResponse:
        if not self.api_key:
            return LLMResponse(
                success=False, text=None,
                error="ANTHROPIC_API_KEY not set in .env - cannot call the LLM. "
                      "This is a real, honest block, not a code bug: see PROGRESS_LEDGER.md "
                      "ACTION REQUIRED. Retrieval + the deterministic eligibility engine both "
                      "work without this key; only free-text generation needs it.",
                model_version=self.model,
            )
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.api_key)
            resp = client.messages.create(
                model=self.model, max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}],
            )
            text = "".join(b.text for b in resp.content if hasattr(b, "text"))
            return LLMResponse(success=True, text=text, error=None, model_version=self.model)
        except Exception as e:
            logger.warning("LLM call failed (%s) - returning explicit error, not a fabricated answer.", e)
            return LLMResponse(success=False, text=None, error=str(e), model_version=self.model)


def get_default_adapter() -> LLMAdapter:
    return AnthropicAdapter()
