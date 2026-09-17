# VLearn Tutor CP3

Prototype uses one live OpenAI-compatible model call for the central A1 decision:

- `ANSWER_GROUNDED`: answer only from supplied course excerpts and cite their IDs.
- `ASK_CLARIFY`: ask one focused question when the input is ambiguous.
- `ABSTAIN_ROUTE`: do not fill missing evidence from model memory; route to an official source or TA.

## Run

Python 3.11+ is sufficient; there are no third-party dependencies.

```powershell
$env:OPENAI_API_KEY="your-local-key"
$env:AI_MODEL="gpt-4o-mini"
python codebase/server.py
```

Open `http://127.0.0.1:8000`. Do not open `index.html` directly because live requests use `/api/ask` on the local server.

An OpenAI-compatible gateway can be configured with `AI_API_KEY`, `AI_API_URL`, and `AI_MODEL`. See `.env.example`; never commit `.env`.

## Real And Mock Boundaries

- Real: deterministic retrieval over `course_context.json`, model routing/answer generation, citation allow-list validation, latency, and JSONL traces.
- Mock: external web search, teacher approval persistence, and Vector DB ingestion.
- Source pack is not committed. `course_context.json` contains only short, permitted excerpts with transcript IDs.

Runtime traces are written to `eval/live_traces.jsonl`.
