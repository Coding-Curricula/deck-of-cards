# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Constraints

- No external libraries, frameworks, or build tools — ever
- Open `index.html` directly in a browser; no dev server needed

## Running / Testing

```bash
# Open the app
xdg-open index.html        # Linux
open index.html            # macOS

# Run tests (open in browser, check console for assertion failures)
xdg-open tests/test.html
```

## Architecture

Three files — no build step, no modules, globals shared via script load order:

- **`index.html`** — shell with `#table > #card-container`; loads `style.css` then `app.js`
- **`style.css`** — all styles; CSS custom properties in `:root` control card dimensions/colors
- **`app.js`** — four sections in order: DATA → RENDER → STATE → EVENTS → INIT

### app.js sections

| Section | Key exports |
|---------|-------------|
| DATA | `generateDeck()` → `{rank, suit, color, id}[]` |
| RENDER | `createCardElement(card)`, `renderPile(deck)`, `renderGrid(deck)` |
| STATE | `state = {layout, deck}`, `toggleLayout()` |
| EVENTS | `bindEvents()` |
| INIT | `init()` — only runs if `#table` exists (guards against `tests/test.html`) |

### Interactions

- Initial state: stacked face-down pile
- Double-click pile → fade + switch to 4×13 grid (face-up)
- Double-click table → fade + return to pile
- Click card (grid only) → toggle `.selected`

### Card CSS classes

`.face-up`, `.face-down`, `.selected`, `.hovered`, `.disabled` — all defined in `style.css`; sizing via `--card-width`, `--card-height`, `--card-radius` custom properties.

### Tests

`tests/test.html` loads `app.js` and runs `console.assert` checks on `generateDeck()` and `createCardElement()`. No `#table` element, so `init()` does not run.
