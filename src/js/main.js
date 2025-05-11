import { initGame } from './core/game.js';
import { setupLogging } from './core/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing game...');
    setupLogging();
    initGame();
}, { once: true });
