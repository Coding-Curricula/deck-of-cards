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
