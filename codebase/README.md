# VLearn Tutor CP3

Prototype uses one live OpenAI-compatible model call for the central A1 decision:

- `ANSWER_GROUNDED`: answer only from supplied course excerpts and cite their IDs.
- `ASK_CLARIFY`: ask one focused question when the input is ambiguous.
- `ABSTAIN_ROUTE`: do not fill missing evidence from model memory; clearly separate the mocked external-reference block and record a `no_grounding` feedback event.

## Run

Python 3.11+ and the `pdftotext` command are required; there are no third-party Python dependencies.

```powershell
$env:OPENAI_API_KEY="your-local-key"
$env:AI_MODEL="gpt-4o-mini"
$env:AI_EMBEDDING_MODEL="text-embedding-3-small"
$env:VLEARN_PACK_PATH="C:\path\to\data\vlearn-pack"
python codebase/server.py
```

Open `http://127.0.0.1:8000`. Do not open `index.html` directly because live requests use `/api/ask` on the local server.

An OpenAI-compatible gateway can be configured with `AI_API_KEY`, `AI_API_URL`, and `AI_MODEL`. See `.env.example`; never commit `.env`.

## Retrieval

- BM25 indexes titles and source text in memory, preserving exact terms and model names.
- When `AI_EMBEDDING_MODEL` is enabled, document embeddings are built in memory on the first question. Dense and BM25 candidates are merged with reciprocal rank fusion, then deterministically reranked using term coverage, exact phrases, source type, and the currently open slide.
- `AI_EMBEDDING_API_URL` and `AI_EMBEDDING_API_KEY` can point to a separate OpenAI-compatible embeddings service. By default, the URL is derived from `AI_API_URL` and the regular API key is reused.
- If the embeddings endpoint is unavailable, retrieval safely falls back to BM25 for that server process. Set `AI_EMBEDDING_MODEL=off` to select BM25-only mode explicitly.
- Embeddings and extracted course text remain in memory and are not persisted to the repository.

## Real And Mock Boundaries

- Real: in-memory retrieval over official slide pages and instructor transcript segments in the restricted VLearn pack, model routing, citation/source gates, arXiv lookup, feedback JSONL, latency, and traces.
- Fallback: if the restricted pack is unavailable, the server uses the small permitted excerpts in `course_context.json`. If arXiv is unavailable, the known DeepSeek report or a Scholar query is shown as an explicitly external reference.
- The source pack and extracted text are never copied into this repository. Chat logs and old Tutor replies are not loaded into the truth corpus.

Runtime traces are written to `eval/live_traces.jsonl`; feedback is written to `eval/feedback_log.jsonl`.

Chat sessions are stored in the learner's browser under `vlearn_chat_sessions_v1`. The Tutor keeps up to 30 recent sessions; ended sessions are read-only and remain available from the history button. This prototype storage is local to the current browser profile and is not synchronized across devices.
