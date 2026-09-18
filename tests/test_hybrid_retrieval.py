import unittest

from codebase.server import expand_query_terms, hybrid_score, retrieve_context


class HybridRetrievalTests(unittest.TestCase):
    def test_expand_query_terms_includes_domain_aliases(self):
        expanded = expand_query_terms("retrieval augmented generation")
        self.assertIn("rag", expanded)
        self.assertIn("retrieval", expanded)
        self.assertIn("generation", expanded)
        self.assertIn("truy xuat tang cuong", expanded)

    def test_hybrid_score_prefers_synonym_matches(self):
        item = {
            "source_id": "T06-075",
            "title": "Dinh nghia LLM",
            "text": "LLM la mo hinh ngon ngu lon dua tren kien truc Transformer, duoc huan luyen tren luong du lieu rat lon va co the sinh van ban, tra loi cau hoi, viet code hoac lap luan nhieu buoc."
        }
        score = hybrid_score("large language model transformer", item)
        self.assertGreater(score, 0)

    def test_retrieve_context_returns_best_match_for_hybrid_query(self):
        results = retrieve_context("large language model transformer")
        self.assertTrue(results)
        self.assertGreater(len(results), 0)
        self.assertTrue(any(result["source_id"].startswith("T") for result in results))


if __name__ == "__main__":
    unittest.main()
