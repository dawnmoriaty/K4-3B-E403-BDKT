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
- **Lát cắt MỘT CÂU:** Học viên hỏi về một khái niệm bài giảng → AI quyết định kiểm tra RAG nội bộ (slide/transcript), nếu không có thì gọi Tool Search ngoài có dẫn chứng kèm nhãn cảnh báo "Chưa xác thực từ giảng viên" và lưu vào hàng đợi duyệt → Trả về câu trả lời có nguồn trích dẫn rõ ràng và phân định rạch ròi mức độ tin cậy.
- **Non-goals (≥3 thứ KHÔNG build):**
  1. Không làm tính năng chat tự do ngoài phạm vi học tập (chặn chat linh tinh).
  2. Không tự động sinh code giải hoàn chỉnh bài Lab/Quiz (chống gian lận).
  3. Không tự động nạp tri thức ngoài vào Vector DB khi chưa có Giảng viên bấm duyệt.
- **Mức prototype nhắm tới:** [x] Mock (CP2)  [ ] Working (CP3)
  - *Phần mock:* Giao diện web tĩnh (`codebase/index.html`), cơ chế duyệt của giảng viên.
  - *Phần thật:* Gọi AI thật (Gemini / Claude qua 9router) ở quyết định RAG vs Web Search (CP3).
- **Automation:** [ ] augment  [x] conditional  [ ] automate  
  - *Lý do theo cost-of-error:* Kiến thức nội bộ có căn cứ xác thực thì tự động trả lời (Automate vì sai sửa rẻ). Kiến thức ngoài có nguy cơ làm học viên học sai/lệch barem thi (sai thì đắt), nên chỉ tăng cường có điều kiện (Conditional) kèm nhãn cảnh báo và giữ quyền quyết định cho Giảng viên.
- **§4b. Nguyên tắc đã áp dụng (HAX/PAIR):**
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | **HAX G2** (Làm rõ làm tốt đến đâu) | Gắn Badge Xanh `[100% Khớp giáo trình]` hoặc Badge Vàng `[Tham khảo ngoài — Chưa xác thực]`. |
  | **HAX G10** (Thu hẹp phạm vi khi nghi ngờ) | Khi RAG nội bộ không có, không tự bịa nguồn mà nói rõ bài giảng chưa đề cập và kích hoạt tool search có disclaimer. Từ chối giải hộ bài thi. |
  | **HAX G11** (Giải thích vì sao) | Mọi câu trả lời đều trỏ rõ số trang slide `[Slide 1, Trang 2, Đoạn T01-015]` hoặc link bài báo arXiv gốc. |
  | **PAIR Feedback & Control** | Giảng viên có quyền Duyệt / Bác bỏ câu trả lời ngoài giáo trình trước khi nạp vào bộ nhớ bài học. |

---

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8)
*(Chi tiết được mở rộng tại CP4)*:
1. *Nguồn sự thật:* RAG không thấy nguồn → Kích hoạt tool search ngoài, không hallucinate trang slide.
2. *Mơ hồ / thiếu thông tin:* Học viên hỏi cụt ("nó là gì?") → Hỏi lại 1 câu để xác định khái niệm cần giải thích.
3. *Ngoài phạm vi / thẩm quyền:* Học viên đòi code giải bài Lab 5 → Từ chối sư phạm, chỉ đưa Socratic hint.
4. *Đặc thù domain:* Tài liệu trên mạng dùng thư viện phiên bản mới khác với slide → Gắn cảnh báo lệch phiên bản.

---

## §6. Bốn đường đi của trải nghiệm
- **Happy path (Đường 1):** RAG nội bộ tìm thấy nguồn → Trả lời bám sát slide kèm trích dẫn số trang.
- **Low-confidence / Fallback (Đường 2):** RAG nội bộ thiếu → Kích hoạt Tool Search ngoài → Trả lời kèm nhãn vàng cảnh báo "Chưa xác thực".
- **Correction (Đường 3):** Giảng viên vào hàng đợi duyệt → Bấm phê duyệt → Tri thức được nạp vào Vector DB nội bộ.
- **Guardrail Failure (Đường 4):** Học viên hỏi đáp án bài nộp → AI từ chối giải hộ, hướng dẫn cách tự debug.

---

## §7. Kiểm thử
- Golden set: Dự kiến ≥20 case kiểm thử trong `eval/` phủ đủ 4 lớp lỗi.
- Quality bar: Cam kết tại CP4 (≥85% câu trả lời có trích dẫn chuẩn xác, 0% bịa nguồn nội bộ).

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
