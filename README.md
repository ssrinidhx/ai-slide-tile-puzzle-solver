# Sliding Tile Puzzle (8‑Puzzle)

A simple 3×3 sliding tile puzzle game built using **HTML**, **CSS**, **JavaScript**, and a minimal **Flask** backend. The game generates a solvable puzzle and includes an optional auto‑solve feature.

## Features:
- Classic 8‑puzzle sliding game.
- Color‑coded tiles.
- Move counter and timer.
  
## Auto‑Solve Mode:
- Uses the **A*** search algorithm.
- Manhattan distance heuristic.
- Shows tile movements step‑by‑step.

## General:
- Solvable puzzle generation.
- Reset and new game options.
- Real‑time action log.

# Technologies Used:
- **HTML / CSS / JavaScript** – Puzzle logic and UI.
- **Flask** – To serve the web app.
- **A* algorithm** – Auto‑solver logic.

# Project Structure:

```
SlidingTilePuzzle/
│
├── app.py
│
├── static/
│   ├── script.js
│   └── style.css
│
└── templates/
    └── index.html
```

This project is a simple implementation of the classic sliding tile puzzle with an AI solver.
