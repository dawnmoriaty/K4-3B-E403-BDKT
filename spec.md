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
- **Lát cắt MỘT CÂU:** Học viên đang học trên VLearn Reader bấm hỏi/bôi đen một khái niệm bài học → AI Tutor quyết định đối chiếu RAG phân cấp (ưu tiên bài hiện tại → mở rộng toàn bộ 15 buổi khóa học → nếu không có mới gọi Tool Search ngoài có Disclaimer kèm đẩy vào Review Queue) → Trả về câu trả lời có nguồn trích dẫn số trang chính xác hoặc điều hướng sang bài học tương ứng, giúp học viên không bị lệch quy ước barem chấm thi.
- **Non-goals (≥3 thứ KHÔNG build):**
  1. Không làm tính năng chat tự do ngoài phạm vi học tập (chặn chat linh tinh).
  2. Không tự động sinh code giải hoàn chỉnh bài Lab/Quiz (chống gian lận).
  3. Không tự động nạp tri thức ngoài vào Vector DB khi chưa có Giảng viên/TA bấm duyệt.
- **Mức prototype hiện tại:** [ ] Mock (CP2)  [x] Working (CP3)
  - *Phần chạy giả lập (Mock):* Giao diện VLearn Reader mô phỏng pixel-perfect (`codebase/index.html`), cơ chế trượt mở AI Tutor Drawer, thanh chuyển đổi 4 kịch bản kiểm chứng, modal Review Queue của Giảng viên.
  - *Phần chạy thật (Working - CP3):* Backend `codebase/server.py` truy xuất các đoạn giáo trình tối thiểu trong `course_context.json`, gọi model OpenAI-compatible để quyết định `ANSWER_GROUNDED / ASK_CLARIFY / ABSTAIN_ROUTE`, rồi kiểm tra cứng citation theo allow-list. Prompt, phản hồi thô, route và latency được ghi vào `eval/*_traces.jsonl`.
  - *Chưa chạy thật:* Web search, Teacher Review Queue và thao tác nạp Vector DB vẫn là mock; prototype CP3 không tuyên bố các phần này đã được tích hợp.
- **Automation:** [ ] augment  [x] conditional  [ ] automate  
  - *Lý do theo chi phí sai sót (Cost-of-Error):* 
    - Khi câu hỏi có căn cứ chắc chắn trong bài giảng (>= alpha): Cost-of-error rất thấp vì học viên có thể kiểm chứng ngay tại Slide 65 (sai thì sửa rẻ) -> AI tự động trả lời kèm trích dẫn số trang (Automate).
    - Khi câu hỏi ngoài giáo trình (< beta) hoặc thuộc vùng xám mơ hồ: Cost-of-error cực kỳ đắt vì nếu AI bịa nguồn hoặc học viên tiếp thu kiến thức ngoài lệch quy ước khóa học, hậu quả là học viên làm sai bài Quiz chấm tự động, mất 10–15 phút hoang mang, đổ lỗi cho trợ giảng (học viên chịu thiệt, chi phí sửa đắt vì ảnh hưởng kết quả học tập). Vì vậy, hệ thống chọn mức **Conditional**: AI chỉ đưa câu trả lời kèm nhãn cảnh báo (Disclaimer màu vàng) và bắt buộc giữ cổng phê duyệt (Human-in-the-loop Gate) của Giảng viên/TA trước khi chính thức hóa kiến thức.
- **§4b. Nguyên tắc đã áp dụng (HAX/PAIR):**
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | **HAX G10** *(Bắt buộc - Thu hẹp phạm vi khi nghi ngờ)* | 1. Khi câu hỏi rơi vào vùng mơ hồ [beta, alpha) (VD: "DeepSeek có dùng được không?"), AI không đoán bừa mà hiển thị câu hỏi gạn lọc kèm 2 lựa chọn nhanh (Chips) để học viên chọn đúng ý định.<br>2. Khi học viên yêu cầu giải hộ bài Lab, AI từ chối giải trực tiếp và đưa ra gợi ý Socratic. |
  | **HAX G11** *(Giải thích vì sao)* | Mọi câu trả lời trong bài đều hiển thị số trang slide chính xác: `✅ TRONG BÀI GIẢNG · SLIDE TRANG 65` kèm nút `[Highlight slide]`. Câu trả lời ngoài bài nêu rõ link nguồn tra cứu gốc (arXiv:2412.19437) và lý do tài liệu Day 1 chưa đề cập. |
  | **HAX G8** *(Gạt bỏ dễ dàng)* | Nút `✕` trên góc phải Drawer cho phép học viên thu gọn khung chat ngay lập tức bằng 1 click; nút đóng Disclaimer cảnh báo để tập trung vào nội dung. |
  | **HAX G9** *(Sửa dễ dàng)* | Học viên có thể click lại vào các câu gợi ý trên slide để đổi prompt tức thì; Giảng viên trong Review Queue có nút `[Sửa nội dung]` trước khi bấm phê duyệt nạp vào Vector DB. |
  | **PAIR Feedback & Control** | Giữ quyền kiểm soát tuyệt đối cho con người qua giao diện Teacher Review Queue (`vlearn.dev/teacher/review`), biến kiến thức ngoài thành nguồn chuẩn chính thức. |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8)
*(Chi tiết được mở rộng tại CP4)*:
1. *Nguồn sự thật:* RAG bài hiện tại không thấy nguồn → Tự động mở rộng tìm kiếm trên toàn bộ 15 buổi của khóa học; nếu toàn khóa không có mới kích hoạt Web Search ngoài (không hallucinate trang slide và không báo động giả ra ngoài web khi bài khác đã dạy).
2. *Tham chiếu chéo buổi học (Cross-Lecture Scope Misrouting):* Học viên đang ở Day 3 hỏi lại khái niệm nền tảng ở Day 1 (hoặc đang ở Day 1 hỏi ứng dụng nâng cao ở Day 5). Nếu chỉ RAG bài hiện tại sẽ kết luận nhầm là "ngoài giáo trình" (False Negative) → Hệ thống tự động truy xuất Global Course Corpus và trích dẫn số trang của buổi học tương ứng kèm liên kết điều hướng.
3. *Mơ hồ / thiếu thông tin:* Học viên hỏi cụt ("nó là gì?", "dùng được không?") → Kích hoạt HAX G10 hỏi lại 1 câu kèm lựa chọn nhanh (Chips) để xác định đúng phạm vi trước khi trả lời.
4. *Ngoài phạm vi / thẩm quyền:* Học viên đòi code giải hoàn chỉnh bài Lab 5 / Quiz → Từ chối sư phạm, chỉ đưa gợi ý phương pháp debug Socratic.
5. *Đặc thù domain:* Tài liệu trên mạng dùng phiên bản thư viện mới khác với quy ước slide → Gắn cảnh báo lệch phiên bản để học viên không mất điểm bài thi.

---

## §6. Bốn đường đi của trải nghiệm (Khối Rubric R3)
1. **Đường thuận lợi khi AI tự tin cao (Happy Path - Confidence >= alpha):**
   - *1a. Trúng bài học hiện tại (Local Match):* Học viên hỏi khái niệm có sẵn trên Slide trang 65 ("Khi nào nên chọn Tầng 2 thay vì Tầng 1?"). RAG nội bộ trích xuất trực tiếp đoạn Tầng 2, trả lời cô đọng và gắn Badge Xanh: `✅ ĐÃ XÁC THỰC TRONG BÀI GIẢNG · SLIDE TRANG 65` kèm nút bấm highlight vùng trên slide.
   - *1b. Trúng bài học khác trong khóa (Cross-Lecture Match):* Học viên đang ở Day 3 hỏi lại kiến thức Day 1 ("Khái niệm này liên hệ gì với Next-Token Prediction ở Day 1?"). RAG mở rộng toàn khóa học tìm thấy ở Day 1, trả lời cô đọng và gắn Badge Xanh Lam: `📘 THUỘC GIÁO TRÌNH KHÓA HỌC · BÀI DAY 01 (TRANG 12)` kèm nút bấm `[🔗 Chuyển đến Slide Day 01]`, không nhảy ra ngoài web search.
   - *Nguyên tắc:* HAX G11, HAX G2 & PAIR Continuity.

2. **Đường xử lý khi AI thiếu tự tin (Low-Confidence / Ambiguity - Lớp chỗ khó ②):**
   - *Tình huống:* Học viên hỏi câu ngắn, đa nghĩa: *"DeepSeek có dùng được không?"*.
   - *Hành vi hệ thống:* Tri-Band Router xác định độ tin cậy nằm trong dải xám [beta, alpha). Áp dụng **HAX G10**, AI phản hồi: *"DeepSeek xuất hiện ở cả mục Self-host và API ngoài bài giảng. Để đối chiếu chuẩn nhất với Slide trang 65, bạn đang muốn hỏi về khía cạnh nào?"* kèm 2 Chips bấm nhanh (Option 1: Tầng 3 Self-host bảo mật dữ liệu; Option 2: So sánh chi phí API với Tầng 2).
   - *Nguyên tắc:* HAX G10 & HAX G9.

3. **Đường xử lý khi không tìm thấy căn cứ nội bộ (Failure / No-grounding - Lớp chỗ khó ①):**
   - *Tình huống:* Học viên hỏi khái niệm nâng cao chưa được dạy: *"DeepSeek-V3 dùng kiến trúc Multi-Head Latent Attention (MLA) là gì và có trong bài giảng không?"*.
   - *Hành vi hệ thống:* RAG Evaluator nhận diện tài liệu Day 1 không có định nghĩa MLA (< beta). Hệ thống kích hoạt Tool Calling tra cứu Web Whitelist (arXiv/Docs chính thống). Sinh câu trả lời kèm **Badge Vàng Cảnh Báo Nổi Bật**: `⚠️ THAM KHẢO NGOÀI — CHƯA ĐƯỢC GIẢNG VIÊN XÁC THỰC`, kèm ghi chú: *"Khái niệm này chưa nằm trong barem chấm thi của Day 1. Hãy bám sát quy ước Tầng 1/2/3 trong slide để làm quiz"*. Đồng thời tự động đẩy câu trả lời vào Review Queue của Giảng viên.
   - *Nguyên tắc:* HAX G10, HAX G11 & PAIR Uncertainty.

4. **Cơ chế cho phép con người sửa trực tiếp kết quả (Correction / Human-in-the-loop):**
   - *Tình huống:* Giảng viên/TA mở modal Review Queue, kiểm tra câu trả lời về kiến trúc MLA mà AI đã tra cứu từ arXiv.
   - *Hành vi hệ thống:* Giảng viên bấm `[✅ Phê duyệt & Nạp vào Vector DB]` (hoặc chỉnh sửa văn phong). Hệ thống nạp chunk tri thức mới vào Vector DB nội bộ. Ngay lập tức, Badge câu trả lời trong phiên học viên chuyển thành `🌟 ĐÃ ĐƯỢC GIẢNG VIÊN XÁC THỰC`, và toàn bộ học viên khác trong lớp khi hỏi về khái niệm này sau đó sẽ được phục vụ trực tiếp bằng nguồn chuẩn chính thức (Data Flywheel).
   - *Nguyên tắc:* PAIR Feedback & Control & HAX G9.

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
