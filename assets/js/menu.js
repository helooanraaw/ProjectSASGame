import { _supabase, checkSession } from './config.js'; // <-- Tambahkan ini
import { openLeaderboard } from './leaderboard.js'; // <--- TAMBAHKAN INI


// QuerySelectorAll => metode untuk memilih elemen SEMUA HTML yang cocok 
// dengan pemilih CSS yang diberikan, seperti ID, kelas, atau tag

// QuerySelector => metode untuk memilih elemen HTML pertama yang cocok 
// dengan pemilih CSS yang diberikan, seperti ID, kelas, atau tag


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

// --- FUNGSI LOGOUT ---
// Fungsi ini harus dideklarasikan di scope modul
function handleLogout() {
    if(confirm("Apakah kamu yakin ingin keluar akun?")) {
        // Hapus data user dari penyimpanan lokal
        localStorage.removeItem('user_data');
        
        // Sign out dari Supabase
        _supabase.auth.signOut().then(() => {
            window.location.href = '../index.html';
        }).catch(err => {
            console.error("Logout failed:", err);
            window.location.href = '../index.html'; // Tetap redirect jika gagal
        });
    }
}


// Cek sesi login saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Tampilkan username
    // cek config.js untuk informasi lebih lanjut tentang checkSession
    const user = checkSession(); 

    //set displayUsername menjadi username user
    if (user) {
        document.getElementById('displayUsername').textContent = user.username;
    }

    // tambahkan event listener click untuk tombol button
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // Anda juga harus mengaitkan fungsi modal di sini
    const teamBtn = document.querySelector('.menu-btn.info-btn');
    if (teamBtn){ 
        teamBtn.addEventListener('click', showTeamModal);
    }

    const tutorialBtn = document.querySelector('.menu-btn.tutorial-btn');
    if (tutorialBtn){
        tutorialBtn.addEventListener('click', showTutorialModal);
    }

    // Pastikan tombol leaderboard juga dikaitkan
    const leaderboardBtn = document.querySelector('.menu-btn.leaderboard-btn');
    if (leaderboardBtn){
        leaderboardBtn.addEventListener('click', showLeaderboardModal);
    } 


});

// --- FUNGSI MODAL (pop up) ---

function showTeamModal() {
    const modal = document.getElementById('teamModal');
    if(modal) {
        modal.classList.add('active');
        // Efek suara jika ada function playSound di landing.js
        if(typeof playSound === 'function') playSound(600, 0.1); 
    }
}

function showTutorialModal() {
    const modal = document.getElementById('tutorialModal');
    if(modal) {
        modal.classList.add('active');
        if(typeof playSound === 'function') playSound(600, 0.1);
    }
}

function showLeaderboardModal() {
    openLeaderboard();
    if(typeof playSound === 'function') playSound(600, 0.1); 
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

// Button hover sounds
document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        playSound(500, 0.05);
    });
});

function closeModal(modalId) {
    playSound(400, 0.1);
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}




window.closeModal = closeModal;
// Daftarkan fungsi closeModal (yang hidup di dalam module menu.js) ke global (window), 
// supaya bisa dipanggil dari HTML.
