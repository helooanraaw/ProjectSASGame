import { _supabase, checkSession } from './config.js'; // <-- Tambahkan ini
import { openLeaderboard } from './leaderboard.js'; // <--- TAMBAHKAN INI


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


// QuerySelectorAll => metode untuk memilih elemen SEMUA HTML yang cocok 
// dengan pemilih CSS yang diberikan, seperti ID, kelas, atau tag

// QuerySelector => metode untuk memilih elemen HTML pertama yang cocok 
// dengan pemilih CSS yang diberikan, seperti ID, kelas, atau tag


const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration) {
    
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
    createParticles()

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
