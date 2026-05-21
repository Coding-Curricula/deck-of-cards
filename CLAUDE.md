# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based interactive deck of playing cards built with **HTML, CSS, and vanilla JavaScript only** — no external libraries or frameworks.

## Technical Constraints

- No external libraries, frameworks, or build tools
- Pure HTML + CSS + vanilla JS
- Open directly in a browser (no dev server required)

## Architecture

The project follows a clean separation of concerns:

- **JavaScript** — separated into logical functions/modules; card data stored in structured objects; event listeners centralized where practical
- **CSS** — modular, reusable classes; card sizing via CSS variables; architecture supports animation expansion
- **HTML** — consistent card markup structure; cards rendered inside a dedicated game/table container

## Card States (CSS)

CSS must support these card states:
- `face-up`, `face-down`
- `selected`, `hovered`, `disabled`

## Running the App

Open `index.html` directly in a browser. No build step needed.
