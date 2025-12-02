

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

function activateAudioContext() {
    // Memeriksa jika context dalam status 'suspended'
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('AudioContext aktif. Suara sekarang bisa diputar.');
        });
    }
    
    // Hapus listener ini setelah berhasil dijalankan agar hanya terjadi sekali
    document.removeEventListener('click', activateAudioContext);
    document.removeEventListener('keydown', activateAudioContext);
}

// Tambahkan listener untuk mendeteksi KLIK atau KEYDOWN di mana saja pada dokumen
document.addEventListener('click', activateAudioContext);
document.addEventListener('keydown', activateAudioContext);

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        playSound(500, 0.05);
    });
});


