# AI SPEC — Xác Thực Nguồn 2 Tầng Cho VLearn Tutor · Nhóm BDKT · Phòng E403
**Hướng:** [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở  
**Loại:** [x] Tối ưu tính năng có sẵn  [ ] Tính năng mới

---

## §1. User & Job
- **Job executor + workflow:** Học viên khóa AI20k (Lớp 3B) đang trong buổi học hoặc tự ôn tập bài vào buổi tối trên hệ thống VLearn. Khi gặp một khái niệm khó hiểu hoặc câu hỏi mở rộng, học viên bôi đen đoạn tài liệu/slide và đặt câu hỏi cho AI Tutor.
- **Core JTBD (không có tên AI/sản phẩm):** Xác minh và làm rõ ý nghĩa của một khái niệm bài giảng dựa trên căn cứ giáo trình chính thức để hiểu sâu và tự tin làm bài tập/quiz.
- **Problem statement (KHÔNG có chữ AI):** Người học khi gặp khái niệm chưa rõ thường nhận được lời giải thích chung chung, không rõ xuất xứ trang slide hay vị trí bài học, hoặc giải thích sai lệch quy ước so với barem của giảng viên; người học buộc phải tự tua lại video hoặc tìm kiếm ngoài mất 10–15 phút nhưng vẫn lo lắng làm sai bài kiểm tra.
- **Evidence (đạt cả chuẩn A và chuẩn B):**
  - **Chuẩn B — Mining dữ liệu thật (`data/vlearn-pack/chatlog/tutor_turns.csv`):**
    - Tổng số mẫu: 13.494 lượt hỏi-đáp.
    - **3.781 / 13.494 lượt phản hồi của tutor (28.02%)** có trường trích dẫn rỗng (`has_citation = False`).
    - Riêng Khóa 4 (từ ngày 09/09/2026): **839 / 3.097 lượt (27.09%)** câu trả lời bị thiếu trích dẫn.
    - Tutor gần như không có phản xạ hỏi ngược để làm rõ câu hỏi mơ hồ: chỉ 28 / 13.494 lượt (0.2%).
    - ≥5 ví dụ nguyên văn trong log:
      1. `T00009`: Học viên yêu cầu: *"Hãy giải thích ngắn gọn LLM là gì và trích dẫn slide"* → Tutor trả lời lý thuyết nhưng không hề trích dẫn số trang slide nào (`has_citation = False`).
      2. `T00018`: Học viên hỏi thông tin chương trình khóa học → Tutor báo không tìm thấy nhưng không đưa ra nguồn thay thế hay kênh hỗ trợ.
      3. `T10288`: Học viên K4 hỏi về môi trường baseline → Trả lời không có căn cứ cụ thể.
      4. `T10289`: Học viên K4 hỏi lại lần 2 do câu trả lời trước chưa rõ nguồn.
      5. `T10291`: Học viên hỏi nên ôn phần nào trước → Tutor trả lời cảm tính, không dựa vào mastery state.
  - **Chuẩn A — Khảo sát thực tế Mom Test ([Live Google Sheet Tracking](https://docs.google.com/spreadsheets/d/1Z6wkMffmJIfkfRHMmfdtY8WO4S7_ohOSa2YAxVl7PtY/edit?gid=494808561#gid=494808561) & `validation/survey_responses.csv`):**
    - Đã khảo sát 14 học viên ngoài nhóm trong phòng E403/E402 (có đầy đủ mã học viên và câu trả lời nguyên văn):
    - **64.3% (9/14 bạn)** xác nhận: Đã từng gặp trường hợp AI Tutor giải thích nghe hay nhưng khi kiểm tra lại thì không khớp nội dung giáo viên dạy hoặc barem chấm quiz, khiến bản thân hoang mang hoặc mất điểm.
    - **78.6% (11/14 bạn)** phải dùng các giải pháp thay thế thủ công: 42.9% phải tự mở lại video tua tìm, 35.7% phải lên Google/ChatGPT tra lại.
    - **50.0% (7/14 bạn)** mất từ 5 đến trên 15 phút cho mỗi lần phải tự đi kiểm chứng lại.
    - *(Ghi chú: Dữ liệu khảo sát tiếp tục được mở rộng liên tục qua Google Form để đạt mốc ≥20 người ở CP4)*.

---

## §2. Impact & quyết định chọn
- **Bảng impact 3 ứng viên:**

| Ứng viên tính năng | Bao nhiêu người gặp | Tần suất | Mỗi lần tốn gì | Build nổi trong 39h? | Chọn? |
|---|---|---|---|:---:|:---:|
| **1. Xác thực nguồn 2 tầng (RAG + Web Search Disclaimer + Human-in-the-loop)** | 64.3% học viên khảo sát; 28% log chat thiếu citation (3.781 lượt) | Hàng ngày, mỗi buổi học | 10–15 phút tự tua video, nguy cơ mất điểm quiz | Khả thi (RAG + Tool call + Dashboard duyệt) | **CHỌN** |
| **2. Tự động sinh Flashcard ôn tập cá nhân** | ~35% học viên có nhu cầu | Cuối tuần / trước kỳ thi | 20 phút tự ghi chép | Cần lưu trữ state phức tạp, khó test chuẩn | Loại |
| **3. Socratic Tutor (Luôn hỏi ngược học viên)** | ~25% học viên kiên nhẫn | Mỗi lần bí bài | Học viên dễ bực bội nếu đang cần câu trả lời gấp | Dễ gây ức chế người dùng nếu prompt chưa chuẩn | Loại |

- **Ứng viên ĐÃ LOẠI + vì sao:**
  - *Flashcard ôn tập cá nhân:* Bằng chứng chưa đủ nhức nhối (học viên chủ yếu cần qua bài tập trước mắt).
  - *Socratic Tutor bắt buộc:* Rủi ro cao gây khó chịu cho học viên khi đang làm bài thi cần tra cứu gấp.
- **Ứng viên CHỌN + vì sao (bằng số):** Chọn **Ứng viên 1** vì giải quyết đúng **64.3% học viên bị hoang mang/mất điểm** và khắc phục trực tiếp **28% lỗi không citation trong 13.494 lượt chat thực tế**, đồng thời giải quyết triệt để bài toán "Biết mình không biết".

---

## §3. Giải pháp tương tự đã nghiên cứu
- **NotebookLM:**
  - *Flow:* RAG thuần túy bám sát tài liệu upload, trích dẫn số trang cạnh từng câu.
  - *Đáng học:* Trích dẫn trực quan click vào nhảy đến đúng đoạn nguồn.
  - *Đáng né:* Hoàn toàn bế tắc khi tài liệu upload thiếu thông tin (trả lời "Tôi không tìm thấy trong nguồn").
  - *Mình khác gì:* Khi tài liệu nội bộ thiếu, hệ thống kích hoạt Web Search ngoài nhưng gắn cảnh báo và đưa vào hàng đợi cho Giảng viên duyệt nạp lại.
- **Perplexity AI:**
  - *Flow:* Web search tổng hợp kèm footnote trích dẫn.
  - *Đáng học:* Tự động tìm kiếm nguồn mở rộng cực nhanh.
  - *Đáng né:* Không phân biệt được đâu là "tài liệu chính thức của khóa học" và đâu là "kiến thức tham khảo trên mạng", dễ gây lệch barem.
  - *Mình khác gì:* Phân định rạch ròi 2 cấp độ: Badge Xanh (Đã xác thực nội bộ) vs Badge Vàng (Chưa xác thực - Nguồn ngoài).

---

## §4. Thiết kế
- **Lát cắt MỘT CÂU:** Học viên đang học trên VLearn Reader bấm hỏi hoặc bôi đen một khái niệm → AI Tutor quyết định trả lời khi có căn cứ, hỏi lại khi mơ hồ hoặc dừng và gửi case đã gộp/xếp ưu tiên cho giảng viên khi thiếu nguồn → học viên biết câu trả lời dựa trên đâu và tiếp tục học mà không phải chờ duyệt.
- **Non-goals (≥3 thứ KHÔNG build):**
  1. Không làm tính năng chat tự do ngoài phạm vi học tập (chặn chat linh tinh).
  2. Không tự động sinh code giải hoàn chỉnh bài Lab/Quiz (chống gian lận).
  3. Không tự động nạp tri thức ngoài vào Vector DB khi chưa có Giảng viên hoặc chủ sở hữu nội dung bấm duyệt.
- **Mức prototype hiện tại:** [ ] Mock (CP2)  [x] Working (CP3)
  - *Phần chạy giả lập (Mock):* Giao diện VLearn Reader mô phỏng pixel-perfect (`codebase/index.html`), cơ chế trượt mở AI Tutor Drawer, thanh chuyển đổi 4 kịch bản kiểm chứng, modal Review Queue của Giảng viên.
  - *Phần chạy thật (Working - CP3):* Backend `codebase/server.py` truy xuất các đoạn giáo trình tối thiểu trong `course_context.json`, gọi model OpenAI-compatible để quyết định `ANSWER_GROUNDED / ASK_CLARIFY / ABSTAIN_ROUTE`, rồi kiểm tra cứng citation theo allow-list. Prompt, phản hồi thô, route và latency được ghi vào `eval/*_traces.jsonl`.
  - *Chưa chạy thật:* Web search, Teacher Review Queue và thao tác nạp Vector DB vẫn là mock; prototype CP3 không tuyên bố các phần này đã được tích hợp.
- **Automation:** [ ] augment  [x] conditional  [ ] automate  
  - *Lý do theo chi phí sai sót (Cost-of-Error):* 
    - Khi câu hỏi có đoạn nguồn trực tiếp hỗ trợ, AI tự động trả lời kèm citation để học viên tự kiểm tra.
    - Khi input mơ hồ, AI hỏi lại đúng một câu. Khi không có nguồn hoặc cần thẩm quyền, AI không sinh kiến thức từ trí nhớ mô hình mà gửi case vào hàng đợi giảng viên bất đồng bộ. Sai trong các case này có thể khiến học viên học lệch barem và mất điểm; học viên vẫn tiếp tục học, còn case giữ trạng thái `Chờ duyệt` cho tới khi người có thẩm quyền xử lý.
- **§4b. Nguyên tắc đã áp dụng (HAX/PAIR):**
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | **HAX G10** *(Thu hẹp phạm vi khi nghi ngờ)* | Input thiếu đối tượng thì Tutor hỏi đúng một câu; nguồn chỉ liên quan một phần thì Tutor thu hẹp phần trả lời thay vì đoán. |
  | **HAX G11** *(Giải thích vì sao)* | Câu trả lời grounded hiện mã đoạn/trang; no-grounding nói rõ không tìm thấy nguồn chính thức. |
  | **HAX G8** *(Gạt bỏ dễ dàng)* | Học viên có thể đóng Tutor Drawer, bỏ qua nguồn ngoài hoặc không gửi case cho giảng viên; gửi xong vẫn tiếp tục học ngay. |
  | **HAX G9** *(Sửa dễ dàng)* | Học viên dùng `Đề xuất sửa` để chỉnh nội dung/citation; giảng viên sửa tiếp trước khi duyệt hoặc bác bỏ. |
  | **PAIR Feedback & Control** | Chỉ nội dung có nguồn, bản sửa, người duyệt và thời điểm mới được cập nhật vào kho tri thức. |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8)
*(Chi tiết được mở rộng tại CP4)*:
1. *Nguồn sự thật:* (a) không tìm thấy đoạn hỗ trợ → dừng và gửi hàng đợi giảng viên bất đồng bộ; (b) citation liên quan nhưng không hỗ trợ claim → không được gắn nhãn grounded.
2. *Mơ hồ / thiếu thông tin:* (a) "nó là gì?" → hỏi đối tượng; (b) "tiếp tục đi" nhưng thiếu lượt trước → yêu cầu khôi phục ngữ cảnh.
3. *Ngoài phạm vi / thẩm quyền:* (a) hỏi chính sách điểm hiện hành → chuyển nguồn chính thức; (b) đòi code hoàn chỉnh bài Lab → từ chối và đưa gợi ý học an toàn.
4. *Đặc thù domain:* (a) hai tài liệu dùng phiên bản khác nhau → nêu mâu thuẫn, không tự chọn; (b) học viên báo đáp án/slide sai nhưng thiếu artifact → tạo case để giảng viên thẩm định.

---

## §6. Bốn đường đi của trải nghiệm (Khối Rubric R3)
1. **Happy path:** Câu hỏi rõ và có đoạn nguồn trực tiếp trong bài hiện tại hoặc bài khác thuộc corpus được cấp → trả lời ngắn gọn, hiện mã đoạn/trang và nút mở nguồn để học viên tự kiểm tra.
2. **Low-confidence:** Input thiếu đối tượng hoặc nguồn chỉ liên quan một phần → hỏi đúng một câu làm rõ hoặc thu hẹp phần có thể trả lời; không tự đoán.
3. **Failure / no-grounding:** Không có căn cứ hoặc câu hỏi cần dữ liệu/thẩm quyền hệ thống không có → không sinh câu trả lời kiến thức; hiện `Gửi giảng viên` và nguồn ngoài tách biệt. Case được gộp trùng, xếp ưu tiên và giữ `Chờ duyệt`; học viên không phải chờ tại màn hình.
4. **Correction:** Học viên bấm `Đề xuất sửa` để chỉnh nội dung/citation → case vào hàng đợi bất đồng bộ → giảng viên kiểm tra nguồn, sửa trực tiếp, duyệt hoặc bác bỏ khi có thời gian và lưu lịch sử xử lý.

Cross-lecture là chi tiết retrieval bên trong happy path. Nhánh từ chối gian lận là guardrail bổ sung, không thay thế bốn đường bắt buộc.

## §7. Kiểm thử
- **Golden set:** `eval/golden_set.csv` có 20 case K4 phát triển từ chatlog thật: 5 case/lớp cho đủ 4 lớp chỗ khó; 10 common, 8 edge và 2 rare. Mỗi case giữ `source_turn_id`, route mong đợi, nguồn được phép và hành vi cấm.
- **Chiều chất lượng kiểm chứng được:** (1) route đúng; (2) mọi citation thuộc allow-list của case; (3) case mơ hồ phải hỏi lại một câu; (4) case thiếu căn cứ không được trả citation hoặc biến suy đoán thành kiến thức khóa học.
- **Quality bar chốt cho CP3/CP4:** đạt khi **≥85% case qua toàn bộ kiểm tra**, đồng thời có **0 citation nội bộ bị bịa**. Tính đúng về ngữ nghĩa của ít nhất 5 câu grounded phải được hai thành viên chấm độc lập; lệch ≥2/5 thì viết lại rubric trước khi chốt CP4.
- **Lượt đo 1:** chạy bằng `python eval/run_eval.py`; kết quả đầy đủ nằm tại `eval/run_001.csv`, trace tại `eval/run_001_traces.jsonl`, thống kê và case lỗi tại `eval/run_001_summary.md`.
- **Kết quả thực nghiệm:** Run 1 đạt **14/20 (70%)**, dưới quality bar; nguyên nhân gồm 1 lỗi mạng và 5 lỗi ranh giới clarify/abstain. Sau hai vòng sửa prompt nhưng không đổi golden label hay quality bar, Run 2 đạt **15/20 (75%)** và Run 3 đạt **18/20 (90%)**, với **0 citation ngoài allow-list**. Hai case domain còn lỗi được giữ nguyên tại `eval/run_003_summary.md`.
- **Phần người chấm còn phải làm:** hai thành viên điền độc lập `eval/manual_review_5.csv` cho 5 câu grounded; kiểm tra tự động hiện chưa chứng minh đầy đủ tính đúng ngữ nghĩa.

---

## §8. Phân công & Kế hoạch
- **Phùng Đức Đăng (2A202602956):** Đội trưởng / Product Lead — Canvas, Spec §1-§4, nộp form CP1–CP5.
- **Trần Ngọc Khánh (2A202602923):** Data & Evidence Lead — Mining log, quản lý Google Sheets khảo sát và file CSV.
- **Phùng Gia Bảo (2A202602386):** AI & Evaluation Lead — Prompt RAG, xây dựng Golden Set 20 case.
- **Nguyễn Hữu Thành (2A202602807):** Tech & Prototype Lead — Giao diện web mock, tích hợp API AI thật.
- **Willing users xác nhận (từ khảo sát):**
  1. Trần Quốc Sáng (`2A202602712`)
  2. Nguyễn Anh Hoàng (`2A202602816`)
  3. Trần Cao Quốc Định (`2A202602939`)
  4. Nguyễn Mạnh Tiến (`2A202602506`)
  5. Đinh Kim Thái (`2A202602417`)

---

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
|---|---|---|
| 19:15 17/9 | Thêm số liệu khảo sát 14 học viên | Hoàn thiện chuẩn A cho mốc CP1 |
| 19:25 17/9 | Hoàn thành Spec §1, §2, §4, §6 | Đồng bộ luồng nghiệp vụ và bản mock CP2 |
| 20:30 17/9 | Tích hợp backend AI thật, source gate và golden set 20 case | Chuẩn bị CP3; thu hẹp lõi A1 về trả lời / hỏi lại / dừng khi thiếu căn cứ |
| 20:50 17/9 | Chạy 3 lượt eval: 70% -> 75% -> 90% | Sửa ranh giới route từ failure thật; giữ nguyên 2 case lỗi domain ở lượt cuối |
