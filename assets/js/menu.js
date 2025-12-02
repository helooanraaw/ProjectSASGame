import { _supabase, checkSession } from './config.js'; // <-- Tambahkan ini
import { openLeaderboard } from './leaderboard.js'; // <--- TAMBAHKAN INI


// QuerySelectorAll => metode untuk memilih elemen SEMUA HTML yang cocok 
// dengan pemilih CSS yang diberikan, seperti ID, kelas, atau tag

// QuerySelector => metode untuk memilih elemen HTML pertama yang cocok 
// dengan pemilih CSS yang diberikan, seperti ID, kelas, atau tag


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
        leaderboardBtn.addEventListener('click', openLeaderboard);
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

// Fungsi Generic untuk menutup modal apapun
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.remove('active');
        if(typeof playSound === 'function') playSound(400, 0.1);
    }
}

// Menutup modal jika user klik di area gelap (overlay)
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
});
