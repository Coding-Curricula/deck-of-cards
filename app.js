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
  deck: []
};

function toggleLayout() {
  const container = document.getElementById('card-container');
  container.classList.add('transitioning');
  setTimeout(() => {
    state.layout = state.layout === 'pile' ? 'grid' : 'pile';
    if (state.layout === 'pile') {
      renderPile(state.deck);
    } else {
      renderGrid(state.deck);
    }
    container.classList.remove('transitioning');
  }, 350);
}
