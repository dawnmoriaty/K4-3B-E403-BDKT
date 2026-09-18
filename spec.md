# AI SPEC — Xác Thực Nguồn Cho VLearn Tutor · Nhóm BDKT · Phòng E403

**Hướng:** [x] A — VLearn [ ] B — Trợ lý Học viên [ ] C — Làn mở  
**Loại:** [x] Tối ưu tính năng có sẵn [ ] Tính năng mới

---

## §1. User & Job

- **Job executor + workflow:** Học viên khóa AI20k (Lớp 3B) đang trong buổi học hoặc tự ôn tập bài vào buổi tối trên hệ thống VLearn. Khi gặp một khái niệm khó hiểu hoặc câu hỏi mở rộng, học viên bôi đen đoạn tài liệu/slide và đặt câu hỏi cho AI Tutor.
- **Core JTBD (không có tên AI/sản phẩm):** Xác minh và làm rõ ý nghĩa của một khái niệm bài giảng dựa trên căn cứ giáo trình chính thức để hiểu sâu và tự tin làm bài tập/quiz.
- **Problem statement (KHÔNG có chữ AI):** Người học khi gặp khái niệm chưa rõ thường nhận được lời giải thích chung chung, không rõ xuất xứ trang slide hay vị trí bài học, hoặc giải thích sai lệch quy ước so với barem của giảng viên; người học buộc phải tự tua lại video hoặc tìm kiếm ngoài mất từ 5 phút trở lên nhưng vẫn lo lắng làm sai bài kiểm tra.
- **Evidence (đạt cả chuẩn A và chuẩn B):**
  - **Chuẩn A — Khảo sát thực tế Mom Test ([Live Google Sheet Tracking](https://docs.google.com/spreadsheets/d/1Z6wkMffmJIfkfRHMmfdtY8WO4S7_ohOSa2YAxVl7PtY/edit?gid=494808561#gid=494808561) & `validation/survey_responses.csv`):**
    - Đã khảo sát **24 học viên ngoài nhóm** trong phòng E403/E402, có đầy đủ mã học viên và câu trả lời nguyên văn:
    - **66,7% (16/24 bạn)** xác nhận từng gặp trường hợp AI Tutor giải thích nghe hợp lý nhưng khi kiểm tra lại không khớp nội dung giáo viên dạy hoặc barem chấm quiz, khiến bản thân hoang mang hoặc lo ngại mất điểm.
    - **83,3% (20/24 bạn)** phải dùng giải pháp thay thế thủ công: tự mở lại slide/video để tua tìm hoặc tra cứu Google/ChatGPT.
    - **62,5% (15/24 bạn)** mất từ 5 phút trở lên cho mỗi lần tự kiểm chứng lại kiến thức.
  - **Chuẩn B — Mining dữ liệu thật (`data/vlearn-pack/chatlog/tutor_turns.csv`):**
    - Tổng số mẫu: 13.494 lượt hỏi-đáp.
    - **3.781 / 13.494 lượt phản hồi của tutor (28.02%)** có trường trích dẫn rỗng (`has_citation = False`).
    - Riêng Khóa 4 (từ ngày 09/09/2026): **839 / 3.097 lượt (27.09%)** câu trả lời bị thiếu trích dẫn.
    - Tutor gần như không có phản xạ hỏi ngược để làm rõ câu hỏi mơ hồ: chỉ 28 / 13.494 lượt (0.2%).
    - ≥5 ví dụ nguyên văn trong log:
      1. `T00009`: Học viên yêu cầu: _"Hãy giải thích ngắn gọn LLM là gì và trích dẫn slide"_ → Tutor trả lời lý thuyết nhưng không hề trích dẫn số trang slide nào (`has_citation = False`).
      2. `T00018`: Học viên hỏi thông tin chương trình khóa học → Tutor báo không tìm thấy nhưng không đưa ra nguồn thay thế hay kênh hỗ trợ.
      3. `T10288`: Học viên K4 hỏi về môi trường baseline → Trả lời không có căn cứ cụ thể.
      4. `T10289`: Học viên K4 hỏi lại lần 2 do câu trả lời trước chưa rõ nguồn.
      5. `T10291`: Học viên hỏi nên ôn phần nào trước → Tutor trả lời cảm tính, không dựa vào mastery state.

---

## §2. Impact & quyết định chọn

- **Bảng impact 3 ứng viên:**

| Ứng viên tính năng                                                                       | Bao nhiêu người gặp                                               | Tần suất                 | Mỗi lần tốn gì                                           |              Build nổi trong 39h?              |  Chọn?   |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------ | -------------------------------------------------------- | :--------------------------------------------: | :------: |
| **1. Xác thực nguồn phân cấp (RAG + Nguồn ngoài có nhãn cảnh báo + Ghi log theo nhánh)** | 66,7% học viên khảo sát; 28% log chat thiếu citation (3.781 lượt) | Hàng ngày, mỗi buổi học  | từ 5 phút trở lên để tự kiểm chứng, nguy cơ làm sai quiz |  Khả thi (RAG + Guardrail + Drawer phản hồi)   | **CHỌN** |
| **2. Tự động sinh Flashcard ôn tập cá nhân**                                             | ~35% học viên có nhu cầu                                          | Cuối tuần / trước kỳ thi | 20 phút tự ghi chép                                      |   Cần lưu trữ state phức tạp, khó test chuẩn   |   Loại   |
| **3. Socratic Tutor (Luôn hỏi ngược học viên)**                                          | ~25% học viên kiên nhẫn                                           | Mỗi lần bí bài           | Học viên dễ bực bội nếu đang cần câu trả lời gấp         | Dễ gây ức chế người dùng nếu prompt chưa chuẩn |   Loại   |

- **Ứng viên ĐÃ LOẠI + vì sao:**
  - _Flashcard ôn tập cá nhân:_ Bằng chứng chưa đủ nhức nhối (học viên chủ yếu cần qua bài tập trước mắt).
  - _Socratic Tutor bắt buộc:_ Rủi ro cao gây khó chịu cho học viên khi đang làm bài thi cần tra cứu gấp.
- **Ứng viên CHỌN + vì sao (bằng số):** Chọn **Ứng viên 1** vì giải quyết đúng **66,7% học viên bị hoang mang/mất điểm** và khắc phục trực tiếp **28% lỗi không citation trong 13.494 lượt chat thực tế**, đồng thời giải quyết triệt để bài toán "Biết mình không biết".

---

## §3. Giải pháp tương tự đã nghiên cứu

- **NotebookLM:**
  - _Flow:_ RAG thuần túy bám sát tài liệu upload, trích dẫn số trang cạnh từng câu.
  - _Đáng học:_ Trích dẫn trực quan click vào nhảy đến đúng đoạn nguồn.
  - _Đáng né:_ Hoàn toàn bế tắc khi tài liệu upload thiếu thông tin (trả lời "Tôi không tìm thấy trong nguồn").
  - _Mình khác gì:_ Khi tài liệu nội bộ thiếu, hệ thống tự động tra cứu nguồn ngoài có dẫn chứng nhưng gắn nhãn cảnh báo nổi bật và tự động lưu log nền `route_origin=no_grounding`.
- **Perplexity AI:**
  - _Flow:_ Web search tổng hợp kèm footnote trích dẫn.
  - _Đáng học:_ Tự động tìm kiếm nguồn mở rộng cực nhanh.
  - _Đáng né:_ Không phân biệt được đâu là "tài liệu chính thức của khóa học" và đâu là "kiến thức tham khảo trên mạng", dễ gây lệch quy ước bài học.
  - _Mình khác gì:_ Phân định rạch ròi 2 cấp độ: Badge Xanh (Có căn cứ trong tài liệu khóa học) vs Khối Nguồn Ngoài Tách Biệt (Nhãn cảnh báo: Nguồn ngoài · Không phải nội dung chính thức).

---

## §4. Thiết kế

- **Lát cắt MỘT CÂU:** Học viên đang học trên VLearn hỏi một khái niệm → Tutor quyết định trả lời có căn cứ, hỏi lại khi mơ hồ hoặc dừng khi thiếu nguồn → học viên biết câu trả lời dựa trên đâu và cần làm gì tiếp theo.
- **Non-goals (≥3 thứ KHÔNG build):**
  1. Không làm tính năng chat tự do ngoài phạm vi học tập (chặn chat ngoài lề).
  2. Không tự động sinh code giải hoàn chỉnh bài Lab/Quiz (chống gian lận học thuật).
  3. Không tự ý biến kiến thức nguồn ngoài thành nội dung chính thức của khóa học khi chưa có quy trình kiểm duyệt nội bộ.
- **Mức prototype hiện tại:** [ ] Mock (CP2) [x] Working (CP3)
  - _Phần chạy giả lập (Mock):_ Giao diện VLearn Reader mô phỏng (`codebase/index.html`), cơ chế trượt mở AI Tutor Drawer, thanh chuyển đổi 5 kịch bản kiểm chứng, modal hiển thị nguồn ngoài và form đề xuất sửa.
  - _Phần chạy thật (Working - CP3):_ Backend `codebase/server.py` truy xuất các đoạn giáo trình tối thiểu trong `course_context.json`, gọi model OpenAI-compatible để quyết định `ANSWER_GROUNDED / ASK_CLARIFY / ABSTAIN_ROUTE`, rồi kiểm tra cứng citation theo allow-list. Prompt, phản hồi thô, route và latency được ghi vào `eval/*_traces.jsonl`.
  - _Chưa chạy thật:_ Web search thời gian thực và quy trình xử lý nội bộ của Dev team sau log vẫn là mô phỏng ở CP2; prototype không tuyên bố các phần này đã chạy thật.
- **Automation:** [ ] augment [x] conditional [ ] automate
  - _Lý do theo chi phí sai sót (Cost-of-Error):_
    - Khi câu hỏi có căn cứ chắc chắn trong giáo trình: Cost-of-error thấp vì học viên tự đối chiếu được ngay trên trang slide (sai thì sửa rẻ) -> AI tự động trả lời kèm trích dẫn mã đoạn/trang (Automate).
    - Khi câu hỏi thiếu căn cứ (< beta) hoặc mơ hồ: Cost-of-error rất đắt vì nếu AI suy đoán bừa bãi, học viên sẽ tiếp thu sai quy ước khóa học, dẫn đến làm sai bài kiểm tra tự động và mất điểm. Vì vậy, hệ thống chọn mức **Conditional**: AI dừng kết luận chuyên môn, hiển thị nguồn ngoài với nhãn cảnh báo nổi bật, và luôn lưu log phản hồi kèm nhánh phát sinh (`route_origin`) để Dev team có dữ liệu rà soát mà không chặn luồng học của người dùng.
- **Ba Tác Nhân & Phân Quyền Vận Hành:**
  1. **Học viên:** Bôi đen đoạn slide hoặc nhập câu hỏi; kiểm tra nguồn; yêu cầu làm rõ hoặc bấm `Đề xuất sửa` khi phát hiện sai.
  2. **AI Tutor Engine:** Kiểm tra phạm vi và độ đầy đủ của input; đối chiếu RAG phân cấp (ưu tiên bài hiện tại → mở rộng toàn khóa); trả lời, hỏi lại hoặc dừng đúng lúc.
  3. **Dev team:** Nhận log phản hồi ẩn danh có phân nhánh rõ ràng (`grounded` vs `no_grounding`) để chạy regression test và tối ưu hệ thống; quy trình nội bộ diễn ra sau khi nhận log.
- **§4b. Nguyên tắc đã áp dụng (HAX/PAIR):**
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | **HAX G10 — Thu hẹp phạm vi khi nghi ngờ** | 1. Nút `Clear`: Khi input mơ hồ/thiếu đối tượng (VD: "DeepSeek có dùng được không?"), AI hỏi đúng 1 câu làm rõ kèm 2 lựa chọn nhanh (Chips) thay vì đoán mò.<br>2. Nút `Evidence`: Khi căn cứ chưa đủ hoặc có mâu thuẫn, Tutor không tự suy diễn mà thông báo chưa đủ căn cứ; từ chối dứt khoát yêu cầu giải hộ bài Lab. |
  | **HAX G11 — Giải thích vì sao** | Câu trả lời grounded hiển thị rõ mã đoạn/trang slide: `✅ CÓ CĂN CỨ TRONG TÀI LIỆU · SLIDE TRANG 65` kèm nút `[Mở nguồn]`. Câu trả lời no-grounding nói rõ giáo trình chưa đề cập và gắn nhãn: `⚠️ NGUỒN NGOÀI · KHÔNG PHẢI NỘI DUNG CHÍNH THỨC`. |
  | **HAX G8 — Gạt bỏ dễ dàng** | Nút `✕` trên góc phải Drawer cho phép học viên thu gọn khung chat ngay lập tức; học viên có thể đóng khối nguồn ngoài bất cứ lúc nào; việc lưu log diễn ra tự động ở nền và không chặn phiên học. |
  | **HAX G9 — Sửa dễ dàng** | Nút `[Đề xuất sửa]` cho phép học viên ghi rõ nội dung hoặc citation cần kiểm tra khi phát hiện phản hồi chưa chính xác; học viên có thể click vào gợi ý trên slide để đổi prompt nhanh. |
  | **PAIR Feedback & Control** | Phản hồi được lưu có cấu trúc và truy vết được về đúng nhánh trải nghiệm (`route_origin: grounded` hoặc `no_grounding`), kiểm soát chặt chẽ không để kiến thức ngoài tự động nạp vào giáo trình chính thức. |

---

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8)

Hệ thống xử lý đầy đủ 4 lớp chỗ khó theo taxonomy của hackathon với các kịch bản cụ thể:

1. **Lớp ① — Nguồn sự thật (Truth & Grounding):**
   - _Kịch bản 1 (Thiếu căn cứ toàn khóa):_ Học viên hỏi khái niệm nâng cao chưa dạy (VD: _"Kiến trúc Multi-Head Latent Attention - MLA của DeepSeek-V3 là gì?"_). Hệ thống không tìm thấy căn cứ trong giáo trình → Dừng sinh kiến thức tự do, tự động kích hoạt tra cứu nguồn ngoài có dẫn chứng kèm nhãn cảnh báo nổi bật: `NGUỒN NGOÀI · KHÔNG PHẢI NỘI DUNG CHÍNH THỨC`, đồng thời tự động ghi log nền `route_origin=no_grounding`.
   - _Kịch bản 2 (Citation yếu / không hỗ trợ claim):_ RAG tìm thấy đoạn có chứa từ khóa nhưng nội dung đoạn không trực tiếp trả lời câu hỏi → Source Gate chặn không cho gắn nhãn grounded; chuyển sang nhánh thông báo thiếu căn cứ để tránh ngụy tạo bằng chứng.

2. **Lớp ② — Mơ hồ / thiếu thông tin (Ambiguity & Underspecification):**
   - _Kịch bản 3 (Thiếu đối tượng so sánh):_ Học viên nhập câu ngắn: _"Nó khác gì?"_ hoặc _"DeepSeek có dùng được không?"_ → Kích hoạt HAX G10, Tutor hỏi đúng một câu làm rõ: _"Bạn đang muốn so sánh Tầng 2 với Tầng 1 hay Tầng 3?"_ kèm 2 Chips bấm nhanh, không tự phỏng đoán ý định.
   - _Kịch bản 4 (Mất ngữ cảnh đàm thoại):_ Học viên nhập _"tiếp tục đi"_ hoặc _"slide đó sai ở đâu?"_ nhưng thiếu ngữ cảnh lượt chat trước → Tutor yêu cầu cung cấp rõ khái niệm hoặc chọn lại đoạn slide cần hỏi.

3. **Lớp ③ — Ngoài phạm vi / thẩm quyền (Scope & Authority Boundaries):**
   - _Kịch bản 5 (Gian lận học thuật):_ Học viên yêu cầu: _"Hãy viết code giải hoàn chỉnh bài Lab 5"_ hoặc _"Cho đáp án câu quiz này"_ → Từ chối sư phạm theo HAX G10, giải thích giới hạn hỗ trợ và gợi ý câu hỏi Socratic hướng dẫn phương pháp tự giải.
   - _Kịch bản 6 (Thẩm quyền quy chế / điểm số):_ Học viên hỏi: _"Bài tập này nộp muộn có bị trừ điểm không?"_ hoặc _"Quy định điểm danh của lớp thế nào?"_ → Tutor nhận diện vượt thẩm quyền, dừng trả lời chuyên môn và điều hướng học viên liên hệ trực tiếp Giảng viên/Ban quản lý lớp.

4. **Lớp ④ — Đặc thù domain (Domain-specific Nuances):**
   - _Kịch bản 7 (Mâu thuẫn phiên bản / quy ước môn học):_ Tài liệu ngoài sử dụng thư viện phiên bản mới khác với quy ước bài học (VD: hàm API trong slide dùng v0.4 nhưng trên mạng dùng v1.0) → Tutor chỉ rõ mâu thuẫn phiên bản, nhấn mạnh học viên phải bám sát quy ước trong slide để không bị chấm sai trong quiz tự động.
   - _Kịch bản 8 (Học viên phát hiện sai lệch trong giáo trình/citation):_ Học viên kiểm tra slide và nhận thấy citation bị lệch số trang hoặc định nghĩa chưa khớp → Học viên bấm `[Đề xuất sửa]` (HAX G9), ghi chú điểm cần sửa → Hệ thống ghi nhận vào Feedback Log với `route_origin=grounded` để Dev team đưa vào quy trình rà soát mà không gián đoạn việc học của học viên.

---

## §6. Bốn đường đi của trải nghiệm (Khối Rubric R3)

| Đường đi                      | Trigger & Tình huống thực tế                                                                                                                                                                      | Hành vi mong muốn của AI Tutor                                                                                                                                                                                               | Vị trí kiểm chứng trên Prototype                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **1. Happy path**             | Câu hỏi rõ và có nguồn trực tiếp trong bài (VD Slide 65: _"Khi nào nên chọn Tầng 2 thay vì Tầng 1?"_) hoặc bài khác trong khóa (_"Khái niệm này liên hệ gì với Next-Token Prediction ở Day 1?"_). | Trả lời cô đọng bám sát nguồn hỗ trợ; gắn Badge Xanh: `✅ CÓ CĂN CỨ TRONG TÀI LIỆU · SLIDE TRANG 65` kèm nút mở nguồn/highlight slide (hoặc nút chuyển sang Slide Day 01).                                                   | Tab 1: **"1. Trong bài"** & Tab 5: **"5. Bài khác"** |
| **2. Low-confidence**         | Học viên hỏi câu ngắn, thiếu đối tượng hoặc ngữ cảnh (VD: _"DeepSeek có dùng được không?"_).                                                                                                      | Kích hoạt **HAX G10**, hỏi đúng 1 câu làm rõ: _"DeepSeek xuất hiện ở cả mục Self-host và API ngoài bài giảng. Để đối chiếu chuẩn nhất với Slide 65, bạn đang muốn hỏi về khía cạnh nào?"_ kèm 2 Chips lựa chọn nhanh.        | Tab 2: **"2. Mơ hồ (G10)"**                          |
| **3. Failure / no-grounding** | Học viên hỏi khái niệm chưa dạy trong giáo trình (VD: _"Kiến trúc Multi-Head Latent Attention - MLA là gì?"_).                                                                                    | Dừng sinh kiến thức tự do. Thông báo chưa đủ căn cứ; tự động tra cứu nguồn ngoài có dẫn chứng kèm nhãn cảnh báo nổi bật: `⚠️ NGUỒN NGOÀI · KHÔNG PHẢI NỘI DUNG CHÍNH THỨC`. Tự động lưu log nền `route_origin=no_grounding`. | Tab 3: **"3. Ngoài bài"**                            |
| **4. Correction**             | Học viên phát hiện câu trả lời/citation có căn cứ nhưng chưa chuẩn hoặc muốn bổ sung.                                                                                                             | Học viên bấm `[Đề xuất sửa]` (HAX G9), nhập nội dung/citation cần kiểm tra. Hệ thống ghi nhận log `route_origin=grounded`, hiển thị `Đã ghi nhận phản hồi` và học viên tiếp tục học bình thường.                             | Tab 4: **"4. Đề xuất sửa"**                          |

_Ghi chú quan trọng:_

- Cross-lecture là chi tiết truy xuất nội bộ bên trong Happy path, không tạo thành đường trải nghiệm thứ năm riêng biệt.
- Nhánh từ chối gian lận là hàng rào liêm chính học thuật bổ trợ, không thay thế 4 đường đi trên.

---

## §7. Kiểm thử

- **Golden set:** `eval/golden_set.csv` có 20 case K4 phát triển từ chatlog thật: 5 case/lớp cho đủ 4 lớp chỗ khó; 10 common, 8 edge và 2 rare. Mỗi case giữ `source_turn_id`, route mong đợi, nguồn được phép và hành vi cấm.
- **Chiều chất lượng kiểm chứng được:** (1) route đúng; (2) mọi citation thuộc allow-list của case; (3) case mơ hồ phải hỏi lại một câu; (4) case thiếu căn cứ không được trả citation hoặc biến suy đoán thành kiến thức khóa học.
- **Quality bar chốt cho CP3/CP4:** đạt khi **≥85% case qua toàn bộ kiểm tra**, đồng thời có **0 citation nội bộ bị bịa**. Tính đúng về ngữ nghĩa của ít nhất 5 câu grounded phải được hai thành viên chấm độc lập; lệch ≥2/5 thì viết lại rubric trước khi chốt CP4.
- **Lượt đo 1:** chạy bằng `python eval/run_eval.py`; kết quả đầy đủ nằm tại `eval/run_001.csv`, trace tại `eval/run_001_traces.jsonl`, thống kê và case lỗi tại `eval/run_001_summary.md`.
- **Kết quả thực nghiệm:** Run 1 đạt **14/20 (70%)**, dưới quality bar; nguyên nhân gồm 1 lỗi mạng và 5 lỗi ranh giới clarify/abstain. Sau hai vòng sửa prompt nhưng không đổi golden label hay quality bar, Run 2 đạt **15/20 (75%)** và Run 3 đạt **18/20 (90%)**, với **0 citation ngoài allow-list**. Hai case domain còn lỗi được giữ nguyên tại `eval/run_003_summary.md`.
- **Phần người chấm:** hai thành viên điền độc lập `eval/manual_review_5.csv` cho 5 câu grounded; kiểm tra tự động hiện chưa chứng minh đầy đủ tính đúng ngữ nghĩa. Kết quả đã review độc lập 5 câu; có 1/5 bất đồng, dưới ngưỡng ≥2/5 nên giữ rubric.

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

| Thời điểm  | Đổi gì                                                         | Vì sao (trỏ về feedback/case nào)                                                                                                                                                            |
| ---------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 19:15 17/9 | Thêm số liệu khảo sát 24 học viên                              | Hoàn thiện chuẩn A cho mốc CP1                                                                                                                                                               |
| 19:25 17/9 | Hoàn thành Spec §1, §2, §4, §6                                 | Đồng bộ luồng nghiệp vụ và bản mock CP2                                                                                                                                                      |
| 20:30 17/9 | Tích hợp backend AI thật, source gate và golden set 20 case    | Chuẩn bị CP3; thu hẹp lõi A1 về trả lời / hỏi lại / dừng khi thiếu căn cứ                                                                                                                    |
| 20:50 17/9 | Chạy 3 lượt eval: 70% -> 75% -> 90%                            | Sửa ranh giới route từ failure thật; giữ nguyên 2 case lỗi domain ở lượt cuối                                                                                                                |
| 00:30 18/9 | Đồng bộ toàn diện Spec §4, §5, §6 theo `flowchart.md` mới nhất | Chốt phạm vi CP2: 3 tác nhân, tự động hiển thị nguồn ngoài kèm nhãn cảnh báo nổi bật, ghi log phân nhánh `route_origin` (grounded vs no_grounding), bổ sung 8 kịch bản lỗi phủ 4 lớp chỗ khó |
