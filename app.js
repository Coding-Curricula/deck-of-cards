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
// DECK OF CARDS API - https://deckofcardsapi.com/
// ============================================================

const API_BASE = 'https://deckofcardsapi.com/api/deck';

function mapApiCard(c) {
  const rankMap = { ACE: 'A', JACK: 'J', QUEEN: 'Q', KING: 'K' };
  const suitMap = { HEARTS: '♥', DIAMONDS: '♦', CLUBS: '♣', SPADES: '♠' };
  const rank = rankMap[c.value] ?? c.value;
  const suit = suitMap[c.suit];
  return { rank, suit, color: suit === '♥' || suit === '♦' ? 'red' : 'black', id: `${rank}${suit}`, image: c.image };
}

async function fetchDeck() {
  const res = await fetch(`${API_BASE}/new/shuffle/?deck_count=1`);
  const data = await res.json();
  state.deckId = data.deck_id;
}

async function reshuffleDeck() {
  await fetch(`${API_BASE}/${state.deckId}/shuffle/`);
}

async function drawCards(count) {
  const res = await fetch(`${API_BASE}/${state.deckId}/draw/?count=${count}`);
  const data = await res.json();
  return data.cards.map(mapApiCard);
}

// ============================================================
// RENDER
// ============================================================

function createCardElement(card) {
  const el = document.createElement('div');
  el.className = `card ${card.color}`;
  el.dataset.id = card.id;
  const faceContent = card.image
    ? `<img class="card-img" src="${card.image}" alt="${card.rank} of ${card.suit}">`
    : `<span class="card-corner top-left">${card.rank}<br>${card.suit}</span>` +
      `<span class="card-suit-center">${card.suit}</span>` +
      `<span class="card-corner bottom-right">${card.rank}<br>${card.suit}</span>`;
  el.innerHTML = `<div class="card-face">${faceContent}</div><div class="card-back"></div>`;
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
  deckId: null,
  loading: false,
  error: null,
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

function showError(msg) {
  state.error = msg;
  const el = document.getElementById('error-message');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearError() {
  state.error = null;
  document.getElementById('error-message').classList.add('hidden');
}

async function toggleLayout() {
  const container = document.getElementById('card-container');
  container.classList.add('transitioning');
  const next = state.layout === 'pile' ? 'grid' : 'pile';

  if (next === 'grid') {
    try {
      await Promise.all([
        reshuffleDeck().then(() => drawCards(52)).then(cards => { state.deck = cards; }),
        new Promise(r => setTimeout(r, 350))
      ]);
    } catch (err) {
      container.classList.remove('transitioning');
      showError('Could not load cards from the API.');
      return;
    }
  } else {
    await new Promise(r => setTimeout(r, 350));
  }

  setLayout(next);
  if (next === 'pile') renderPile(state.deck);
  else renderGrid(state.deck);
  container.classList.remove('transitioning');
}

// ============================================================
// GAME
// ============================================================

const RANK_VALUES = { A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13 };

function rankValue(card) {
  return RANK_VALUES[card.rank];
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
      `<button class="hilow-btn" data-guess="higher" ${state.loading ? 'disabled' : ''}>▲ Higher</button>` +
      `<button class="hilow-btn" data-guess="lower" ${state.loading ? 'disabled' : ''}>▼ Lower</button>`;
    ui.appendChild(buttons);
  }

  container.appendChild(ui);
}

async function startGame() {
  clearError();
  try {
    await reshuffleDeck();
    const [firstCard] = await drawCards(1);
    state.game.currentCard = firstCard;
    state.game.drawPile = generateDeck().filter(c => c.id !== firstCard.id);
    state.game.score = 0;
    state.game.over = false;
    setLayout('hilow');
    renderHiLo();
  } catch (err) {
    showError('Could not connect to the card API. Please try again.');
  }
}

async function makeGuess(direction) {
  if (state.game.over || state.loading) return;
  state.loading = true;
  renderHiLo();

  try {
    const points = calcPoints(direction, state.game.currentCard, state.game.drawPile);
    const [nextCard] = await drawCards(1);
    state.game.drawPile = state.game.drawPile.filter(c => c.id !== nextCard.id);

    const correct = direction === 'higher'
      ? rankValue(nextCard) > rankValue(state.game.currentCard)
      : rankValue(nextCard) < rankValue(state.game.currentCard);

    if (!correct) {
      state.game.over = true;
    } else {
      state.game.score += points;
      if (state.game.drawPile.length === 0) state.game.over = 'win';
    }
    state.game.currentCard = nextCard;
  } catch (err) {
    showError('Could not draw card from API. Please try again.');
  } finally {
    state.loading = false;
    renderHiLo();
  }
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

async function init() {
  state.deck = generateDeck();
  renderPile(state.deck);
  setLayout('pile');
  bindEvents();
  try {
    await fetchDeck();
  } catch (err) {
    showError('Could not connect to the card API. Some features may be unavailable.');
  }
}

if (document.getElementById('table')) {
  init();
}
