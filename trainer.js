// 체스 오프닝 트레이너 - 핵심 로직
// 간단한 라이트너(Leitner) 방식의 간격 반복 학습을 사용합니다.
// 박스 0(새 카드) -> 박스 5(완전히 외움) 로 올라가며, 틀리면 다시 박스 0으로 내려갑니다.

const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 16, 35];
const STORAGE_KEY = "openingTrainerProgressV1";

const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

let game = new Chess();
let board = null;

let allLines = [];
let currentMode = null;     // 'white' | 'black' | 'mixed'
let currentLine = null;     // 현재 진행중인 라인
let moveIndex = 0;          // 현재 라인에서 몇 수째인지 (0-based ply)
let awaitingUserMove = false;
let mistakeMade = false;
let selectedSquare = null;  // 탭-탭(터치) 방식으로 선택된 출발 칸

const ANSWER_MODE_KEY = "openingTrainerAnswerModeV1";
let answerMode = localStorage.getItem(ANSWER_MODE_KEY) || "reveal"; // 'reveal' | 'retry'

const LINENAME_KEY = "openingTrainerLineNameV1";
let showLineName = localStorage.getItem(LINENAME_KEY) !== "0"; // 기본 켜짐

let pendingExplanation = null; // 현재 지점에 설명이 있으면 그 텍스트, 없으면 null

// ---- 자주 틀리는 지점 추적 (개인화된 임시 메모) ----

const MISTAKE_KEY = "openingTrainerMistakesV1";
const MISTAKE_SHOW_THRESHOLD = 2;   // 이 이상 틀리면 메모 표시
const MISTAKE_CLEAR_STREAK = 3;     // 이만큼 연속으로 맞히면 메모 삭제

function loadMistakes() {
  try {
    return JSON.parse(localStorage.getItem(MISTAKE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveMistakes(m) {
  localStorage.setItem(MISTAKE_KEY, JSON.stringify(m));
}

function mistakeKey(ply) {
  return currentLine.id + ":" + ply;
}

// wrongSan이 null이면 "정답 보기로 포기"한 경우 (구체적으로 착각한 수가 없음)
function recordWrongAttempt(ply, wrongSan) {
  const m = loadMistakes();
  const key = mistakeKey(ply);
  const entry = m[key] || { wrongCounts: {}, totalWrong: 0, streak: 0 };
  if (wrongSan) {
    entry.wrongCounts[wrongSan] = (entry.wrongCounts[wrongSan] || 0) + 1;
  }
  entry.totalWrong++;
  entry.streak = 0;
  m[key] = entry;
  saveMistakes(m);
}

function recordCorrectAttempt(ply) {
  const m = loadMistakes();
  const key = mistakeKey(ply);
  const entry = m[key];
  if (!entry) return;
  entry.streak++;
  if (entry.streak >= MISTAKE_CLEAR_STREAK) {
    delete m[key];
  }
  saveMistakes(m);
}

// 해당 지점이 "자주 틀리는 지점"인지 여부 (임계값 이상 틀렸고, 아직 연속 정답 스트릭을 못 채운 경우)
function isMistakeFlagged(ply) {
  const m = loadMistakes();
  const entry = m[mistakeKey(ply)];
  return !!entry && entry.totalWrong >= MISTAKE_SHOW_THRESHOLD && entry.streak < MISTAKE_CLEAR_STREAK;
}

// 자주 틀리는 지점일 때 보여줄 안내 문구 (착각했던 수 + 라이트 설명을 함께 붙임)
function getMistakeNote(ply) {
  const m = loadMistakes();
  const entry = m[mistakeKey(ply)];
  if (!entry) return null;

  let topWrong = null;
  let topCount = 0;
  for (const san in entry.wrongCounts) {
    if (entry.wrongCounts[san] > topCount) {
      topWrong = san;
      topCount = entry.wrongCounts[san];
    }
  }

  const lightText = currentLine.lightComments && currentLine.lightComments[ply];
  let header;
  if (topWrong) {
    header = "⚠️ 자주 틀리는 지점: \"" + topWrong + "\"(으)로 착각한 적이 " + topCount + "번 있어요.";
  } else {
    header = "⚠️ 자주 헷갈리는 지점이에요 (" + entry.totalWrong + "번).";
  }
  return lightText ? header + "\n" + lightText : header;
}

function updateLineNameDisplay() {
  const el = document.getElementById("line-name");
  if (!currentLine) {
    el.textContent = "라인을 시작하려면 위에서 모드를 선택하세요.";
    return;
  }
  el.textContent = showLineName ? currentLine.name : "라인 진행 중 (이름 숨김 - 실전 모드)";
}

// ply(1-based)에 해당하는 설명이 있으면 "설명 보기" 버튼을 띄우고 true를 반환.
// true를 반환하면 자동 진행을 멈춰야 함 - 안 그러면 설명을 볼 새도 없이 다음 수로 넘어가버림.
function checkExplanation(ply) {
  const btn = document.getElementById("explain-btn");
  const skipBtn = document.getElementById("skip-explain-btn");
  const continueBtn = document.getElementById("continue-btn");
  const box = document.getElementById("explain-box");
  box.style.display = "none";
  box.textContent = "";
  continueBtn.style.display = "none";

  // 원래부터 있던 핵심 수 설명은 항상 보여줌.
  // 라이트 설명(그 나머지 수들)은 이 지점에서 자주 틀렸을 때만 임시로 보여줌.
  const staticText = currentLine.comments && currentLine.comments[ply];
  const text = staticText || (isMistakeFlagged(ply) ? getMistakeNote(ply) : null);

  if (text) {
    pendingExplanation = text;
    btn.style.display = "inline-block";
    skipBtn.style.display = "inline-block";
    return true;
  }
  pendingExplanation = null;
  btn.style.display = "none";
  skipBtn.style.display = "none";
  return false;
}

function buildLines() {
  const lines = [];
  REPERTOIRE.white.forEach((l, i) => {
    lines.push({ id: "white_" + i, color: "white", name: l.name, moves: l.moves.split(" "), comments: l.comments || {}, lightComments: l.lightComments || {} });
  });
  REPERTOIRE.black.forEach((l, i) => {
    lines.push({ id: "black_" + i, color: "black", name: l.name, moves: l.moves.split(" "), comments: l.comments || {}, lightComments: l.lightComments || {} });
  });
  return lines;
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getEntry(progress, id) {
  return progress[id] || { box: 0, due: 0 };
}

// ---- 라인 선택 (간격 반복) ----

function poolForMode(mode) {
  if (mode === "white") return allLines.filter((l) => l.color === "white");
  if (mode === "black") return allLines.filter((l) => l.color === "black");
  return allLines;
}

function pickLine(mode) {
  const progress = loadProgress();
  const now = Date.now();
  const pool = poolForMode(mode);

  let due = pool.filter((l) => getEntry(progress, l.id).due <= now);
  let usingFreePractice = false;
  if (due.length === 0) {
    due = pool;
    usingFreePractice = true;
  }

  // 박스가 낮을수록(=취약할수록) 더 자주 뽑히도록 가중치 부여
  const weights = due.map((l) => 6 - getEntry(progress, l.id).box);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let chosen = due[0];
  for (let i = 0; i < due.length; i++) {
    r -= weights[i];
    if (r <= 0) { chosen = due[i]; break; }
  }
  return { line: chosen, freePractice: usingFreePractice };
}

// ---- 세션 진행 ----

function startSession(mode) {
  currentMode = mode;
  document.querySelectorAll(".mode-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.mode === mode);
  });
  document.getElementById("next-btn").style.display = "none";
  pickNextLine();
}

function pickNextLine() {
  const result = pickLine(currentMode);
  if (!result.line) return;
  currentLine = result.line;
  moveIndex = 0;
  mistakeMade = false;
  awaitingUserMove = false;
  clearHighlights();
  selectedSquare = null;

  game = new Chess();
  board.orientation(currentLine.color === "white" ? "white" : "black");
  board.position("start");

  document.getElementById("next-btn").style.display = "none";
  document.getElementById("show-answer-btn").style.display = "none";
  document.getElementById("explain-btn").style.display = "none";
  document.getElementById("skip-explain-btn").style.display = "none";
  document.getElementById("continue-btn").style.display = "none";
  document.getElementById("explain-box").style.display = "none";
  pendingExplanation = null;
  updateLineNameDisplay();
  setMessage(
    result.freePractice
      ? "오늘 복습할 라인이 없어요. 자유 연습 중이에요."
      : "",
    "info"
  );

  advance();
}

function isMyMove(idx) {
  return currentLine.color === "white" ? idx % 2 === 0 : idx % 2 === 1;
}

function advance() {
  if (moveIndex >= currentLine.moves.length) {
    finishLine();
    return;
  }
  if (isMyMove(moveIndex)) {
    awaitingUserMove = true;
    setMessage("당신 차례예요. 정확한 수를 두세요.", "info");
    document.getElementById("show-answer-btn").style.display =
      answerMode === "retry" ? "inline-block" : "none";
    return;
  }
  // 상대(자동) 수를 살짝 딜레이 후 재생
  awaitingUserMove = false;
  setTimeout(() => {
    const san = currentLine.moves[moveIndex];
    game.move(san);
    board.position(game.fen());
    moveIndex++;
    if (!checkExplanation(moveIndex)) {
      advance();
    }
  }, 450);
}

function finishLine() {
  awaitingUserMove = false;
  const progress = loadProgress();
  const entry = getEntry(progress, currentLine.id);
  let newBox;
  if (mistakeMade) {
    newBox = 0;
  } else {
    newBox = Math.min(entry.box + 1, 5);
  }
  const due = Date.now() + BOX_INTERVAL_DAYS[newBox] * 86400000;
  progress[currentLine.id] = { box: newBox, due };
  saveProgress(progress);

  setMessage(
    mistakeMade ? "라인 완료 (실수 있었음) - 박스 1로 이동" : "라인 완료! 정확했어요 - 박스가 올라갑니다.",
    mistakeMade ? "wrong" : "correct"
  );
  document.getElementById("next-btn").style.display = "inline-block";
  renderStats();
}

// ---- 수 처리 (드래그 / 탭-탭 공용) ----

// 반환값: 'illegal'(체스 규칙상 불가) | 'wrong'(합법이지만 레퍼토리와 다름) | 'correct'
function tryUserMove(from, to, opts) {
  opts = opts || {};
  if (!awaitingUserMove) return "illegal";

  const move = game.move({ from, to, promotion: "q" });
  if (move === null) return "illegal";

  const expectedSan = currentLine.moves[moveIndex];
  if (move.san !== expectedSan) {
    game.undo();
    mistakeMade = true;
    recordWrongAttempt(moveIndex + 1, move.san);
    if (opts.syncBoard) board.position(game.fen());

    if (answerMode === "retry") {
      // 정답을 알려주지 않고 다시 시도하게 함
      setMessage("틀렸어요. 다시 시도해보세요.", "wrong");
      return "wrong";
    }

    setMessage("틀렸어요. 정답: " + expectedSan, "wrong");
    awaitingUserMove = false;
    document.getElementById("show-answer-btn").style.display = "none";
    setTimeout(() => {
      game.move(expectedSan);
      board.position(game.fen());
      moveIndex++;
      if (!checkExplanation(moveIndex)) {
        setTimeout(advance, 500);
      }
    }, 1200);
    return "wrong";
  }

  setMessage("정답!", "correct");
  recordCorrectAttempt(moveIndex + 1);
  awaitingUserMove = false;
  document.getElementById("show-answer-btn").style.display = "none";
  moveIndex++;
  if (opts.syncBoard) board.position(game.fen());
  if (!checkExplanation(moveIndex)) {
    setTimeout(advance, 400);
  }
  return "correct";
}

function revealAnswer() {
  if (!awaitingUserMove) return;
  const expectedSan = currentLine.moves[moveIndex];
  mistakeMade = true;
  recordWrongAttempt(moveIndex + 1, null);
  setMessage("정답: " + expectedSan, "wrong");
  awaitingUserMove = false;
  document.getElementById("show-answer-btn").style.display = "none";
  clearHighlights();
  selectedSquare = null;
  setTimeout(() => {
    game.move(expectedSan);
    board.position(game.fen());
    moveIndex++;
    if (!checkExplanation(moveIndex)) {
      setTimeout(advance, 500);
    }
  }, 800);
}

// ---- 드래그 방식 (마우스) ----

function onDragStart(source, piece) {
  if (!awaitingUserMove) return false;
  if (game.game_over()) return false;
  const wantColor = currentLine.color === "white" ? "w" : "b";
  if (piece[0] !== wantColor) return false;
  if (piece[0] !== game.turn()) return false;
  return true;
}

function onDrop(source, target) {
  if (!awaitingUserMove) return "snapback";
  const status = tryUserMove(source, target, { syncBoard: false });
  if (status !== "correct") return "snapback";
}

function onSnapEnd() {
  board.position(game.fen());
}

// ---- 탭-탭 방식 (터치/클릭) ----

function onSquareClick(square) {
  if (!awaitingUserMove) return;
  const wantColor = currentLine.color === "white" ? "w" : "b";

  if (selectedSquare === null) {
    const piece = game.get(square);
    if (piece && piece.color === wantColor) {
      selectedSquare = square;
      highlightSquare(square);
    }
    return;
  }

  if (square === selectedSquare) {
    clearHighlights();
    selectedSquare = null;
    return;
  }

  const from = selectedSquare;
  clearHighlights();
  selectedSquare = null;

  const status = tryUserMove(from, square, { syncBoard: true });
  if (status === "illegal") {
    const piece = game.get(square);
    if (piece && piece.color === wantColor) {
      selectedSquare = square;
      highlightSquare(square);
    }
  }
}

function highlightSquare(square) {
  $('#board .square-55d63[data-square="' + square + '"]').addClass("selected-square");
}

function clearHighlights() {
  $("#board .square-55d63").removeClass("selected-square");
}

function setMessage(text, kind) {
  const el = document.getElementById("message");
  el.textContent = text;
  el.className = kind ? "message-" + kind : "";
}

// ---- 통계 패널 ----

function formatDue(due) {
  if (!due) return "새 카드";
  const now = Date.now();
  if (due <= now) return "오늘";
  const days = Math.ceil((due - now) / 86400000);
  return days + "일 후";
}

function renderStats() {
  const progress = loadProgress();
  const now = Date.now();
  const tbody = document.querySelector("#stats-table tbody");
  tbody.innerHTML = "";
  let dueCount = 0;

  allLines.forEach((l) => {
    const entry = getEntry(progress, l.id);
    if (entry.due <= now) dueCount++;
    const tr = document.createElement("tr");
    const dueText = formatDue(entry.due);
    tr.innerHTML =
      "<td>" + l.name + "</td>" +
      "<td>" + entry.box + "</td>" +
      "<td class=\"" + (entry.due <= now ? "due-now" : "") + "\">" + dueText + "</td>";
    tbody.appendChild(tr);
  });

  document.getElementById("stats-summary").textContent =
    "전체 " + allLines.length + "개 라인 중 오늘 복습 가능: " + dueCount + "개";
}

// ---- 초기화 ----

document.addEventListener("DOMContentLoaded", () => {
  allLines = buildLines();

  board = Chessboard("board", {
    draggable: !isTouchDevice,
    position: "start",
    pieceTheme: "lib/img/chesspieces/wikipedia/{piece}.png",
    onDragStart,
    onDrop,
    onSnapEnd,
  });

  $(window).on("resize", () => board.resize());

  // 터치 기기에서는 draggable을 꺼뒀으므로 탭-탭(칸을 두 번 터치) 방식으로 둠
  $("#board").on("click", ".square-55d63", function () {
    onSquareClick($(this).attr("data-square"));
  });

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => startSession(btn.dataset.mode));
  });

  document.getElementById("next-btn").addEventListener("click", pickNextLine);
  document.getElementById("show-answer-btn").addEventListener("click", revealAnswer);

  // 서로 다른 버튼 두 개로 분리 - "설명 보기"를 눌러도 자동으로 진행되지 않고,
  // 반드시 "계속하기"를 따로 눌러야만 다음 수로 넘어감
  document.getElementById("explain-btn").addEventListener("click", () => {
    document.getElementById("explain-btn").style.display = "none";
    document.getElementById("skip-explain-btn").style.display = "none";
    const box = document.getElementById("explain-box");
    box.textContent = pendingExplanation || "";
    box.style.display = "block";
    document.getElementById("continue-btn").style.display = "inline-block";
  });

  document.getElementById("skip-explain-btn").addEventListener("click", () => {
    document.getElementById("explain-btn").style.display = "none";
    document.getElementById("skip-explain-btn").style.display = "none";
    document.getElementById("explain-box").style.display = "none";
    advance();
  });

  document.getElementById("continue-btn").addEventListener("click", () => {
    document.getElementById("continue-btn").style.display = "none";
    document.getElementById("explain-box").style.display = "none";
    advance();
  });

  const lineNameToggle = document.getElementById("linename-toggle");
  lineNameToggle.checked = showLineName;
  lineNameToggle.addEventListener("change", (e) => {
    showLineName = e.target.checked;
    localStorage.setItem(LINENAME_KEY, showLineName ? "1" : "0");
    updateLineNameDisplay();
  });

  document.querySelectorAll('input[name="answer-mode"]').forEach((el) => {
    el.checked = el.value === answerMode;
    el.addEventListener("change", (e) => {
      answerMode = e.target.value;
      localStorage.setItem(ANSWER_MODE_KEY, answerMode);
      if (awaitingUserMove) {
        document.getElementById("show-answer-btn").style.display =
          answerMode === "retry" ? "inline-block" : "none";
      }
    });
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("모든 학습 기록을 초기화할까요? 되돌릴 수 없어요.")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MISTAKE_KEY);
      renderStats();
    }
  });

  renderStats();
});
