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

let pendingExplanation = null; // 현재 지점에 설명이 있으면 그 텍스트, 없으면 null

// ply(1-based)에 해당하는 설명이 있으면 "설명 보기" 버튼을 띄우고, 없으면 숨김
function showExplanationIfAny(ply) {
  const btn = document.getElementById("explain-btn");
  const box = document.getElementById("explain-box");
  box.style.display = "none";
  box.textContent = "";
  const text = currentLine.comments && currentLine.comments[ply];
  if (text) {
    pendingExplanation = text;
    btn.style.display = "inline-block";
  } else {
    pendingExplanation = null;
    btn.style.display = "none";
  }
}

function buildLines() {
  const lines = [];
  REPERTOIRE.white.forEach((l, i) => {
    lines.push({ id: "white_" + i, color: "white", name: l.name, moves: l.moves.split(" "), comments: l.comments || {} });
  });
  REPERTOIRE.black.forEach((l, i) => {
    lines.push({ id: "black_" + i, color: "black", name: l.name, moves: l.moves.split(" "), comments: l.comments || {} });
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
  document.getElementById("explain-box").style.display = "none";
  pendingExplanation = null;
  document.getElementById("line-name").textContent = currentLine.name;
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
    showExplanationIfAny(moveIndex);
    advance();
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
      showExplanationIfAny(moveIndex);
      setTimeout(advance, 500);
    }, 1200);
    return "wrong";
  }

  setMessage("정답!", "correct");
  awaitingUserMove = false;
  document.getElementById("show-answer-btn").style.display = "none";
  moveIndex++;
  showExplanationIfAny(moveIndex);
  if (opts.syncBoard) board.position(game.fen());
  setTimeout(advance, 400);
  return "correct";
}

function revealAnswer() {
  if (!awaitingUserMove) return;
  const expectedSan = currentLine.moves[moveIndex];
  mistakeMade = true;
  setMessage("정답: " + expectedSan, "wrong");
  awaitingUserMove = false;
  document.getElementById("show-answer-btn").style.display = "none";
  clearHighlights();
  selectedSquare = null;
  setTimeout(() => {
    game.move(expectedSan);
    board.position(game.fen());
    moveIndex++;
    showExplanationIfAny(moveIndex);
    setTimeout(advance, 500);
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

  document.getElementById("explain-btn").addEventListener("click", () => {
    const box = document.getElementById("explain-box");
    box.textContent = pendingExplanation || "";
    box.style.display = "block";
    document.getElementById("explain-btn").style.display = "none";
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
      renderStats();
    }
  });

  renderStats();
});
