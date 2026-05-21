# deck-of-cards

A browser-based interactive deck of playing cards — HTML, CSS, and vanilla JavaScript only. No build step, no dependencies.

## Usage

Open `index.html` directly in a browser.

- **Double-click the pile** to deal all 52 cards to a 4×13 grid
- **Double-click the table** to collect them back into a pile
- **Click a card** (in grid view) to toggle its selected state

## Structure

| File | Purpose |
|------|---------|
| `index.html` | App shell |
| `style.css` | All styles — CSS variables, card states, pile/grid layouts, responsive breakpoints |
| `app.js` | DATA / RENDER / STATE / EVENTS / INIT sections |
| `tests/test.html` | In-browser tests (open in browser, check console) |

## Card states

CSS classes supported on `.card`: `.face-up`, `.face-down`, `.selected`, `.hovered`, `.disabled`

Card dimensions and colors are controlled via CSS custom properties in `:root` — easy to tune without touching layout logic.
