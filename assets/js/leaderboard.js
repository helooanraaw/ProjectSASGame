import { _supabase } from './config.js'; 

// Fungsi dipanggil saat tombol Leaderboard di klik
// JADIKAN SEBAGAI EXPORT AGAR BISA DIAKSES MODUL LAIN (menu.js)
export function openLeaderboard() { 
    document.getElementById('leaderboardModal').classList.add('active');
    loadLeaderboard();
}


async function loadLeaderboard() {
    const listEl = document.getElementById('leaderboardList');
    listEl.innerHTML = '<p style="text-align:center;">Mengambil data rank...</p>';

    // Ambil Top 10 Score Tertinggi (Global / Semua Difficulty)
    const { data, error } = await _supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false }) // Urutkan dari score terbesar
        .limit(10); // Ambil 10 aja

    if (error) {
        listEl.innerHTML = '<p style="text-align:center; color:#ef4444">Gagal memuat data.</p>';
        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        listEl.innerHTML = '<p style="text-align:center; color:#94a3b8">Belum ada pemain.</p>';
        return;
    }

    let html = '';
    data.forEach((item, index) => {
        // Tentukan warna medali untuk juara 1, 2, 3
        let rankClass = 'rank-num';
        let rankDisplay = `#${index + 1}`;
        
        if (index === 0) rankDisplay = '🥇';
        if (index === 1) rankDisplay = '🥈';
        if (index === 2) rankDisplay = '🥉';

        html += `
            <div class="lb-item">
                <div class="lb-left">
                    <span class="${rankClass}">${rankDisplay}</span>
                    <div class="lb-info">
                        <span class="lb-user">${item.username}</span>
                    </div>
                </div>
                <div class="lb-right">
                    <div class="lb-score">${item.score} <small>pts</small></div>
                </div>
            </div>
        `;
    });

    listEl.innerHTML = html;
}