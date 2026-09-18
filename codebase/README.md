# VLearn Tutor CP3

Prototype uses one live OpenAI-compatible model call for the central A1 decision:

- `ANSWER_GROUNDED`: answer only from supplied course excerpts and cite their IDs.
- `ASK_CLARIFY`: ask one focused question when the input is ambiguous.
- `ABSTAIN_ROUTE`: do not fill missing evidence from model memory; either show a clearly separated external reference for `NO_GROUNDING`, or safely refuse unsupported requests.

## Run

Python 3.11+ is sufficient. Install the one local PDF-reading dependency once:

```powershell
python -m pip install -r codebase/requirements.txt
$env:OPENAI_API_KEY="your-local-key"
$env:AI_MODEL="gpt-4o-mini"
python codebase/server.py
```

Open `http://127.0.0.1:8000`. Do not open `index.html` directly because live requests use `/api/ask` on the local server.

## Run manual CP3 inputs before writing cases

Open `http://127.0.0.1:8000/input-lab.html` after starting the server. This small lab calls the same live route as the prototype, exposes the route/citations/retrieved context/latency, and lets the team classify each output as `dùng được`, `cần sửa`, or `không chấp nhận`. Download its CSV after 10–20 inputs and turn only the useful, representative inputs into `eval/golden_set.csv` cases.

The API key stays in `.env` or environment variables. Never paste it into the browser or commit `.env`.

An OpenAI-compatible gateway can be configured with `AI_API_KEY`, `AI_API_URL`, and `AI_MODEL`. For the `NO_GROUNDING` branch, the server calls OpenAI's Responses API with web search. Leave `WEB_SEARCH_MODEL` blank to reuse `AI_MODEL`, or set it to a Responses model enabled for `web_search`. See `.env.example`; never commit `.env`.

## Real And Mock Boundaries

- Real: deterministic retrieval over all clean transcript chunks and PDF slide pages in local `data/vlearn-pack/`, model routing/answer generation, citation allow-list validation, latency, and JSONL traces. The pack is git-ignored and is never copied into the submission repo.
- Real: when the internal corpus has no direct evidence (`NO_GROUNDING`), OpenAI web search returns a separate, explicitly non-official reference block. Its query, result, and returned URLs are written to `eval/feedback_log.jsonl` as an `automatic_no_grounding` event.
- Source pack is not committed. `course_context.json` contains only short, permitted excerpts with transcript IDs.

If the pack is stored elsewhere on a local machine, set `VLEARN_TRANSCRIPT_DIR` and `VLEARN_SLIDES_DIR` to its `transcript/` and `slides/` folders before starting the server. The historical `chatlog/tutor_turns.csv` is not read by the prototype; it is reserved for evidence mining and offline evaluation.

Runtime traces are written to `eval/live_traces.jsonl`.
