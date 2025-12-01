function openLeaderboard() {
    document.getElementById('leaderboardModal').classList.add('active');
    loadLeaderboard('medium'); // Default load medium
}

async function loadLeaderboard(difficulty) {
    const listEl = document.getElementById('leaderboardList');
    listEl.innerHTML = '<p style="text-align:center;">Mengambil data...</p>';

    // Update tombol aktif
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if(btn.textContent.toLowerCase() === difficulty) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Ambil data dari Supabase
    const { data, error } = await _supabase
        .from('leaderboard')
        .select('*')
        .eq('difficulty', difficulty)
        .order('score', { ascending: false }) // Score tertinggi di atas
        .limit(10);

    if (error) {
        listEl.innerHTML = '<p style="text-align:center; color:red">Gagal memuat data.</p>';
        return;
    }

    if (data.length === 0) {
        listEl.innerHTML = '<p style="text-align:center;">Belum ada record.</p>';
        return;
    }

    let html = '';
    data.forEach((item, index) => {
        html += `
            <div class="lb-item">
                <span class="lb-rank">#${index + 1}</span>
                <span class="lb-user">${item.username}</span>
                <div style="text-align:right">
                    <div class="lb-score">${item.score} pts</div>
                    <small style="color:#64748b">${item.moves} moves</small>
                </div>
            </div>
        `;
    });

    listEl.innerHTML = html;
}