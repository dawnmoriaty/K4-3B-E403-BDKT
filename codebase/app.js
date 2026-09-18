const tutor = document.getElementById("tutor");
const lessonPanel = document.getElementById("lesson-panel");
const chatThread = document.getElementById("chat-thread");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const feedbackModal = document.getElementById("feedback-modal");
const feedbackForm = document.getElementById("feedback-form");
const feedbackReason = document.getElementById("feedback-reason");
const feedbackSource = document.getElementById("feedback-source");
const feedbackType = document.getElementById("feedback-type");
const sourceModal = document.getElementById("source-modal");
const sourceTitle = document.getElementById("source-title");
const sourceText = document.getElementById("source-text");
const sourceIdLabel = document.getElementById("source-id");
const toast = document.getElementById("toast");

let pendingQuestion = "";
let feedbackContext = {};
let courseSources = [
  { source_id: "SLIDE-65", title: "Chọn model theo tầng", text: "Tầng 2 rẻ mà mạnh là lựa chọn mặc định cho đa số việc hàng ngày. Chỉ nâng lên Tầng 1 khi bài toán thật sự khó và kết quả Tầng 2 chặn use case. Tầng 3 phù hợp khi cần self-host, kiểm soát dữ liệu hoặc chi phí ở quy mô lớn." },
  { source_id: "T06-083", title: "Next-token prediction", text: "Bản chất của LLM là dự đoán theo xác suất từ tiếp theo; dự đoán từ tiếp theo càng chính xác thì kết quả càng chính xác." },
];
let toastTimer;

function escapeHtml(value) {
  const node = document.createElement("div");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}

function setTutor(open) {
  tutor.classList.toggle("closed", !open);
  if (open) setTimeout(() => chatInput.focus(), 300);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function saveFeedback(entry) {
  const record = {
    case_id: `FB-${Date.now().toString(36).toUpperCase()}`,
    route_origin: entry.route_origin,
    question: entry.question,
    ai_output: entry.ai_output || "",
    citations: entry.citations || [],
    feedback_type: entry.feedback_type,
    reason: entry.reason || "",
    timestamp: new Date().toISOString(),
  };
  try {
    const history = JSON.parse(localStorage.getItem("vlearn_feedback_log") || "[]");
    history.push(record);
    localStorage.setItem("vlearn_feedback_log", JSON.stringify(history));
  } catch (error) {
    console.warn("Không thể lưu feedback vào localStorage", error);
  }
  return record;
}

function userMessage(text) {
  return `<div class="message-row message-row--user"><div class="user-bubble">${escapeHtml(text)}</div><span class="message-avatar user">P</span></div>`;
}

function tutorMessage(content) {
  return `<div class="message-row"><span class="message-avatar"><i class="fa-solid fa-robot"></i></span><div class="answer-card">${content}</div></div>`;
}

function appendTutorMessage(content) {
  chatThread.insertAdjacentHTML("beforeend", tutorMessage(content));
  chatThread.scrollTop = chatThread.scrollHeight;
}

function renderStart() {
  chatThread.innerHTML = `
    <div class="chat-start">
      <span class="chat-start__icon"><i class="fa-solid fa-book-open"></i></span>
      <h3>Hỏi về nội dung đang học</h3>
      <p>Nhập câu hỏi hoặc chọn một nội dung trên slide. Tutor sẽ ưu tiên bài hiện tại, sau đó mới tìm trong các bài khác của khóa.</p>
    </div>`;
}

function isOutOfScope(question) {
  const normalized = question.toLocaleLowerCase("vi");
  const cheating = ["đáp án quiz", "đáp án bài kiểm tra", "giải hoàn chỉnh", "làm hộ", "viết code giải hết", "thi hộ"];
  const unrelated = ["dự báo thời tiết", "kết quả bóng đá", "viết quảng cáo", "tư vấn chứng khoán", "kể chuyện cười"];
  return cheating.some((phrase) => normalized.includes(phrase)) || unrelated.some((phrase) => normalized.includes(phrase));
}

function renderRefusal(question) {
  pendingQuestion = "";
  chatThread.innerHTML = userMessage(question);
  appendTutorMessage(`
    <div class="status-badge status-badge--amber"><i class="fa-solid fa-shield-halved"></i> NGOÀI PHẠM VI HỖ TRỢ</div>
    <p>Mình không thể hỗ trợ yêu cầu này. Bạn có thể hỏi về khái niệm trong bài, xin gợi ý từng bước hoặc gửi phần bạn đã tự làm để được giải thích.</p>`);
}

function renderLoading(question, displayedQuestion) {
  chatThread.innerHTML = userMessage(displayedQuestion || question);
  appendTutorMessage(`
    <div class="flow-progress">
      <span class="flow-step complete"><i class="fa-solid fa-check"></i> Câu hỏi thuộc phạm vi học tập</span>
      <span class="flow-step active"><i class="fa-solid fa-spinner fa-spin"></i> Đang tra cứu corpus chính thức</span>
      <span class="flow-step"><i class="fa-regular fa-circle"></i> Kiểm tra căn cứ trực tiếp</span>
    </div>`);
}

function openSource(sourceId) {
  if (sourceId === "SLIDE-65" || sourceId.toLowerCase().includes("slide")) {
    const source = document.getElementById("source-tier-2");
    source.classList.remove("source-highlight");
    void source.offsetWidth;
    source.classList.add("source-highlight");
    source.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    showToast("Đã mở vị trí nguồn trên Slide 65");
    return;
  }
  const source = courseSources.find((item) => item.source_id === sourceId);
  sourceTitle.textContent = source?.title || "Đoạn tài liệu khóa học";
  sourceIdLabel.textContent = sourceId;
  sourceText.textContent = source?.text || "Không thể tải nội dung đoạn nguồn này.";
  sourceModal.hidden = false;
}

function sourceCards(sourceIds) {
  return sourceIds.map((sourceId) => `
    <div class="source-card">
      <span class="source-icon"><i class="fa-solid fa-book-open"></i></span>
      <div><strong>${escapeHtml(sourceId)}</strong><small>Nguồn chính thức của khóa học</small></div>
      <button onclick="openSource('${escapeHtml(sourceId)}')">Mở nguồn</button>
    </div>`).join("");
}

function renderGrounded(displayedQuestion, result) {
  const sourceIds = Array.isArray(result.source_ids) ? result.source_ids : [];
  feedbackContext = { question: displayedQuestion, answer: result.answer, citations: sourceIds };
  chatThread.innerHTML = userMessage(displayedQuestion);
  appendTutorMessage(`
    <div class="status-badge status-badge--green"><i class="fa-solid fa-circle-check"></i> CÓ CĂN CỨ TRONG TÀI LIỆU</div>
    <p>${escapeHtml(result.answer)}</p>
    ${sourceCards(sourceIds)}
    <div class="answer-actions"><button class="text-action" onclick="openFeedback()"><i class="fa-regular fa-pen-to-square"></i> Đề xuất sửa</button></div>`);
}

function renderClarify(displayedQuestion, result) {
  pendingQuestion = displayedQuestion;
  chatThread.innerHTML = userMessage(displayedQuestion);
  appendTutorMessage(`
    <div class="status-badge status-badge--blue"><i class="fa-solid fa-magnifying-glass"></i> CẦN LÀM RÕ</div>
    <p>${escapeHtml(result.answer)}</p>`);
  chatInput.placeholder = "Nhập thông tin làm rõ...";
  chatInput.focus();
}

function externalReference(question) {
  const normalized = question.toLocaleLowerCase("vi");
  if (normalized.includes("deepseek") || normalized.includes("multi-head latent") || normalized.includes("mla")) {
    return {
      title: "DeepSeek-V3 Technical Report",
      description: "Tài liệu kỹ thuật bên ngoài khóa học có phần mô tả Multi-Head Latent Attention.",
      url: "https://arxiv.org/abs/2412.19437",
    };
  }
  return {
    title: "Kết quả tra cứu học thuật",
    description: "Mở kết quả tìm kiếm để tham khảo thêm. Nội dung này chưa được xác nhận là quy ước chính thức của khóa học.",
    url: `https://scholar.google.com/scholar?q=${encodeURIComponent(question)}`,
  };
}

function renderNoGrounding(displayedQuestion, result) {
  pendingQuestion = "";
  const reference = externalReference(displayedQuestion);
  const record = saveFeedback({
    route_origin: "no_grounding",
    question: displayedQuestion,
    ai_output: result.answer,
    citations: [reference.url],
    feedback_type: "missing_internal_grounding",
    reason: "Tự động ghi nhận do corpus chính thức không đủ căn cứ",
  });
  chatThread.innerHTML = userMessage(displayedQuestion);
  appendTutorMessage(`
    <div class="status-badge status-badge--amber"><i class="fa-solid fa-triangle-exclamation"></i> CHƯA ĐỦ CĂN CỨ TRONG KHÓA HỌC</div>
    <p>${escapeHtml(result.answer)}</p>
    <div class="external-card" id="external-card">
      <button class="external-close" onclick="dismissExternal()" aria-label="Đóng nguồn ngoài"><i class="fa-solid fa-xmark"></i></button>
      <h3>NGUỒN NGOÀI · KHÔNG PHẢI NỘI DUNG CHÍNH THỨC</h3>
      <strong>${escapeHtml(reference.title)}</strong>
      <p>${escapeHtml(reference.description)}</p>
      <a href="${reference.url}" target="_blank" rel="noopener">Mở nguồn tham khảo <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
    </div>
    <div class="log-status"><i class="fa-solid fa-check"></i> Đã tự động lưu phản hồi ${record.case_id}</div>`);
}

function dismissExternal() {
  document.getElementById("external-card")?.remove();
  showToast("Đã đóng nguồn ngoài. Phản hồi nền vẫn được ghi nhận.");
}

function renderRequestError(displayedQuestion, message) {
  chatThread.innerHTML = userMessage(displayedQuestion);
  appendTutorMessage(`<div class="status-badge status-badge--amber"><i class="fa-solid fa-triangle-exclamation"></i> CHƯA THỂ KIỂM TRA NGUỒN</div><p>${escapeHtml(message)}. Vui lòng thử lại sau.</p>`);
}

function localTutorResult(question) {
  const normalized = question.toLocaleLowerCase("vi");
  const ambiguous = ["nó khác gì", "cái này", "tiếp tục đi", "giải thích nó", "slide đó"];
  if (ambiguous.some((phrase) => normalized.includes(phrase))) {
    return { route: "ASK_CLARIFY", answer: "Bạn đang muốn hỏi về khái niệm hoặc đoạn nào trên slide?", source_ids: [] };
  }
  if (normalized.includes("tầng 1") || normalized.includes("tầng 2") || normalized.includes("tầng 3") || normalized.includes("chọn model")) {
    return {
      route: "ANSWER_GROUNDED",
      answer: "Theo Slide 65, Tầng 2 là lựa chọn mặc định cho đa số công việc hàng ngày. Tầng 1 chỉ nên dùng khi tác vụ thật sự khó và Tầng 2 chưa đáp ứng; Tầng 3 phù hợp khi cần self-host, kiểm soát dữ liệu hoặc tối ưu chi phí ở quy mô lớn.",
      source_ids: ["SLIDE-65"],
    };
  }
  if (normalized.includes("next-token") || normalized.includes("token tiếp theo")) {
    return {
      route: "ANSWER_GROUNDED",
      answer: "Bản chất của LLM là dự đoán theo xác suất token tiếp theo dựa trên ngữ cảnh đã có.",
      source_ids: ["T06-083"],
    };
  }
  return {
    route: "ABSTAIN_ROUTE",
    answer: "Tôi chưa tìm thấy căn cứ trực tiếp trong tài liệu khóa học để trả lời chắc chắn và sẽ không tự suy đoán từ trí nhớ mô hình.",
    source_ids: [],
  };
}

async function askTutor(question, displayedQuestion = question, clarificationProvided = false) {
  renderLoading(question, displayedQuestion);
  if (window.location.protocol === "file:") {
    await new Promise((resolve) => setTimeout(resolve, 450));
    const result = localTutorResult(question);
    if (result.route === "ANSWER_GROUNDED") renderGrounded(displayedQuestion, result);
    else if (result.route === "ASK_CLARIFY") renderClarify(displayedQuestion, result);
    else renderNoGrounding(displayedQuestion, result);
    return;
  }
  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Không thể truy cập Tutor");
    chatInput.placeholder = "Hỏi về Slide 65 hoặc chọn một nội dung trên slide...";
    if (clarificationProvided && result.route === "ASK_CLARIFY") {
      result.route = "ABSTAIN_ROUTE";
      result.answer = "Tôi đã hiểu đối tượng bạn muốn tìm hiểu, nhưng corpus chính thức chưa có căn cứ trực tiếp để trả lời nội dung này. Tôi sẽ không tự suy đoán từ trí nhớ mô hình.";
      result.source_ids = [];
    }
    if (result.route === "ANSWER_GROUNDED") renderGrounded(displayedQuestion, result);
    else if (result.route === "ASK_CLARIFY") renderClarify(displayedQuestion, result);
    else renderNoGrounding(displayedQuestion, result);
  } catch (error) {
    const result = localTutorResult(question);
    if (result.route === "ANSWER_GROUNDED") renderGrounded(displayedQuestion, result);
    else if (result.route === "ASK_CLARIFY") renderClarify(displayedQuestion, result);
    else renderNoGrounding(displayedQuestion, result);
  }
}

function openFeedback() {
  feedbackReason.value = "";
  feedbackSource.value = "";
  feedbackModal.hidden = false;
  feedbackReason.focus();
}

function closeFeedback() {
  feedbackModal.hidden = true;
}

function closeSource() {
  sourceModal.hidden = true;
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = chatInput.value.trim();
  if (!input) return;
  chatInput.value = "";

  if (pendingQuestion) {
    const originalQuestion = pendingQuestion;
    pendingQuestion = "";
    askTutor(`Câu hỏi ban đầu: ${originalQuestion}\nThông tin làm rõ: ${input}`, input, true);
    return;
  }
  if (isOutOfScope(input)) {
    renderRefusal(input);
    return;
  }
  askTutor(input);
});

document.getElementById("open-tutor").addEventListener("click", () => setTutor(true));
document.getElementById("slide-ai").addEventListener("click", () => setTutor(true));
document.getElementById("close-tutor").addEventListener("click", () => setTutor(false));
document.getElementById("sidebar-toggle").addEventListener("click", () => lessonPanel.classList.toggle("collapsed"));
document.getElementById("sidebar-close").addEventListener("click", () => lessonPanel.classList.add("collapsed"));
document.getElementById("deepseek-trigger").addEventListener("click", () => {
  setTutor(true);
  chatInput.value = "DeepSeek-V3 dùng Multi-Head Latent Attention như thế nào?";
  chatInput.focus();
});
document.querySelectorAll(".work-card").forEach((card) => card.addEventListener("click", () => {
  setTutor(true);
  chatInput.value = card.dataset.question;
  chatInput.focus();
}));

document.getElementById("feedback-close").addEventListener("click", closeFeedback);
document.getElementById("feedback-cancel").addEventListener("click", closeFeedback);
feedbackModal.addEventListener("click", (event) => { if (event.target === feedbackModal) closeFeedback(); });
document.getElementById("source-close").addEventListener("click", closeSource);
sourceModal.addEventListener("click", (event) => { if (event.target === sourceModal) closeSource(); });
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!feedbackModal.hidden) closeFeedback();
  if (!sourceModal.hidden) closeSource();
});
feedbackForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const record = saveFeedback({
    route_origin: "grounded",
    question: feedbackContext.question,
    ai_output: feedbackContext.answer,
    citations: feedbackContext.citations,
    feedback_type: feedbackType.value,
    reason: `${feedbackReason.value.trim()}${feedbackSource.value.trim() ? ` | Nguồn đối chiếu: ${feedbackSource.value.trim()}` : ""}`,
  });
  closeFeedback();
  appendTutorMessage(`<div class="received-message"><i class="fa-solid fa-circle-check"></i><div><strong>Đã ghi nhận ${record.case_id}</strong><span>Bạn có thể tiếp tục học ngay.</span></div></div>`);
});

if (window.matchMedia("(max-width: 1000px)").matches) lessonPanel.classList.add("collapsed");
if (window.location.protocol !== "file:") {
  fetch("/course_context.json").then((response) => response.json()).then((sources) => { courseSources = sources; }).catch(() => {});
}
renderStart();
