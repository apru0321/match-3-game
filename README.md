# Match-3 Game

A browser-based Match-3 puzzle game where players swap tiles to match shapes and complete tasks. Features include touch support, bonus tiles, task progression, and a logging system.

## Features
- 6x6 grid with square, circle, and triangle shapes
- Task-based gameplay with predefined and random tasks
- Bonus tiles (horizontal/vertical arrows, bonus star)
- Touch and mouse input support
- Responsive design with animations
- Logging system for game events

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/username/match-3-game.git
   ```
2. Navigate to the project directory:
   ```bash
   cd match-3-game
   ```
3. Install dependencies (if any):
   ```bash
   npm install
   ```
4. Serve the game using a local server (e.g., `http-server` or Python's `http.server`):
   ```bash
   npx http-server
   ```
5. Open `http://localhost:8080` in your browser.

## Project Structure
```
match-3-game/
├── src/
│   ├── js/
│   │   ├── core/
│   │   │   ├── board.js      # Board initialization and match logic
│   │   │   ├── game.js       # Main game initialization
│   │   │   ├── input.js      # Input handling (click, touch)
│   │   │   ├── render.js     # Rendering and animations
│   │   │   ├── tasks.js      # Task management
│   │   │   └── utils.js      # Logging and utilities
│   │   ├── constants.js      # Game constants
│   │   └── main.js           # Entry point
│   ├── css/
│   │   └── styles.css        # Game styles
│   └── index.html            # Main HTML file
├── .gitignore
├── README.md
└── package.json
```

## Usage
- Click or tap to select a tile, then select an adjacent tile to swap.
- Double-click or tap a bonus tile (arrow) to activate it.
- Complete tasks by collecting the required number of shapes within the move limit.
- View game logs in the log container at the bottom.

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

## License
MIT License. See `LICENSE` for details.
