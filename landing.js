
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

// Sound Effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Modal functions
function showTeamModal() {
    playSound(600, 0.1);
    const modal = document.getElementById('teamModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function showTutorialModal() {
    playSound(600, 0.1);
    const modal = document.getElementById('tutorialModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    playSound(400, 0.1);
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
// QuerySelectorAll => metode untuk memilih elemen SEMUA HTML yang cocok 
// dengan pemilih CSS yang diberikan, seperti ID, kelas, atau tag
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

// Close modal with ESC key
// QuerySelectorAll => metode untuk memilih elemen SEMUA HTML yang cocok 
// dengan pemilih CSS yang diberikan, seperti ID, kelas, atau tag
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            closeModal(modal.id);
        });
    }
});

// Button hover sounds
// QuerySelectorAll => metode untuk memilih elemen SEMUA HTML yang cocok 
// dengan pemilih CSS yang diberikan, seperti ID, kelas, atau tag
document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        playSound(500, 0.05);
    });
});

// Initialize
createParticles();

// Back button sound
// QuerySelector => metode untuk memilih elemen HTML pertama yang cocok 
// dengan pemilih CSS yang diberikan, seperti ID, kelas, atau tag
const backBtn = document.querySelector('.back-btn');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        playSound(400, 0.1);
    });
}
