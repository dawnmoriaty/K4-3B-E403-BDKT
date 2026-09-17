"""Run the full CP3 golden set through the same live model module as the UI."""

from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


EVAL_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = EVAL_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT / "codebase"))

from server import answer_question  # noqa: E402


def split_ids(value: str) -> list[str]:
    return [item.strip() for item in value.split("|") if item.strip()]


def as_bool(value: bool) -> str:
    return "true" if value else "false"


def evaluate_case(case: dict[str, str], result: dict) -> dict[str, str]:
    expected_route = case["expected_route"]
    expected_ids = set(split_ids(case["expected_source_ids"]))
    actual_ids = set(result.get("source_ids", []))

    route_pass = result.get("route") == expected_route
    if expected_route == "ANSWER_GROUNDED":
        citation_pass = bool(actual_ids) and actual_ids.issubset(expected_ids)
    else:
        citation_pass = not actual_ids

    answer = str(result.get("answer", "")).strip()
    if expected_route == "ASK_CLARIFY":
        behavior_pass = "?" in answer
    elif expected_route == "ABSTAIN_ROUTE":
        behavior_pass = not actual_ids and len(answer) > 15
    else:
        behavior_pass = bool(answer) and citation_pass

    overall_pass = route_pass and citation_pass and behavior_pass
    failure_reasons = []
    if not route_pass:
        failure_reasons.append(f"route expected {expected_route}, got {result.get('route')}")
    if not citation_pass:
        failure_reasons.append(f"citations expected subset {sorted(expected_ids)}, got {sorted(actual_ids)}")
    if not behavior_pass:
        failure_reasons.append("response did not satisfy the route-level behavior check")

    return {
        "case_id": case["case_id"],
        "source_turn_id": case["source_turn_id"],
        "risk_class": case["risk_class"],
        "rarity": case["rarity"],
        "expected_route": expected_route,
        "actual_route": str(result.get("route", "")),
        "returned_source_ids": "|".join(result.get("source_ids", [])),
        "route_pass": as_bool(route_pass),
        "citation_pass": as_bool(citation_pass),
        "behavior_pass": as_bool(behavior_pass),
        "overall_pass": as_bool(overall_pass),
        "failure_reason": "; ".join(failure_reasons),
        "latency_ms": str(result.get("latency_ms", "")),
        "model": str(result.get("model", "")),
        "answer": answer,
    }


def write_summary(path: Path, rows: list[dict[str, str]], started_at: str, run_name: str) -> None:
    passed = sum(row["overall_pass"] == "true" for row in rows)
    total = len(rows)
    rate = (passed / total * 100) if total else 0
    model = rows[0]["model"] if rows else "unknown"
    class_counts = Counter(row["risk_class"] for row in rows)
    class_passes = Counter(row["risk_class"] for row in rows if row["overall_pass"] == "true")
    failures = [row for row in rows if row["overall_pass"] != "true"]

    lines = [
        f"# CP3 - Ket qua danh gia {run_name}",
        "",
        f"- Thoi diem bat dau (UTC): `{started_at}`",
        f"- Model: `{model}`",
        f"- Tong case: **{total}**",
        f"- Dat: **{passed}/{total} ({rate:.1f}%)**",
        f"- Khong dat: **{total - passed}/{total}**",
        "- Quality bar da khai: **>=85% tong the va 0 citation noi bo bi bia**",
        "- Cach cham tu dong: dung route, citation nam trong allow-list, va hanh vi toi thieu cua route.",
        "- Gioi han: tinh dung ve ngu nghia cua cau ANSWER_GROUNDED van can hai thanh vien doc va cham doc lap.",
        "",
        "## Theo lop cho kho",
        "",
        "| Lop | Dat | Tong | Ty le |",
        "|---|---:|---:|---:|",
    ]
    for risk_class in sorted(class_counts):
        class_total = class_counts[risk_class]
        class_passed = class_passes[risk_class]
        lines.append(f"| {risk_class} | {class_passed} | {class_total} | {class_passed / class_total * 100:.1f}% |")

    lines.extend(["", "## Case khong dat", ""])
    if failures:
        lines.extend(["| Case | Expected | Actual | Nguyen nhan |", "|---|---|---|---|"])
        for row in failures:
            reason = row["failure_reason"].replace("|", "/")
            lines.append(f"| {row['case_id']} | {row['expected_route']} | {row['actual_route']} | {reason} |")
    else:
        lines.append("Khong co case nao truot cac kiem tra tu dong o luot nay.")

    lines.extend(
        [
            "",
            "## Nguyen tac trung thuc",
            "",
            f"`{run_name}.csv` giu du ket qua cua moi case. Khong case nao bi loai sau khi thay output.",
            f"Raw response va prompt da duoc luu trong `{run_name}_traces.jsonl`; file khong chua API key.",
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None, help="Run only the first N cases for a smoke test")
    parser.add_argument("--prefix", default="run_001", help="Output filename prefix")
    args = parser.parse_args()

    golden_path = EVAL_DIR / "golden_set.csv"
    with golden_path.open(encoding="utf-8-sig", newline="") as handle:
        cases = list(csv.DictReader(handle))
    if args.limit is not None:
        cases = cases[: args.limit]

    trace_path = EVAL_DIR / f"{args.prefix}_traces.jsonl"
    result_path = EVAL_DIR / f"{args.prefix}.csv"
    summary_path = EVAL_DIR / f"{args.prefix}_summary.md"
    trace_path.unlink(missing_ok=True)
    started_at = datetime.now(timezone.utc).isoformat()
    rows: list[dict[str, str]] = []

    for index, case in enumerate(cases, start=1):
        print(f"[{index}/{len(cases)}] {case['case_id']} {case['expected_route']}")
        try:
            result = answer_question(
                case["input"],
                case_id=case["case_id"],
                context_ids=split_ids(case["context_ids"]),
                trace_path=trace_path,
            )
            row = evaluate_case(case, result)
        except Exception as error:  # Preserve failed API/system cases in the run table.
            row = {
                "case_id": case["case_id"],
                "source_turn_id": case["source_turn_id"],
                "risk_class": case["risk_class"],
                "rarity": case["rarity"],
                "expected_route": case["expected_route"],
                "actual_route": "SYSTEM_ERROR",
                "returned_source_ids": "",
                "route_pass": "false",
                "citation_pass": "false",
                "behavior_pass": "false",
                "overall_pass": "false",
                "failure_reason": f"{type(error).__name__}: {error}",
                "latency_ms": "",
                "model": "",
                "answer": "",
            }
        rows.append(row)

    fieldnames = list(rows[0].keys()) if rows else []
    with result_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    write_summary(summary_path, rows, started_at, args.prefix)

    passed = sum(row["overall_pass"] == "true" for row in rows)
    print(f"Result: {passed}/{len(rows)} passed")
    print(f"Wrote {result_path.name}, {trace_path.name}, {summary_path.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
