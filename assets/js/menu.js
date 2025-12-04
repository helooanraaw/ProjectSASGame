// menu.js
import { _supabase, checkSession } from './config.js';
import { openLeaderboard } from './leaderboard.js'; // <--- TAMBAHKAN INI

// Cek sesi user saat halaman dimuat
document.addEventListener('DOMContentLoaded', async () => {
    const user = checkSession();
    if (!user) return; // Jika tidak ada sesi, checkSession akan redirect

    // Tampilkan username
    const displayUsername = document.getElementById('displayUsername');
    if (displayUsername) {
        displayUsername.textContent = user.username;
    }

    // Initialize Particles
    createParticles();

    // Fetch Leaderboard Preview
    fetchLeaderboardPreview();
});

// Sakura Particles Logic
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 30; // Number of sakura petals

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'sakura';
        
        // Random Position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random Size
        const size = Math.random() * 10 + 10 + 'px'; // 10px to 20px
        particle.style.width = size;
        particle.style.height = size;
        
        // Random Animation Duration & Delay
        particle.style.animationDuration = (Math.random() * 5 + 5) + 's, ' + (Math.random() * 2 + 2) + 's'; // Fall, Sway
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        particlesContainer.appendChild(particle);
    }
}

// Fetch Leaderboard Preview (Top 5)
async function fetchLeaderboardPreview() {
    const previewList = document.getElementById('leaderboardPreviewList');
    if (!previewList) return;

    try {
        const { data, error } = await _supabase
            .from('leaderboard')
            .select('username, score')
            .order('score', { ascending: false })
            .limit(5);

        if (error) throw error;

        previewList.innerHTML = '';

        if (data && data.length > 0) {
            data.forEach((player, index) => {
                const rankClass = index < 3 ? `rank-${index + 1}` : '';
                const item = document.createElement('div');
                item.className = 'preview-item';
                item.innerHTML = `
                    <span class="rank-num ${rankClass}">#${index + 1}</span>
                    <span class="p-name">${player.username}</span>
                    <span class="p-score">${player.score}</span>
                `;
                previewList.appendChild(item);
            });
        } else {
            previewList.innerHTML = '<p class="loading-text-sm">Belum ada data.</p>';
        }

    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        previewList.innerHTML = '<p class="loading-text-sm">Gagal memuat.</p>';
    }
}

// Modal Functions (Global Scope)
window.showTeamModal = function() {
    document.getElementById('teamModal').classList.add('active');
};

window.showTutorialModal = function() {
    document.getElementById('tutorialModal').classList.add('active');
};

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
};

// Leaderboard Modal Logic
const viewAllBtn = document.getElementById('viewAllLeaderboard');
const leaderboardModal = document.getElementById('leaderboardModal');

if (viewAllBtn) {
    viewAllBtn.addEventListener('click', openLeaderboard);
}

// function openLeaderboard() {
//     leaderboardModal.classList.add('active');
//     if (window.refreshLeaderboard) {
//         window.refreshLeaderboard();
//     }
// }

// Logout Logic
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
        if (confirmLogout) {
            localStorage.removeItem('user_session');
            window.location.href = '../index.html';
        }
    });
}
