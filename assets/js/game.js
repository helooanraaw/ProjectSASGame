// game.js
import { _supabase, checkSession } from './config.js';

// Game State
let gameState = {
    cards: [],
    flippedCards: [],
    matchedCards: [],
    moves: 0,
    timer: 0,
    score: 0,
    combo: 0,
    gameStarted: false,
    difficulty: 'medium', // Default
    timerInterval: null,
    soundEnabled: true
};

// Sound Effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const sounds = {
    flip: () => playTone(400, 0.1),
    match: () => playTone(800, 0.2),
    wrong: () => playTone(200, 0.3),
    win: () => playMelody([523, 659, 784, 1047], 0.15),
    click: () => playTone(600, 0.05)
};

function playTone(frequency, duration) {
    if (!gameState.soundEnabled) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playMelody(frequencies, noteDuration) {
    if (!gameState.soundEnabled) return;
    frequencies.forEach((freq, index) => {
        setTimeout(() => {
            playTone(freq, noteDuration);
        }, index * (noteDuration * 1000));
    });
}

// Anime Images (Using existing assets)
const animeImages = {
    easy: [
        '../images/game/image1.png',
        '../images/game/image2.png',
        '../images/game/image3.png',
        '../images/game/image4.png'
    ],
    medium: [
        '../images/game/image1.png',
        '../images/game/image2.png',
        '../images/game/image3.png',
        '../images/game/image4.png',
        '../images/game/image5.png',
        '../images/game/image6.png'
    ],
    hard: [
        '../images/game/image1.png',
        '../images/game/image2.png',
        '../images/game/image3.png',
        '../images/game/image4.png',
        '../images/game/image5.png',
        '../images/game/image6.png',
        '../images/game/image7.png',
        '../images/game/image8.png'
    ]
};

// Difficulty Settings
const difficulties = {
    easy: { bonus: 50 },
    medium: { bonus: 100 },
    hard: { bonus: 200 }
};

// DOM Elements
const gameGrid = document.getElementById('gameGrid');
const scoreEl = document.getElementById('score');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const comboEl = document.getElementById('combo');
const restartBtn = document.getElementById('restartBtn');
const winModal = document.getElementById('winModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const soundBtn = document.getElementById('soundBtn');
const particles = document.getElementById('particles');

// Level Modal Elements
const levelModal = document.getElementById('levelModal');
const gameContainer = document.getElementById('gameContainer');

// Initialize Particles (Sakura)
function createParticles() {
    if (!particles) return;
    particles.innerHTML = ''; // Clear existing

    const particleCount = 30; // Number of sakura petals

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'sakura';
        
        // Random Position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random Size
        const size = Math.random() * 10 + 10 + 'px'; 
        particle.style.width = size;
        particle.style.height = size;
        
        // Random Animation Duration & Delay
        particle.style.animationDuration = (Math.random() * 5 + 5) + 's, ' + (Math.random() * 2 + 2) + 's'; 
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        particles.appendChild(particle);
    }
}

// Level Selection Logic
window.selectLevel = function(level) {
    sounds.click();
    gameState.difficulty = level;
    
    // Hide Modal, Show Game
    levelModal.classList.add('hidden');
    gameContainer.style.display = 'block';
    
    initGame();
};

// Initialize Game
function initGame() {
    stopTimer();
    
    // Reset State
    const selectedImages = animeImages[gameState.difficulty];
    const gameCards = [...selectedImages, ...selectedImages]
        .sort(() => Math.random() - 0.5)
        .map((image, index) => ({
            id: index,
            image: image,
            isFlipped: false,
            isMatched: false
        }));
    
    gameState.cards = gameCards;
    gameState.flippedCards = [];
    gameState.matchedCards = [];
    gameState.moves = 0;
    gameState.timer = 0;
    gameState.score = 0;
    gameState.combo = 0;
    gameState.gameStarted = false; // Timer won't start until first click
    
    updateUI();
    renderBoard();

    winModal.classList.add('hidden');
}

// Render Game Board
function renderBoard() {
    gameGrid.innerHTML = '';
    gameGrid.className = `grid-container ${gameState.difficulty}`;
    
    gameState.cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.id = card.id;
        
        cardEl.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">
                <img src="${card.image}" alt="Anime Card" class="card-image">
            </div>
        `;
        
        cardEl.addEventListener('click', () => handleCardClick(card));
        gameGrid.appendChild(cardEl);
    });
}

// Handle Card Click
function handleCardClick(card) {
    // Start timer on FIRST click
    if (!gameState.gameStarted) {
        startTimer();
        gameState.gameStarted = true;
    }
    
    const cardEl = document.querySelector(`[data-id="${card.id}"]`);
    
    if (
        gameState.flippedCards.length === 2 ||
        gameState.flippedCards.includes(card.id) ||
        gameState.matchedCards.includes(card.id)
    ) {
        return;
    }
    
    sounds.flip();
    cardEl.classList.add('flipped');
    gameState.flippedCards.push(card.id);

    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        movesEl.textContent = gameState.moves;
        checkMatch();
    }
}

// Check if cards match
function checkMatch() {
    const [firstId, secondId] = gameState.flippedCards;
    const firstCard = gameState.cards.find(c => c.id === firstId);
    const secondCard = gameState.cards.find(c => c.id === secondId);
    
    if (firstCard.image === secondCard.image) {
        sounds.match();
        gameState.matchedCards.push(firstId, secondId);
        gameState.combo++;
        gameState.score += 100 * gameState.combo;
        
        comboEl.textContent = `x${gameState.combo}`;
        scoreEl.textContent = gameState.score;
        
        const firstCardEl = document.querySelector(`[data-id="${firstId}"]`);
        const secondCardEl = document.querySelector(`[data-id="${secondId}"]`);
        
        firstCardEl.classList.add('matched');
        secondCardEl.classList.add('matched');
        
        gameState.flippedCards = [];
        
        if (gameState.matchedCards.length === gameState.cards.length) {
            setTimeout(() => {
                endGame();
            }, 500);
        }
    } else {
        sounds.wrong();
        gameState.combo = 0;
        comboEl.textContent = 'x0';
        
        setTimeout(() => {
            const firstCardEl = document.querySelector(`[data-id="${firstId}"]`);
            const secondCardEl = document.querySelector(`[data-id="${secondId}"]`);
            
            if (firstCardEl && secondCardEl) {
                firstCardEl.classList.remove('flipped');
                secondCardEl.classList.remove('flipped');
            }
            
            gameState.flippedCards = [];
        }, 800);
    }
}

// Timer Functions
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateTimer();
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimer() {
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Update UI
function updateUI() {
    scoreEl.textContent = gameState.score;
    movesEl.textContent = gameState.moves;
    updateTimer();
    comboEl.textContent = `x${gameState.combo}`;
}

// End Game
async function endGame() {
    stopTimer();
    sounds.win();
    
    const timeBonus = Math.max(0, 300 - gameState.timer) * 2;
    const moveBonus = Math.max(0, 50 - gameState.moves) * 10;
    const difficultyBonus = difficulties[gameState.difficulty].bonus;
    const finalScore = gameState.score + timeBonus + moveBonus + difficultyBonus;
    
    gameState.score = finalScore;
    
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('finalTime').textContent = timerEl.textContent;
    document.getElementById('finalMoves').textContent = gameState.moves;
    
    winModal.classList.remove('hidden');

    // Save to Supabase
    const user = checkSession();
    if (user) {
        const fetchResult = await _supabase
            .from('leaderboard')
            .select('score')
            .eq('user_id', user.id)
            .maybeSingle();

        const existingEntry = fetchResult.data;
        const currentHighScore = existingEntry ? existingEntry.score : 0;

        if (finalScore > currentHighScore) {
            await _supabase
                .from('leaderboard')
                .upsert(
                    {
                        user_id: user.id, 
                        username: user.username, 
                        score: finalScore,
                        time: gameState.timer,
                        moves: gameState.moves,
                    }, 
                    { onConflict: 'user_id' }
                );
        }
    }
}

// Sound toggle
soundBtn.addEventListener('click', () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    sounds.click();
    if (gameState.soundEnabled) {
        soundBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    } else {
        soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    }
});

// Restart Game
restartBtn.addEventListener('click', () => {
    sounds.click();
    // Show level modal again on restart
    gameContainer.style.display = 'none';
    levelModal.classList.remove('hidden');
});

playAgainBtn.addEventListener('click', () => {
    sounds.click();
    winModal.classList.add('hidden');
    gameContainer.style.display = 'none';
    levelModal.classList.remove('hidden');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    // Ensure modal is visible and game is hidden initially
    levelModal.classList.remove('hidden');
    gameContainer.style.display = 'none';
});