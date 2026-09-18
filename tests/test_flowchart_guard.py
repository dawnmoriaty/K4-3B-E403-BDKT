import unittest

from codebase.server import classify_flowchart_route


class FlowchartGuardTests(unittest.TestCase):
    def test_ambiguous_question_asks_one_clarifying_question(self):
        result = classify_flowchart_route("Giải thích cái này giúp mình")
        self.assertEqual(result["route"], "ASK_CLARIFY")
        self.assertIn("?", result["answer"])
        self.assertIsNone(result["abstain_kind"])

    def test_authority_question_abstains_and_redirects_to_official_channel(self):
        result = classify_flowchart_route("Repository của khóa hiện đang đóng hay để private?")
        self.assertEqual(result["route"], "ABSTAIN_ROUTE")
        self.assertEqual(result["abstain_kind"], "AUTHORITY")

    def test_no_grounding_question_abstains_with_external_reference_label(self):
        result = classify_flowchart_route("Cách làm đa nhiệm xử lý GPU trên nền luyện tập DeepSeek-V3?")
        self.assertEqual(result["route"], "ABSTAIN_ROUTE")
        self.assertEqual(result["abstain_kind"], "NO_GROUNDING")
        self.assertIn("không có căn cứ", result["answer"].lower())


if __name__ == "__main__":
    unittest.main()
