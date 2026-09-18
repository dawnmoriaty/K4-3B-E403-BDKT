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
const historyModal = document.getElementById("history-modal");
const historyList = document.getElementById("history-list");
const sessionTitle = document.getElementById("session-title");
const sessionState = document.getElementById("session-state");
const newChatButton = document.getElementById("new-chat");
const endChatButton = document.getElementById("end-chat");
const historyButton = document.getElementById("chat-history");

let pendingQuestion = "";
let feedbackContext = {};
let chatSessions = [];
let activeSessionId = "";
let requestInFlight = false;
let courseSources = [
  { source_id: "D1-P26", source_type: "official_slide", pdf_page: 26, title: "Chọn model theo tầng", text: "Tầng 2 rẻ mà mạnh là lựa chọn mặc định cho đa số việc hàng ngày. Chỉ nâng lên Tầng 1 khi bài toán thật sự khó và kết quả Tầng 2 chặn use case. Tầng 3 phù hợp khi cần self-host, kiểm soát dữ liệu hoặc chi phí ở quy mô lớn." },
  { source_id: "T06-083", title: "Next-token prediction", text: "Bản chất của LLM là dự đoán theo xác suất từ tiếp theo; dự đoán từ tiếp theo càng chính xác thì kết quả càng chính xác." },
];
let toastTimer;
const CHAT_STORAGE_KEY = "vlearn_chat_sessions_v1";
const ACTIVE_SESSION_KEY = "vlearn_active_chat_session_v1";
const MAX_CHAT_SESSIONS = 30;

function escapeHtml(value) {
  const node = document.createElement("div");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}

function sessionId() {
  return window.crypto?.randomUUID?.() || `CHAT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function currentSession() {
  return chatSessions.find((session) => session.id === activeSessionId);
}

function makeSession() {
  const now = new Date().toISOString();
  return {
    id: sessionId(),
    title: "Phiên trò chuyện mới",
    createdAt: now,
    updatedAt: now,
    endedAt: null,
    html: "",
    pendingQuestion: "",
    feedbackContexts: {},
  };
}

function loadChatSessions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || "[]");
    if (Array.isArray(parsed)) {
      chatSessions = parsed.filter((session) => session && typeof session.id === "string").map((session) => ({
        id: session.id,
        title: String(session.title || "Phiên trò chuyện"),
        createdAt: session.createdAt || new Date().toISOString(),
        updatedAt: session.updatedAt || session.createdAt || new Date().toISOString(),
        endedAt: session.endedAt || null,
        html: typeof session.html === "string" ? session.html : "",
        pendingQuestion: String(session.pendingQuestion || ""),
        feedbackContexts: session.feedbackContexts && typeof session.feedbackContexts === "object" ? session.feedbackContexts : {},
      }));
    }
  } catch (error) {
    console.warn("Không thể đọc lịch sử chat", error);
  }
  const storedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY) || "";
  activeSessionId = chatSessions.some((session) => session.id === storedActiveId) ? storedActiveId : (chatSessions[0]?.id || "");
  if (!activeSessionId) {
    const session = makeSession();
    chatSessions = [session];
    activeSessionId = session.id;
  }
}

function persistChatSessions() {
  try {
    chatSessions.sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
    chatSessions = chatSessions.slice(0, MAX_CHAT_SESSIONS);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatSessions));
    localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
  } catch (error) {
    console.warn("Không thể lưu lịch sử chat", error);
    showToast("Bộ nhớ trình duyệt đã đầy, chưa thể lưu lịch sử.");
  }
}

function updateSessionUi() {
  const session = currentSession();
  if (!session) return;
  const ended = Boolean(session.endedAt);
  sessionTitle.textContent = session.title;
  sessionState.innerHTML = ended
    ? '<i class="fa-solid fa-circle"></i> Đã kết thúc'
    : '<i class="fa-solid fa-circle"></i> Đang hoạt động';
  sessionState.classList.toggle("ended", ended);
  chatInput.disabled = ended || requestInFlight;
  chatForm.querySelector("button").disabled = ended || requestInFlight;
  chatInput.placeholder = ended
    ? "Phiên này đã kết thúc. Hãy tạo phiên mới để tiếp tục."
    : (pendingQuestion ? "Nhập thông tin làm rõ..." : "Hỏi về trang đang đọc hoặc chọn một nội dung trên slide...");
  newChatButton.disabled = requestInFlight;
  endChatButton.disabled = ended || requestInFlight;
  historyButton.disabled = requestInFlight;
}

function restoreSession() {
  const session = currentSession();
  if (!session) return;
  pendingQuestion = session.pendingQuestion || "";
  feedbackContext = {};
  chatThread.innerHTML = session.html;
  if (!session.html) renderStart();
  updateSessionUi();
  chatThread.scrollTop = chatThread.scrollHeight;
}

function saveSession(question = "") {
  const session = currentSession();
  if (!session) return;
  session.html = chatThread.innerHTML;
  session.pendingQuestion = pendingQuestion;
  session.updatedAt = new Date().toISOString();
  if (question && session.title === "Phiên trò chuyện mới") {
    session.title = question.replace(/\s+/g, " ").slice(0, 52);
    if (question.length > 52) session.title += "…";
  }
  persistChatSessions();
  updateSessionUi();
}

function createNewSession() {
  if (requestInFlight) return;
  const session = makeSession();
  chatSessions.unshift(session);
  activeSessionId = session.id;
  pendingQuestion = "";
  persistChatSessions();
  restoreSession();
  historyModal.hidden = true;
  chatInput.focus();
  showToast("Đã tạo phiên trò chuyện mới.");
}

function endCurrentSession() {
  const session = currentSession();
  if (!session || session.endedAt || requestInFlight) return;
  session.endedAt = new Date().toISOString();
  pendingQuestion = "";
  session.pendingQuestion = "";
  chatThread.querySelector(".chat-start")?.remove();
  chatThread.insertAdjacentHTML("beforeend", `
    <div class="session-ended-note"><i class="fa-solid fa-lock"></i><div><strong>Phiên trò chuyện đã kết thúc</strong><span>Lịch sử được giữ lại. Tạo phiên mới để tiếp tục hỏi Tutor.</span></div></div>`);
  saveSession();
  showToast("Đã kết thúc và lưu phiên trò chuyện.");
}

function formatSessionTime(value) {
  try {
    return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  } catch (error) {
    return "";
  }
}

function renderHistory() {
  const ordered = [...chatSessions].sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
  historyList.innerHTML = ordered.map((session) => `
    <button type="button" class="history-item${session.id === activeSessionId ? " active" : ""}" data-session-id="${escapeHtml(session.id)}">
      <span class="history-item__icon"><i class="fa-${session.endedAt ? "solid fa-lock" : "regular fa-message"}"></i></span>
      <span class="history-item__content"><strong>${escapeHtml(session.title)}</strong><small>${formatSessionTime(session.updatedAt)} · ${session.endedAt ? "Đã kết thúc" : "Có thể tiếp tục"}</small></span>
      ${session.id === activeSessionId ? "<em>Đang mở</em>" : ""}
    </button>`).join("");
}

function openHistory() {
  renderHistory();
  historyModal.hidden = false;
}

function selectSession(id) {
  if (requestInFlight || !chatSessions.some((session) => session.id === id)) return;
  activeSessionId = id;
  persistChatSessions();
  restoreSession();
  historyModal.hidden = true;
}

function beginRequest() {
  requestInFlight = true;
  updateSessionUi();
}

function finishRequest() {
  requestInFlight = false;
  updateSessionUi();
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

function buildFeedback(entry) {
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

async function persistFeedback(entry) {
  const record = buildFeedback(entry);
  if (window.location.protocol === "file:") return record;
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!response.ok) throw new Error("Feedback backend unavailable");
    return await response.json();
  } catch (error) {
    console.warn("Feedback chỉ được lưu cục bộ", error);
    return record;
  }
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

function turnId() {
  return `TURN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function completeTurn(question, content, id = turnId()) {
  chatThread.querySelector(".chat-turn--pending")?.remove();
  chatThread.querySelector(".chat-start")?.remove();
  chatThread.insertAdjacentHTML("beforeend", `<div class="chat-turn" data-turn-id="${escapeHtml(id)}">${userMessage(question)}${tutorMessage(content)}</div>`);
  chatThread.scrollTop = chatThread.scrollHeight;
  saveSession(question);
  return id;
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
  completeTurn(question, `
    <div class="status-badge status-badge--amber"><i class="fa-solid fa-shield-halved"></i> NGOÀI PHẠM VI HỖ TRỢ</div>
    <p>Mình không thể hỗ trợ yêu cầu này. Bạn có thể hỏi về khái niệm trong bài, xin gợi ý từng bước hoặc gửi phần bạn đã tự làm để được giải thích.</p>`);
}

function renderLoading(question, displayedQuestion) {
  chatThread.querySelector(".chat-start")?.remove();
  chatThread.querySelector(".chat-turn--pending")?.remove();
  chatThread.insertAdjacentHTML("beforeend", `<div class="chat-turn chat-turn--pending">${userMessage(displayedQuestion || question)}${tutorMessage(`
    <div class="flow-progress">
      <span class="flow-step complete"><i class="fa-solid fa-check"></i> Câu hỏi thuộc phạm vi học tập</span>
      <span class="flow-step active"><i class="fa-solid fa-spinner fa-spin"></i> Đang tra cứu corpus chính thức</span>
      <span class="flow-step"><i class="fa-regular fa-circle"></i> Kiểm tra căn cứ trực tiếp</span>
    </div>`)}</div>`);
  chatThread.scrollTop = chatThread.scrollHeight;
}

async function openSource(sourceId) {
  if (sourceId === "D1-P26") {
    const source = document.getElementById("source-tier-2");
    source.classList.remove("source-highlight");
    void source.offsetWidth;
    source.classList.add("source-highlight");
    source.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    showToast("Đã định vị nguồn tại Day 1, trang PDF 26");
  }
  let source = courseSources.find((item) => item.source_id === sourceId);
  if ((!source || !source.text) && window.location.protocol !== "file:") {
    try {
      const response = await fetch(`/api/source?id=${encodeURIComponent(sourceId)}`);
      if (response.ok) {
        source = await response.json();
        courseSources = courseSources.filter((item) => item.source_id !== sourceId);
        courseSources.push(source);
      }
    } catch (error) {
      source = null;
    }
  }
  if (source?.source_type === "official_slide" && window.location.protocol !== "file:") {
    window.open(`/api/artifact?source_id=${encodeURIComponent(sourceId)}#page=${source.pdf_page}`, "_blank", "noopener");
    return;
  }
  sourceTitle.textContent = source?.title || "Đoạn tài liệu khóa học";
  sourceIdLabel.textContent = sourceId;
  sourceText.textContent = source?.text || "Không thể tải nội dung đoạn nguồn này.";
  sourceModal.hidden = false;
}

function sourceCards(sourceIds) {
  return sourceIds.map((sourceId) => {
    const source = courseSources.find((item) => item.source_id === sourceId);
    return `
    <div class="source-card">
      <span class="source-icon"><i class="fa-solid fa-book-open"></i></span>
      <div><strong>${escapeHtml(source?.title || sourceId)}</strong><small>${escapeHtml(source?.section || sourceId)} · Nguồn chính thức</small></div>
      <button onclick="openSource('${escapeHtml(sourceId)}')">Mở nguồn</button>
    </div>`;
  }).join("");
}

function renderGrounded(displayedQuestion, result) {
  const sourceIds = Array.isArray(result.source_ids) ? result.source_ids : [];
  for (const source of result.sources || []) {
    if (!courseSources.some((item) => item.source_id === source.source_id)) courseSources.push(source);
  }
  const id = turnId();
  const context = { question: displayedQuestion, answer: result.answer, citations: sourceIds };
  feedbackContext = context;
  currentSession().feedbackContexts[id] = context;
  completeTurn(displayedQuestion, `
    <div class="status-badge status-badge--green"><i class="fa-solid fa-circle-check"></i> CÓ CĂN CỨ TRONG TÀI LIỆU</div>
    <p>${escapeHtml(result.answer)}</p>
    ${sourceCards(sourceIds)}
    <div class="answer-actions"><button class="text-action" onclick="openFeedback('${id}')"><i class="fa-regular fa-pen-to-square"></i> Đề xuất sửa</button></div>`, id);
}

function renderClarify(displayedQuestion, result) {
  pendingQuestion = displayedQuestion;
  completeTurn(displayedQuestion, `
    <div class="status-badge status-badge--blue"><i class="fa-solid fa-magnifying-glass"></i> CẦN LÀM RÕ</div>
    <p>${escapeHtml(result.answer)}</p>`);
  updateSessionUi();
  chatInput.focus();
}

function fallbackExternalReferences(question) {
  const normalized = question.toLocaleLowerCase("vi");
  if (normalized.includes("deepseek") || normalized.includes("multi-head latent") || normalized.includes("mla")) {
    return [{
      title: "DeepSeek-V3 Technical Report",
      description: "Tài liệu kỹ thuật bên ngoài khóa học có phần mô tả Multi-Head Latent Attention.",
      url: "https://arxiv.org/abs/2412.19437",
    }];
  }
  return [{
    title: "Kết quả tra cứu học thuật",
    description: "Mở kết quả tìm kiếm để tham khảo thêm. Nội dung này chưa được xác nhận là quy ước chính thức của khóa học.",
    url: `https://scholar.google.com/scholar?q=${encodeURIComponent(question)}`,
  }];
}

async function findExternalReferences(question) {
  if (window.location.protocol === "file:") return fallbackExternalReferences(question);
  try {
    const response = await fetch("/api/external-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const payload = await response.json();
    if (!response.ok || !Array.isArray(payload.results) || !payload.results.length) {
      return fallbackExternalReferences(question);
    }
    return payload.results;
  } catch (error) {
    return fallbackExternalReferences(question);
  }
}

async function renderNoGrounding(displayedQuestion, result) {
  pendingQuestion = "";
  const references = await findExternalReferences(displayedQuestion);
  const record = await persistFeedback({
    route_origin: "no_grounding",
    question: displayedQuestion,
    ai_output: result.answer,
    citations: references.map((reference) => reference.url),
    feedback_type: "missing_internal_grounding",
    reason: "Tự động ghi nhận do corpus chính thức không đủ căn cứ",
  });
  const referenceHtml = references.map((reference) => `
    <div class="external-result">
      <strong>${escapeHtml(reference.title)}</strong>
      <p>${escapeHtml(reference.description)}</p>
      <a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener">Mở nguồn tham khảo <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
    </div>`).join("");
  completeTurn(displayedQuestion, `
    <div class="status-badge status-badge--amber"><i class="fa-solid fa-triangle-exclamation"></i> CHƯA ĐỦ CĂN CỨ TRONG KHÓA HỌC</div>
    <p>${escapeHtml(result.answer)}</p>
    <div class="external-card">
      <button class="external-close" onclick="dismissExternal(this)" aria-label="Đóng nguồn ngoài"><i class="fa-solid fa-xmark"></i></button>
      <h3>NGUỒN NGOÀI · KHÔNG PHẢI NỘI DUNG CHÍNH THỨC</h3>
      ${referenceHtml}
    </div>
    <div class="log-status"><i class="fa-solid fa-check"></i> Đã tự động lưu phản hồi ${record.case_id}</div>`);
}

function dismissExternal(button) {
  button?.closest(".external-card")?.remove();
  saveSession();
  showToast("Đã đóng nguồn ngoài. Phản hồi nền vẫn được ghi nhận.");
}

function renderRequestError(displayedQuestion, message) {
  completeTurn(displayedQuestion, `<div class="status-badge status-badge--amber"><i class="fa-solid fa-triangle-exclamation"></i> CHƯA THỂ KIỂM TRA NGUỒN</div><p>${escapeHtml(message)}. Vui lòng thử lại sau.</p>`);
}

function localTutorResult(question) {
  const normalized = question.toLocaleLowerCase("vi");
  const ambiguous = ["nó khác gì", "cái này", "tiếp tục đi", "giải thích nó", "slide đó"];
  if (ambiguous.some((phrase) => normalized.includes(phrase))) {
    return { route: "ASK_CLARIFY", answer: "Bạn đang muốn hỏi về khái niệm hoặc đoạn nào trên slide?", source_ids: [] };
  }
  const slideTopics = ["tầng 1", "tầng 2", "tầng 3", "chọn model", "chọn tầng", "việc khó", "suy luận nhiều bước", "việc hàng ngày", "khối lượng lớn", "kiểm soát dữ liệu"];
  if (slideTopics.some((phrase) => normalized.includes(phrase))) {
    return {
      route: "ANSWER_GROUNDED",
      answer: "Theo Day 1, trang PDF 26, Tầng 2 là lựa chọn mặc định cho đa số công việc hàng ngày. Tầng 1 chỉ nên dùng khi tác vụ thật sự khó và Tầng 2 chưa đáp ứng; Tầng 3 phù hợp khi cần self-host, kiểm soát dữ liệu hoặc tối ưu chi phí ở quy mô lớn.",
      sources: [courseSources[0]],
      source_ids: ["D1-P26"],
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
  beginRequest();
  renderLoading(question, displayedQuestion);
  try {
    if (window.location.protocol === "file:") {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const result = localTutorResult(question);
      if (result.route === "ANSWER_GROUNDED") renderGrounded(displayedQuestion, result);
      else if (result.route === "ASK_CLARIFY") renderClarify(displayedQuestion, result);
      else await renderNoGrounding(displayedQuestion, result);
      return;
    }
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, clarification_provided: clarificationProvided, current_source_id: "D1-P26" }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Không thể truy cập Tutor");
    if (clarificationProvided && result.route === "ASK_CLARIFY") {
      result.route = "ABSTAIN_ROUTE";
      result.answer = "Tôi đã hiểu đối tượng bạn muốn tìm hiểu, nhưng corpus chính thức chưa có căn cứ trực tiếp để trả lời nội dung này. Tôi sẽ không tự suy đoán từ trí nhớ mô hình.";
      result.source_ids = [];
    }
    if (result.route === "ANSWER_GROUNDED") renderGrounded(displayedQuestion, result);
    else if (result.route === "ASK_CLARIFY") renderClarify(displayedQuestion, result);
    else await renderNoGrounding(displayedQuestion, result);
  } catch (error) {
    const result = localTutorResult(question);
    if (result.route === "ANSWER_GROUNDED") renderGrounded(displayedQuestion, result);
    else if (result.route === "ASK_CLARIFY") renderClarify(displayedQuestion, result);
    else await renderNoGrounding(displayedQuestion, result);
  } finally {
    finishRequest();
  }
}

function openFeedback(id) {
  feedbackContext = currentSession()?.feedbackContexts?.[id] || feedbackContext;
  if (!feedbackContext.question) {
    showToast("Không tìm thấy dữ liệu của câu trả lời này.");
    return;
  }
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
  if (requestInFlight || currentSession()?.endedAt) return;
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
historyButton.addEventListener("click", openHistory);
newChatButton.addEventListener("click", createNewSession);
endChatButton.addEventListener("click", endCurrentSession);
document.getElementById("history-new").addEventListener("click", createNewSession);
document.getElementById("history-close").addEventListener("click", () => { historyModal.hidden = true; });
historyModal.addEventListener("click", (event) => { if (event.target === historyModal) historyModal.hidden = true; });
historyList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-session-id]");
  if (item) selectSession(item.dataset.sessionId);
});
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

document.getElementById("slide-65").addEventListener("mouseup", () => {
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim() || "";
  if (selectedText.length < 3 || !selection?.anchorNode || !document.getElementById("slide-65").contains(selection.anchorNode)) return;
  setTutor(true);
  chatInput.value = `Giải thích đoạn này theo tài liệu: "${selectedText.slice(0, 500)}"`;
  chatInput.focus();
});

document.getElementById("feedback-close").addEventListener("click", closeFeedback);
document.getElementById("feedback-cancel").addEventListener("click", closeFeedback);
feedbackModal.addEventListener("click", (event) => { if (event.target === feedbackModal) closeFeedback(); });
document.getElementById("source-close").addEventListener("click", closeSource);
sourceModal.addEventListener("click", (event) => { if (event.target === sourceModal) closeSource(); });
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!feedbackModal.hidden) closeFeedback();
  if (!sourceModal.hidden) closeSource();
  if (!historyModal.hidden) historyModal.hidden = true;
});
feedbackForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const record = await persistFeedback({
    route_origin: "grounded",
    question: feedbackContext.question,
    ai_output: feedbackContext.answer,
    citations: feedbackContext.citations,
    feedback_type: feedbackType.value,
    reason: `${feedbackReason.value.trim()}${feedbackSource.value.trim() ? ` | Nguồn đối chiếu: ${feedbackSource.value.trim()}` : ""}`,
  });
  closeFeedback();
  appendTutorMessage(`<div class="received-message"><i class="fa-solid fa-circle-check"></i><div><strong>Đã ghi nhận ${record.case_id}</strong><span>Bạn có thể tiếp tục học ngay.</span></div></div>`);
  saveSession();
});

if (window.matchMedia("(max-width: 1000px)").matches) lessonPanel.classList.add("collapsed");
loadChatSessions();
restoreSession();
