import unittest

from codebase.server import build_external_search_prompt, is_ambiguous_question


class NoGroundingClearQuestionTests(unittest.TestCase):
    def test_clear_question_without_course_evidence_is_not_ambiguous(self):
        question = "Năm nào RAG được giới thiệu và năm nào nó trở nên phổ biến trong cộng đồng nghiên cứu?"
        self.assertFalse(is_ambiguous_question(question))

    def test_external_search_prompt_is_targeted_for_authoritative_sources(self):
        prompt = build_external_search_prompt("Năm nào RAG được giới thiệu?", [{"title": "RAG", "text": "Retrieval-Augmented Generation"}])
        self.assertIn("nguồn chính thức", prompt.lower())
        self.assertIn("arxiv", prompt.lower())
        self.assertIn("RAG", prompt)

    def test_unique_external_sources_extracts_web_search_call_payload(self):
        payload = {
            "web_search_call": {
                "action": {
                    "sources": [
                        {"url": "https://arxiv.org/abs/2005.11401", "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"}
                    ]
                }
            }
        }
        from codebase.server import _unique_external_sources
        self.assertEqual(_unique_external_sources(payload)[0]["url"], "https://arxiv.org/abs/2005.11401")

    def test_external_search_handles_network_failure_gracefully(self):
        import codebase.server as server
        original_urlopen = server.urllib.request.urlopen

        def boom(*args, **kwargs):
            raise OSError("network unreachable")

        server.urllib.request.urlopen = boom
        try:
            result = server.external_research("RAG là gì?", "dummy-key", "gpt-4o-mini")
            self.assertEqual(result["status"], "FAILED")
            self.assertIn("Không thể tra cứu web", result["message"])
        finally:
            server.urllib.request.urlopen = original_urlopen

    def test_safe_external_research_times_out_without_hanging(self):
        import time
        import codebase.server as server
        original = server.external_research

        def slow(*args, **kwargs):
            time.sleep(10)
            return {"status": "LIVE", "answer": "slow"}

        server.external_research = slow
        try:
            start = time.perf_counter()
            result = server.safe_external_research("RAG là gì?", "dummy-key", "gpt-4o-mini", timeout_seconds=0.2)
            elapsed = time.perf_counter() - start
            self.assertEqual(result["status"], "FAILED")
            self.assertIn("quá thời gian chờ", result["message"])
            self.assertLess(elapsed, 2.0)
        finally:
            server.external_research = original


if __name__ == "__main__":
    unittest.main()
