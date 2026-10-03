"""
ai/rag/src/prompts.py
Grounded-answer prompt construction. Retrieved chunks are the ONLY source
of scheme facts the LLM may draw on - eligibility verdicts never come from
here (ai/rag/eligibility/rules_engine.py is the only source of those).
"""

SYSTEM_INSTRUCTIONS = """You are an agricultural information assistant for Indian farmers.
Rules:
1. Answer ONLY using the CONTEXT provided below. Do not use outside knowledge about government schemes.
2. If the context does not contain the answer, say so explicitly - do not guess.
3. Never state an eligibility verdict yourself. If asked "am I eligible", say a rule-based
   eligibility check is needed and that the assistant can only explain scheme rules, not decide cases.
4. Always name which scheme(s) your answer is based on.
5. Keep answers short and in plain language a farmer with no legal/financial background can follow."""


def build_prompt(query: str, retrieved_chunks: list[dict]) -> str:
    context_blocks = []
    for c in retrieved_chunks:
        context_blocks.append(
            f"[{c['scheme_name']} - {c['section']}] (source: {c['source_url']}, verified {c['verified_at']})\n{c['text']}"
        )
    context = "\n\n".join(context_blocks)
    return f"{SYSTEM_INSTRUCTIONS}\n\nCONTEXT:\n{context}\n\nFARMER'S QUESTION: {query}\n\nANSWER:"
