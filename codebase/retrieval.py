"""In-memory hybrid retrieval for the restricted course corpus."""

from __future__ import annotations

import json
import math
import os
import re
import threading
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from typing import Any


STOPWORDS = {
    "a", "ai", "ban", "bi", "cac", "cai", "cho", "co", "cua", "duoc", "gi", "hay",
    "khi", "khong", "la", "lam", "mot", "nao", "nay", "nhung", "o", "the", "thi",
    "toi", "trong", "va", "ve", "voi",
}


def normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFD", text.lower())
    normalized = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    return " ".join(re.findall(r"[a-z0-9]+", normalized))


def tokenize(text: str) -> list[str]:
    return [token for token in normalize_text(text).split() if token not in STOPWORDS]


def token_set(text: str) -> set[str]:
    return set(tokenize(text))


def _unit_vector(vector: list[float]) -> list[float]:
    magnitude = math.sqrt(sum(value * value for value in vector))
    if not magnitude:
        return vector
    return [value / magnitude for value in vector]


class HybridRetriever:
    def __init__(self, records: list[dict[str, Any]]) -> None:
        self.records = records
        self.document_tokens: list[list[str]] = []
        self.term_frequencies: list[Counter[str]] = []
        self.document_frequencies: Counter[str] = Counter()
        self.document_lengths: list[int] = []
        self.average_document_length = 0.0
        self.document_embeddings: list[list[float]] | None = None
        self.query_embedding_cache: dict[str, list[float]] = {}
        self.embedding_error = ""
        self._embedding_lock = threading.Lock()
        self._build_bm25_index()

    def _build_bm25_index(self) -> None:
        for record in self.records:
            title_tokens = tokenize(str(record.get("title", "")))
            tokens = title_tokens + title_tokens + tokenize(str(record.get("text", "")))
            frequencies = Counter(tokens)
            self.document_tokens.append(tokens)
            self.term_frequencies.append(frequencies)
            self.document_lengths.append(len(tokens))
            self.document_frequencies.update(frequencies.keys())
        if self.document_lengths:
            self.average_document_length = sum(self.document_lengths) / len(self.document_lengths)

    def _bm25_scores(self, query_tokens: list[str]) -> list[float]:
        scores = [0.0] * len(self.records)
        if not query_tokens or not self.records or not self.average_document_length:
            return scores
        k1 = 1.5
        b = 0.75
        document_count = len(self.records)
        for index, frequencies in enumerate(self.term_frequencies):
            length_ratio = self.document_lengths[index] / self.average_document_length
            for token in set(query_tokens):
                frequency = frequencies.get(token, 0)
                if not frequency:
                    continue
                document_frequency = self.document_frequencies[token]
                inverse_frequency = math.log(
                    1 + (document_count - document_frequency + 0.5) / (document_frequency + 0.5)
                )
                denominator = frequency + k1 * (1 - b + b * length_ratio)
                scores[index] += inverse_frequency * frequency * (k1 + 1) / denominator
        return scores

    def _idf(self, token: str) -> float:
        document_count = len(self.records)
        document_frequency = self.document_frequencies.get(token, 0)
        return math.log(1 + (document_count - document_frequency + 0.5) / (document_frequency + 0.5))

    def evidence_coverage(self, question: str, records: list[dict[str, Any]]) -> float:
        """Return IDF-weighted query coverage so missing rare entities matter most."""
        query_tokens = set(tokenize(question))
        if not query_tokens:
            return 0.0
        evidence_tokens = set().union(
            *(token_set(f"{record.get('title', '')} {record.get('text', '')}") for record in records)
        ) if records else set()
        weights = {token: self._idf(token) for token in query_tokens}
        return sum(weight for token, weight in weights.items() if token in evidence_tokens) / sum(weights.values())

    @staticmethod
    def _embedding_config() -> tuple[str, str, str] | None:
        model = os.getenv("AI_EMBEDDING_MODEL", "text-embedding-3-small").strip()
        if not model or model.lower() in {"off", "none", "disabled"}:
            return None
        api_key = os.getenv("AI_EMBEDDING_API_KEY") or os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            return None
        api_url = os.getenv("AI_EMBEDDING_API_URL", "").strip()
        if not api_url:
            chat_url = os.getenv("AI_API_URL", "https://api.openai.com/v1/chat/completions")
            if chat_url.rstrip("/").endswith("/chat/completions"):
                api_url = chat_url.rstrip("/")[: -len("/chat/completions")] + "/embeddings"
            else:
                parsed = urllib.parse.urlsplit(chat_url)
                api_url = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, "/v1/embeddings", "", ""))
        return api_key, api_url, model

    @property
    def status(self) -> dict[str, str]:
        if self.document_embeddings is not None:
            mode = "hybrid"
        elif self.embedding_error:
            mode = "bm25-fallback"
        elif self._embedding_config():
            mode = "hybrid-pending"
        else:
            mode = "bm25"
        status = {"mode": mode}
        if self.embedding_error:
            status["embedding_error"] = self.embedding_error
        return status

    def _request_embeddings(self, inputs: list[str]) -> list[list[float]]:
        config = self._embedding_config()
        if not config:
            raise RuntimeError("Embedding retrieval is not configured")
        api_key, api_url, model = config
        payload: dict[str, Any] = {"model": model, "input": inputs}
        dimensions = os.getenv("AI_EMBEDDING_DIMENSIONS", "").strip()
        if dimensions:
            payload["dimensions"] = int(dimensions)
        request = urllib.request.Request(
            api_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=90) as response:
            body = json.loads(response.read().decode("utf-8"))
        rows = sorted(body["data"], key=lambda row: row["index"])
        if len(rows) != len(inputs):
            raise RuntimeError("Embedding API returned an incomplete batch")
        return [_unit_vector([float(value) for value in row["embedding"]]) for row in rows]

    def _ensure_document_embeddings(self) -> bool:
        if self.document_embeddings is not None:
            return True
        if self.embedding_error or not self._embedding_config():
            return False
        with self._embedding_lock:
            if self.document_embeddings is not None:
                return True
            if self.embedding_error:
                return False
            try:
                batch_size = max(1, min(int(os.getenv("AI_EMBEDDING_BATCH_SIZE", "64")), 128))
                passages = [
                    f"passage: {record.get('title', '')}\n{record.get('text', '')}"[:12000]
                    for record in self.records
                ]
                embeddings: list[list[float]] = []
                for start in range(0, len(passages), batch_size):
                    embeddings.extend(self._request_embeddings(passages[start : start + batch_size]))
                self.document_embeddings = embeddings
                return True
            except (KeyError, TypeError, ValueError, RuntimeError, urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as error:
                self.embedding_error = f"{type(error).__name__}: {str(error)[:160]}"
                return False

    def _query_embedding(self, question: str) -> list[float] | None:
        normalized = normalize_text(question)
        cached = self.query_embedding_cache.get(normalized)
        if cached is not None:
            return cached
        if self.embedding_error:
            return None
        if not self._ensure_document_embeddings():
            return None
        try:
            embedding = self._request_embeddings([f"query: {question}"[:12000]])[0]
        except (KeyError, TypeError, ValueError, RuntimeError, urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as error:
            self.embedding_error = f"{type(error).__name__}: {str(error)[:160]}"
            return None
        if len(self.query_embedding_cache) >= 128:
            self.query_embedding_cache.pop(next(iter(self.query_embedding_cache)))
        self.query_embedding_cache[normalized] = embedding
        return embedding

    def retrieve(
        self,
        question: str,
        *,
        limit: int = 6,
        current_source_id: str | None = None,
    ) -> list[dict[str, Any]]:
        query_tokens = tokenize(question)
        bm25_scores = self._bm25_scores(query_tokens)
        pool_size = max(20, limit * 4)
        bm25_order = sorted(
            (index for index, score in enumerate(bm25_scores) if score > 0),
            key=lambda index: (-bm25_scores[index], self.records[index]["source_id"]),
        )[:pool_size]

        dense_scores: list[float] = []
        dense_order: list[int] = []
        query_embedding = self._query_embedding(question)
        if query_embedding is not None and self.document_embeddings is not None:
            dense_scores = [
                sum(left * right for left, right in zip(query_embedding, document_embedding))
                for document_embedding in self.document_embeddings
            ]
            dense_order = sorted(
                range(len(self.records)),
                key=lambda index: (-dense_scores[index], self.records[index]["source_id"]),
            )[:pool_size]

        bm25_ranks = {index: rank for rank, index in enumerate(bm25_order, start=1)}
        dense_ranks = {index: rank for rank, index in enumerate(dense_order, start=1)}
        candidate_indexes = set(bm25_order) | set(dense_order)
        query_set = set(query_tokens)
        normalized_query = " ".join(query_tokens)
        ranked: list[tuple[float, int, dict[str, Any]]] = []
        for index in candidate_indexes:
            record = self.records[index]
            score = 0.0
            if index in bm25_ranks:
                score += 1 / (60 + bm25_ranks[index])
            if index in dense_ranks:
                score += 1 / (60 + dense_ranks[index])
            document_set = set(self.document_tokens[index])
            query_weight = sum(self._idf(token) for token in query_set)
            coverage = (
                sum(self._idf(token) for token in query_set & document_set) / query_weight
                if query_weight else 0.0
            )
            score += coverage * 0.008
            if normalized_query and normalized_query in normalize_text(str(record.get("text", ""))):
                score += 0.004
            if record.get("source_type") == "official_slide":
                score += 0.001
            if record.get("source_id") == current_source_id:
                score += 0.008
            enriched = dict(record)
            enriched["_retrieval"] = {
                "bm25_rank": bm25_ranks.get(index),
                "dense_rank": dense_ranks.get(index),
                "dense_score": round(dense_scores[index], 6) if dense_scores else None,
                "fused_score": round(score, 6),
            }
            ranked.append((score, index, enriched))

        ranked.sort(key=lambda item: (-item[0], item[2]["source_id"]))
        return [record for _, _, record in ranked[:limit]]
