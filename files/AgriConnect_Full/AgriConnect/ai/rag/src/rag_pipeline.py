"""
ai/rag/src/rag_pipeline.py
End-to-end orchestrator: retrieve -> (eligibility engine OR grounded LLM
answer) -> response with sources. Matches Knowledge 07's routing table:
eligibility questions go to the deterministic engine; general questions
get RAG-grounded generation.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Optional

from ai.rag.src.retriever import retrieve
from ai.rag.src.prompts import build_prompt
from ai.rag.src.llm_provider import get_default_adapter
from ai.rag.src.vector_store import FaissStore

MIN_RETRIEVAL_SCORE = 0.05  # below this, abstain rather than answer off thin/irrelevant context


@dataclass
class ChatResponse:
    answer: Optional[str]
    sources: list[dict]
    abstained: bool
    abstain_reason: Optional[str]
    model_version: str

    def to_dict(self) -> dict:
        return asdict(self)


def answer_general_question(store: FaissStore, query: str, k: int = 3) -> ChatResponse:
    results = retrieve(store, query, k=k)
    if not results or results[0]["score"] < MIN_RETRIEVAL_SCORE:
        return ChatResponse(
            answer=None, sources=[], abstained=True,
            abstain_reason="No sufficiently relevant scheme information found in the knowledge base "
                            "for this question - abstaining rather than guessing (Knowledge 07 requirement).",
            model_version="none",
        )

    prompt = build_prompt(query, results)
    llm = get_default_adapter()
    response = llm.generate(prompt)

    sources = [{"scheme_name": r["scheme_name"], "source_url": r["source_url"],
                "verified_at": r["verified_at"], "relevance_score": round(r["score"], 3)} for r in results]

    if not response.success:
        return ChatResponse(
            answer=None, sources=sources, abstained=True,
            abstain_reason=f"Retrieval succeeded (sources below are real) but generation failed: {response.error}",
            model_version=response.model_version,
        )

    return ChatResponse(answer=response.text, sources=sources, abstained=False,
                         abstain_reason=None, model_version=response.model_version)
