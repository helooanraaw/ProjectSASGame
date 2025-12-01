// Cek sesi login saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Fungsi checkSession harus ada di config.js
    const user = checkSession(); 
    if (user) {
        document.getElementById('displayUsername').textContent = user.username;
    }
});

// --- FUNGSI MODAL ---

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

// --- FUNGSI LOGOUT ---
function handleLogout() {
    if(confirm("Apakah kamu yakin ingin keluar akun?")) {
        // Hapus data user dari penyimpanan lokal
        localStorage.removeItem('user_data');
        
        // (Opsional) Sign out dari Supabase juga agar sesi server bersih
        _supabase.auth.signOut().then(() => {
            window.location.href = 'login.html';
        });
    }
}