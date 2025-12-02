// game.js (Baris Paling Atas)
import { _supabase, checkSession } from './config.js'; // <--- BARIS INI HILANG DARI KODE ANDA YANG BARU
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
    //Parameter yang dimasukkan adalah
    //(frekuensi tone, berapa lama tone tersebut dimainkan)
    flip: () => playTone(400, 0.1),
    match: () => playTone(800, 0.2),
    wrong: () => playTone(200, 0.3),


    //(frekuensi SETIAP tone, berapa lama SETIAP tone tersebut dimainkan)
    win: () => playMelody([523, 659, 784, 1047], 0.15),

    click: () => playTone(600, 0.05)
};

function playTone(frequency, duration) {
    //Kalau soundEnabled mati, batal
    if (!gameState.soundEnabled) return;
    
    // Membuat OscillatorNode. Ini adalah sumber suara (generator gelombang). 
    // Objek inilah yang secara matematis menghasilkan gelombang suara.
    const oscillator = audioContext.createOscillator();

    //Membuat GainNode. Ini bertindak sebagai pengatur volume (atau gain) 
    // dalam jalur audio.
    const gainNode = audioContext.createGain();
    

    //Menghubungkan keluaran suara dari oscillator (sumber suara) ke 
    //masukan dari gainNode (pengatur volume).
    oscillator.connect(gainNode);

    //Menghubungkan keluaran suara dari gainNode ke tujuan akhir suara
    //yaitu speaker / headphone komputer 
    gainNode.connect(audioContext.destination);
    

    //Mengatur nilai frekuensi (pitch) dari osilator sesuai 
    // dengan nilai parameter frequency yang diberikan.
    oscillator.frequency.value = frequency;

    //set tipe gelombang ke gelombang sinus
    //Gelombang sinus menghasilkan nada murni atau beep yang lembut.
    oscillator.type = 'sine';
    

    //Mengatur volume awal suara menjadi 0.3 (dari maksimal 1.0) tepat pada waktu saat ini
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    //Ini memerintahkan volume untuk menurun secara eksponensial (halus) 
    // dari nilai saat ini (0.3) ke 0.01 dalam waktu selama duration. (fade out)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    

    //Memerintahkan osilator untuk mulai menghasilkan suara segera pada waktu saat ini.
    oscillator.start(audioContext.currentTime);

    //Memerintahkan osilator untuk menghentikan suara setelah waktu duration berlalu
    oscillator.stop(audioContext.currentTime + duration);
}

//berfungsi untuk memainkan serangkaian tone
function playMelody(frequencies, noteDuration) {
    ////Kalau soundEnabled mati, batal
    if (!gameState.soundEnabled) return;
    
    //untuk setiap elemen(tone) di dalam array frequencies
    frequencies.forEach((freq, index) => {
        //setTimeout, yaitu menunda eksekusi kode yang berada di dalamnya
        //selama waktu yang di set
        setTimeout(() => {
            playTone(freq, noteDuration);
        }, index * (noteDuration * 1000));
        //index * (noteDuration * 1000)) mengatur lama waktu tunda sebelum nada dimainkan (milisecond)
        //noteDuration * 1000: Mengubah durasi nada dari detik menjadi milidetik.
        //"index *" memastikan tone dimainkan secara bergantian
    });
}

// Anime Images
// Path gambar" kartu di setiap difficulty
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
function createParticles() {
    for (let i = 0; i < 20; i++) {
        //buat element div di dom
        const particle = document.createElement('div');
        //beri kelas particle
        particle.className = 'particle';
        //set posisi X random
        particle.style.left = Math.random() * 100 + '%';
        //set delay animasi random
        particle.style.animationDelay = Math.random() * 15 + 's';
        //set durasi animasi random (diatas 10 detik)
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        //masukkan particle ke dalam div particles
        particles.appendChild(particle);
    }
}

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
// selesaikan game
async function endGame() {
    stopTimer();
    sounds.win();
    
    const timeBonus = Math.max(0, 300 - gameState.timer) * 2;
    const moveBonus = Math.max(0, 50 - gameState.moves) * 10;
    const difficultyBonus = difficulties[gameState.difficulty].bonus;
    const finalScore = gameState.score + timeBonus + moveBonus + difficultyBonus;
    
    gameState.score = finalScore;
    console.log('Final Score yang didapat:', finalScore);
    
    // Update Tampilan Modal
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('finalTime').textContent = timerEl.textContent;
    document.getElementById('finalMoves').textContent = gameState.moves;
    document.getElementById('finalCombo').textContent = `x${gameState.combo}`;
    
    winModal.classList.remove('hidden');

    // --- LOGIC SIMPAN KE SUPABASE ---
    //Ambil user data dari localstorage
    const user = JSON.parse(localStorage.getItem('user_data'));

    if (user) {
        // 1. Ambil Skor Lama (Hanya untuk membandingkan)
        const { data: existingEntry, error: fetchError } = await _supabase
            .from('leaderboard')
            .select('score')
            .eq('user_id', user.id)
            .maybeSingle(); // Gunakan maybeSingle agar tidak error jika tidak ada data

        const currentHighScore = existingEntry ? existingEntry.score : 0;

        // 2. Bandingkan dan Lakukan UPSERT
        if (finalScore > currentHighScore) {
            console.log("Melakukan UPSERT karena skor baru lebih tinggi!");
            
            const { error: upsertError } = await _supabase
                .from('leaderboard')
                .upsert(
                    {
                        user_id: user.id, // Ini adalah kunci konflik (Primary Key baru Anda)
                        username: user.username, // Pertahankan kolom ini jika Anda tidak menghapusnya
                        score: finalScore,
                        time: gameState.timer,
                        moves: gameState.moves,
                    }, 
                    { 
                        onConflict: 'user_id' 
                        // Jika user_id bentrok, update semua kolom yang diberikan di atas.
                    }
                );
                
            if (upsertError) {
                console.error("Gagal save high score:", upsertError);
            } else {
                console.log("New High Score saved!");
            }
        } else {
            console.log("TIDAK melakukan UPSERT karena skor baru TIDAK lebih tinggi.");
            console.log(`Skor baru (${finalScore}) tidak lebih tinggi dari High Score lama (${currentHighScore}). Tidak disimpan.`);
        }
    }
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

// createParticles();
// initGame();

// Back button sound
const backBtn = document.querySelector('.back-btn');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        sounds.click();
    });
}

// Gunakan DOMContentLoaded untuk memastikan semua elemen HTML (gameGrid, dll) sudah ada.
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initGame();
});