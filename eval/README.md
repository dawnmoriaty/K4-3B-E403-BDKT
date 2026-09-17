# CP3 Evaluation

`golden_set.csv` contains 20 K4 chatlog-derived cases. It covers five cases in each of the four risk classes, ten common cases, eight edge cases, and two rare cases. Only anonymized `turn_id` references and short inputs are committed; the protected source pack remains outside the repository.

Run the same live AI module used by the browser:

```powershell
python eval/run_eval.py
```

Smoke-test one or two cases without overwriting the official run:

```powershell
python eval/run_eval.py --limit 2 --prefix smoke
```

Outputs:

- `run_001.csv`: one row for every case, including failures.
- `run_001_traces.jsonl`: prompt, raw model response, parsed route, citations, model, and latency.
- `run_001_summary.md`: pass count, percentage, class breakdown, limitations, and failure list.

Recorded iterations are intentionally retained:

- `run_001`: 14/20 (70%); one transient network error and an unclear clarify/abstain boundary.
- `run_002`: 15/20 (75%); ambiguity improved but the router overused clarification for authority cases.
- `run_003`: 18/20 (90%); exceeds the 85% bar with zero fabricated source IDs under the automatic checks.

Automatic checks do not prove semantic correctness. Two team members must independently review at least five grounded answers; disagreement on two or more means the rubric needs clarification before CP4.
