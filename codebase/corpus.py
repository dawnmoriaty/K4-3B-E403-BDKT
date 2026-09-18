"""Load the restricted VLearn pack into memory without copying it into the repo."""

from __future__ import annotations

import json
import os
import re
import subprocess
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
DEFAULT_PACK = (
    Path.home()
    / "Downloads"
    / "K4-3B-Day05-06-AI-Product-Hackathon-main"
    / "K4-3B-Day05-06-AI-Product-Hackathon-main"
    / "data"
    / "vlearn-pack"
)
TRANSCRIPT_PATTERN = re.compile(r"^\*\*\[(T\d{2}-\d{3})\]\*\*\s*(.*)$")


def pack_path() -> Path | None:
    configured = os.getenv("VLEARN_PACK_PATH", "").strip()
    if not configured:
        env_path = HERE / ".env"
        if env_path.is_file():
            for raw_line in env_path.read_text(encoding="utf-8").splitlines():
                if raw_line.strip().startswith("VLEARN_PACK_PATH="):
                    configured = raw_line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    candidate = Path(configured).expanduser() if configured else DEFAULT_PACK
    return candidate.resolve() if candidate.is_dir() else None


def _parse_transcript(path: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    section = path.stem
    current_id: str | None = None
    current_lines: list[str] = []

    def flush() -> None:
        nonlocal current_id, current_lines
        if not current_id:
            return
        text = " ".join(line.strip() for line in current_lines if line.strip()).strip()
        lowered = text.lower()
        if text and not lowered.startswith("[hoạt động lớp:") and not lowered.startswith("[học viên]"):
            records.append(
                {
                    "source_id": current_id,
                    "source_type": "instructor_transcript",
                    "title": section,
                    "section": section,
                    "text": text,
                    "artifact_name": path.name,
                    "allowed_for_answer": True,
                }
            )
        current_id = None
        current_lines = []

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line.startswith("## "):
            flush()
            section = line[3:].strip()
            continue
        match = TRANSCRIPT_PATTERN.match(line)
        if match:
            flush()
            current_id = match.group(1)
            current_lines = [match.group(2)]
        elif current_id and line and not line.startswith(">"):
            current_lines.append(line)
    flush()
    return records


def _extract_pdf_pages(path: Path, day: int) -> list[dict[str, Any]]:
    try:
        completed = subprocess.run(
            ["pdftotext", "-layout", str(path), "-"],
            check=True,
            capture_output=True,
            timeout=45,
        )
    except (FileNotFoundError, subprocess.SubprocessError):
        return []

    text = completed.stdout.decode("utf-8", errors="replace")
    records: list[dict[str, Any]] = []
    for page_number, raw_page in enumerate(text.split("\f"), start=1):
        lines = [re.sub(r"\s+", " ", line).strip() for line in raw_page.splitlines()]
        lines = [line for line in lines if line]
        if not lines:
            continue
        source_id = f"D{day}-P{page_number:02d}"
        records.append(
            {
                "source_id": source_id,
                "source_type": "official_slide",
                "title": lines[0][:180],
                "section": f"Day {day} · trang PDF {page_number}",
                "text": " ".join(lines),
                "artifact_name": path.name,
                "pdf_page": page_number,
                "allowed_for_answer": True,
            }
        )
    return records


def load_corpus() -> tuple[list[dict[str, Any]], Path | None]:
    root = pack_path()
    if root:
        records: list[dict[str, Any]] = []
        for transcript in sorted((root / "transcript").glob("transcript-*-clean.md")):
            records.extend(_parse_transcript(transcript))
        for day, name in ((1, "d1-slide-hackathon.pdf"), (2, "d2-slide-hackathon.pdf")):
            pdf_path = root / "slides" / name
            if pdf_path.is_file():
                records.extend(_extract_pdf_pages(pdf_path, day))
        if records:
            return records, root

    fallback = json.loads((HERE / "course_context.json").read_text(encoding="utf-8"))
    for item in fallback:
        item.setdefault("source_type", "prototype_excerpt")
        item.setdefault("section", item["title"])
        item.setdefault("allowed_for_answer", True)
    return fallback, None
