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
    difficulty: 'medium',
    timerInterval: null,
    soundEnabled: true
};

// Sound Effects - Simple beep tones menggunakan Web Audio API
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

// Anime Images
// Path gambar" kartu di setiap difficulty
const animeImages = {
    easy: [
        'images/image1.png',
        'images/image2.png',
        'images/image3.png',
        'images/image4.png'
    ],
    medium: [
        'images/image1.png',
        'images/image2.png',
        'images/image3.png',
        'images/image4.png',
        'images/image5.png',
        'images/image6.png'
    ],
    hard: [
        'images/image1.png',
        'images/image2.png',
        'images/image3.png',
        'images/image4.png',
        'images/image5.png',
        'images/image6.png',
        'images/image7.png',
        'images/image8.png'
    ]
};

// Difficulty Settings
const difficulties = {
    easy: { pairs: 4, cols: 4, bonus: 50 },
    medium: { pairs: 6, cols: 4, bonus: 100 },
    hard: { pairs: 8, cols: 4, bonus: 200 }
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
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const soundBtn = document.getElementById('soundBtn');
const soundLabel = document.getElementById('soundLabel');
const particles = document.getElementById('particles');

// Initialize Particles
// function createParticles() {
//     for (let i = 0; i < 20; i++) {
//         const particle = document.createElement('div');
//         particle.className = 'particle';
//         particle.style.left = Math.random() * 100 + '%';
//         particle.style.animationDelay = Math.random() * 15 + 's';
//         particle.style.animationDuration = (10 + Math.random() * 10) + 's';
//         particles.appendChild(particle);
//     }
// }

// Initialize Game
// Deklarasi semua variabel yang akan kita pakai
function initGame() {
    stopTimer();
    sounds.click();
    
    //Selected Images
    //Variabel sementara untuk menampung semua gambar yang terpilih
    //"gambar yang dipilih" diambil dari animeImages sesuai difficulty game
    //lalu kita akan punya array berisi semua gambar yang akan kita pakai
    const selectedImages = animeImages[gameState.difficulty];

    //dengan gamecards, kita tampung array baru berisi 2 array selected image
    //(karena setiap gambar punya 1 match). lalu isi array tersebut di shuffle
    //menggunakan sort (sort digunakan untuk mengurutkan namun dengan menggunakan
    //Math.random() - 0.5 berubah menjadi shuffle random)

    //setelah di shuffle, menggunakan .map, setiap elemen di dalam array diubah
    //menjadi objek. yang berarti hasil akhirnya adalah array gameCards
    //berisi objek" kartu
    const gameCards = [...selectedImages, ...selectedImages]
        .sort(() => Math.random() - 0.5)
        .map((image, index) => ({
            id: index,
            image: image,
            isFlipped: false,
            isMatched: false
        }));
    
    gameState = {
        cards: gameCards,
        flippedCards: [],
        matchedCards: [],
        moves: 0,
        timer: 0,
        score: 0,
        combo: 0,
        gameStarted: false,
        difficulty: gameState.difficulty,
        timerInterval: null,
        soundEnabled: gameState.soundEnabled
    };
    
    updateUI();
    renderBoard();

    //hide window yang akan muncul saat menang
    winModal.classList.add('hidden');
}

// Render Game Board
function renderBoard() {
    //clear isi dari div gameGrid
    gameGrid.innerHTML = '';
    gameGrid.className = `grid-container ${gameState.difficulty}`;
    

    //forEach = pada setiap kartu lakukan ..
    gameState.cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.id = card.id;
        
        cardEl.innerHTML = `
            <div class="card-face card-back">?</div>
            <div class="card-face card-front">
                <img src="${card.image}" alt="Anime Card" class="card-image">
            </div>
        `;
        
        //tambahkan eventHandler ke kartu
        cardEl.addEventListener('click', () => handleCardClick(card));
        //masukkan kartu ke dalam div gameGrid
        gameGrid.appendChild(cardEl);
    });
}

// Handle Card Click
// function ketika sebuah card di click
// note : El = elemen
function handleCardClick(card) {

    //jika game belum dimulai maka mulai game dan mulai timer
    if (!gameState.gameStarted) {
        startTimer();
        gameState.gameStarted = true;
    }
    
    //pilih elemen html yang merepresentasikan kartu yang di klik
    const cardEl = document.querySelector(`[data-id="${card.id}"]`);
    
    //Hentikan function jika memang sudah ada 2 kartu yang di flip ATAU
    //di flippedCards sudah ada kartu ini ATAU kartu ini sudah matched
    if (
        gameState.flippedCards.length === 2 ||
        gameState.flippedCards.includes(card.id) ||
        gameState.matchedCards.includes(card.id)
    ) {
        return;
    }
    
    sounds.flip();
    //Mainkan animasi flip pada kartu
    cardEl.classList.add('flipped');
    gameState.flippedCards.push(card.id);


    //jika setelah kartu ini di tambahkan ke flippedCard dan 
    //flippedCard jadinya isi 2 maka increment moves dan cek apakah matching
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        movesEl.textContent = gameState.moves;
        checkMatch();
    }
}

// Check if cards match
function checkMatch() {
    //dengan array destructuring, dapatkan kartu 1 dan 2 di flippedCard
    const [firstId, secondId] = gameState.flippedCards;
    //dapatkan data kartu pertama dan kedua itu
    const firstCard = gameState.cards.find(c => c.id === firstId);
    const secondCard = gameState.cards.find(c => c.id === secondId);
    
    //Jika matching
    if (firstCard.image === secondCard.image) {
        sounds.match();

        //masukkan kedua kertu yang sudah matching itu ke matchedCards
        gameState.matchedCards.push(firstId, secondId);

        //tambahkan combo
        gameState.combo++;

        //tambahkan poin
        gameState.score += 100 * gameState.combo;
        
        comboEl.textContent = `x${gameState.combo}`;
        scoreEl.textContent = gameState.score;
        
        //cari elemen di file htmlnya yang merepresentasikan kedua kartu tersebut
        const firstCardEl = document.querySelector(`[data-id="${firstId}"]`);
        const secondCardEl = document.querySelector(`[data-id="${secondId}"]`);
        
        //kedua kartu tersebut memainkan animasi matched
        firstCardEl.classList.add('matched');
        secondCardEl.classList.add('matched');
        
        // Particle effect on match
        // createMatchParticles(firstCardEl);
        // createMatchParticles(secondCardEl);
        
        //kosongkan kembali flippedCard
        gameState.flippedCards = [];
        
        //jiks semua kartu telah matching, akhiri game
        if (gameState.matchedCards.length === gameState.cards.length) {
            setTimeout(() => {
                endGame();
            }, 500);
        }
    //jika gak matching
    } else {
        sounds.wrong();

        //reset combo
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

// Create match particles effect
// function createMatchParticles(cardEl) {
//     const rect = cardEl.getBoundingClientRect();
//     const colors = ['#22d3ee', '#fbbf24', '#10b981', '#f472b6'];
    
//     for (let i = 0; i < 8; i++) {
//         const particle = document.createElement('div');
//         particle.style.position = 'fixed';
//         particle.style.left = rect.left + rect.width / 2 + 'px';
//         particle.style.top = rect.top + rect.height / 2 + 'px';
//         particle.style.width = '8px';
//         particle.style.height = '8px';
//         particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
//         particle.style.borderRadius = '50%';
//         particle.style.pointerEvents = 'none';
//         particle.style.zIndex = '999';
        
//         document.body.appendChild(particle);
        
//         const angle = (Math.PI * 2 * i) / 8;
//         const velocity = 50 + Math.random() * 50;
//         const tx = Math.cos(angle) * velocity;
//         const ty = Math.sin(angle) * velocity;
        
//         particle.animate([
//             { transform: 'translate(0, 0) scale(1)', opacity: 1 },
//             { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
//         ], {
//             duration: 600,
//             easing: 'cubic-bezier(0, .9, .57, 1)'
//         }).onfinish = () => particle.remove();
//     }
// }

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

// Create confetti
// function createConfetti() {
//     const confettiContainer = document.getElementById('confetti');
//     const colors = ['#22d3ee', '#fbbf24', '#10b981', '#f472b6', '#a78bfa'];
    
//     for (let i = 0; i < 50; i++) {
//         const confetti = document.createElement('div');
//         confetti.className = 'confetti-piece';
//         confetti.style.left = Math.random() * 100 + '%';
//         confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
//         confetti.style.animationDelay = Math.random() * 0.5 + 's';
//         confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
//         confettiContainer.appendChild(confetti);
//     }
    
//     setTimeout(() => {
//         confettiContainer.innerHTML = '';
//     }, 4000);
// }

// End Game
// selesaikan game
function endGame() {
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
    document.getElementById('finalCombo').textContent = `x${gameState.combo}`;
    
    // createConfetti();

    //hilangkan class hidden pada pop up menang, maka itu akan muncul
    winModal.classList.remove('hidden');
}

// Sound toggle
soundBtn.addEventListener('click', () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    sounds.click();
    
    const soundOn = document.querySelector('.sound-on');
    const soundOff = document.querySelector('.sound-off');
    
    if (gameState.soundEnabled) {
        soundBtn.classList.add('active');
        soundOn.style.display = 'block';
        soundOff.style.display = 'none';
        soundLabel.textContent = 'Sound ON';
    } else {
        soundBtn.classList.remove('active');
        soundOn.style.display = 'none';
        soundOff.style.display = 'block';
        soundLabel.textContent = 'Sound OFF';
    }
});

// Event Listeners
restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sounds.click();
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.difficulty = btn.dataset.difficulty;
        initGame();
    });
});

// Initialize
// createParticles();
initGame();

// Back button sound
const backBtn = document.querySelector('.back-btn');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        sounds.click();
    });
}