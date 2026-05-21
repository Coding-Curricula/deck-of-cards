// ============================================================
// DATA
// ============================================================

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function generateDeck() {
  return SUITS.flatMap(suit =>
    RANKS.map(rank => ({
      rank,
      suit,
      color: (suit === '♥' || suit === '♦') ? 'red' : 'black',
      id: `${rank}${suit}`
    }))
  );
}

// ============================================================
// RENDER
// ============================================================

function createCardElement(card) {
  const el = document.createElement('div');
  el.className = `card ${card.color}`;
  el.dataset.id = card.id;
  el.innerHTML =
    `<div class="card-face">` +
      `<span class="card-corner top-left">${card.rank}<br>${card.suit}</span>` +
      `<span class="card-suit-center">${card.suit}</span>` +
      `<span class="card-corner bottom-right">${card.rank}<br>${card.suit}</span>` +
    `</div>` +
    `<div class="card-back"></div>`;
  return el;
}

function renderPile(deck) {
  const container = document.getElementById('card-container');
  container.className = 'pile';
  container.innerHTML = '';
  deck.forEach((card, i) => {
    const el = createCardElement(card);
    el.classList.add('face-down');
    el.style.setProperty('--stack-index', i);
    container.appendChild(el);
  });
}

function renderGrid(deck) {
  const container = document.getElementById('card-container');
  container.className = 'grid';
  container.innerHTML = '';
  deck.forEach(card => {
    const el = createCardElement(card);
    el.classList.add('face-up');
    container.appendChild(el);
  });
}

// ============================================================
// STATE
// ============================================================

const state = {
  layout: 'pile',
  deck: [],
  game: {
    drawPile: [],
    currentCard: null,
    score: 0,
    over: false,
  }
};

function setLayout(name) {
  state.layout = name;
  document.getElementById('table').dataset.layout = name;
}

function toggleLayout() {
  const container = document.getElementById('card-container');
  container.classList.add('transitioning');
  setTimeout(() => {
    const next = state.layout === 'pile' ? 'grid' : 'pile';
    setLayout(next);
    if (state.layout === 'pile') {
      renderPile(state.deck);
    } else {
      renderGrid(state.deck);
    }
    container.classList.remove('transitioning');
  }, 350);
}

// ============================================================
// GAME
// ============================================================

const RANK_VALUES = { A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13 };

function rankValue(card) {
  return RANK_VALUES[card.rank];
}

function shuffleDeck(deck) {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function calcPoints(direction, currentCard, drawPile) {
  const cv = rankValue(currentCard);
  const favorable = drawPile.filter(c =>
    direction === 'higher' ? rankValue(c) > cv : rankValue(c) < cv
  ).length;
  return Math.round((drawPile.length / Math.max(favorable, 1)) * 10);
}

function renderHiLo() {
  const container = document.getElementById('card-container');
  container.className = 'hilow';
  container.innerHTML = '';

  const ui = document.createElement('div');
  ui.className = 'hilow-ui';

  const scoreEl = document.createElement('div');
  scoreEl.className = 'hilow-score';
  scoreEl.textContent = `Score: ${state.game.score}`;
  ui.appendChild(scoreEl);

  const cardEl = createCardElement(state.game.currentCard);
  cardEl.classList.add('face-up');
  ui.appendChild(cardEl);

  if (state.game.over === 'win') {
    const result = document.createElement('div');
    result.className = 'hilow-result win';
    result.innerHTML = `You beat the deck!<br><button class="hilow-btn" data-action="restart">Play Again</button>`;
    ui.appendChild(result);
  } else if (state.game.over) {
    const result = document.createElement('div');
    result.className = 'hilow-result lose';
    result.innerHTML = `Wrong guess!<br><button class="hilow-btn" data-action="restart">Play Again</button>`;
    ui.appendChild(result);
  } else {
    const cardsLeft = document.createElement('div');
    cardsLeft.className = 'hilow-cards-left';
    cardsLeft.textContent = `${state.game.drawPile.length} cards remaining`;
    ui.appendChild(cardsLeft);

    const buttons = document.createElement('div');
    buttons.className = 'hilow-buttons';
    buttons.innerHTML =
      `<button class="hilow-btn" data-guess="higher">▲ Higher</button>` +
      `<button class="hilow-btn" data-guess="lower">▼ Lower</button>`;
    ui.appendChild(buttons);
  }

  container.appendChild(ui);
}

function startGame() {
  const shuffled = shuffleDeck(state.deck);
  state.game.drawPile = shuffled;
  state.game.currentCard = state.game.drawPile.pop();
  state.game.score = 0;
  state.game.over = false;
  setLayout('hilow');
  renderHiLo();
}

function makeGuess(direction) {
  if (state.game.over) return;
  const points = calcPoints(direction, state.game.currentCard, state.game.drawPile);
  const nextCard = state.game.drawPile.pop();
  const cv = rankValue(state.game.currentCard);
  const nv = rankValue(nextCard);
  const correct = direction === 'higher' ? nv > cv : nv < cv;

  if (!correct) {
    state.game.over = true;
    state.game.currentCard = nextCard;
  } else {
    state.game.score += points;
    state.game.currentCard = nextCard;
    if (state.game.drawPile.length === 0) state.game.over = 'win';
  }
  renderHiLo();
}

// ============================================================
// EVENTS
// ============================================================

function bindEvents() {
  const table = document.getElementById('table');
  const container = document.getElementById('card-container');

  container.addEventListener('dblclick', e => {
    e.stopPropagation();
    if (state.layout === 'pile') toggleLayout();
  });

  table.addEventListener('dblclick', () => {
    if (state.layout === 'grid') toggleLayout();
    if (state.layout === 'hilow') {
      setLayout('pile');
      renderPile(state.deck);
    }
  });

  table.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (card && state.layout === 'grid') card.classList.toggle('selected');
    if (e.target.matches('[data-guess]')) makeGuess(e.target.dataset.guess);
    if (e.target.matches('[data-action="restart"]')) startGame();
  });

  document.getElementById('hilow-start').addEventListener('click', startGame);
}

// ============================================================
// INIT
// ============================================================

function init() {
  state.deck = generateDeck();
  renderPile(state.deck);
  setLayout('pile');
  bindEvents();
}

if (document.getElementById('table')) {
  init();
}
