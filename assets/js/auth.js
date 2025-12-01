// REGISTER
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim(); // trim spasi
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;
        const errorMsg = document.getElementById('regError');
        const btn = document.querySelector('.auth-btn');

        // Reset error display
        errorMsg.style.display = 'none';

        if (password !== confirm) {
            errorMsg.textContent = "Password konfirmasi tidak cocok!";
            errorMsg.style.display = 'block';
            return;
        }

        if (password.length < 6) {
            errorMsg.textContent = "Password minimal 6 karakter!";
            errorMsg.style.display = 'block';
            return;
        }

        btn.textContent = 'Mendaftar...';
        btn.disabled = true;

        try {
            // Cek duplikat username/email manual (karena Supabase kadang return error constraint)
            const { data: existing } = await _supabase
                .from('users')
                .select('id')
                .or(`email.eq.${email},username.eq.${username}`);

            if (existing && existing.length > 0) {
                throw new Error("Username atau Email sudah dipakai!");
            }

            // Insert User Baru
            const { error } = await _supabase
                .from('users')
                .insert([{ username, email, password }]);

            if (error) throw error;

            alert("Pendaftaran BERHASIL! Silakan login dengan akun barumu.");
            window.location.href = 'login.html';

        } catch (err) {
            errorMsg.textContent = err.message;
            errorMsg.style.display = 'block';
            btn.textContent = 'Buat Akun';
            btn.disabled = false;
        }
    });
}

// LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorMsg = document.getElementById('loginError');
        const btn = document.querySelector('.auth-btn');

        // Reset
        errorMsg.style.display = 'none';
        btn.textContent = 'Memuat...';
        btn.disabled = true;

        try {
            const { data, error } = await _supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .maybeSingle(); // Gunakan maybeSingle agar tidak error jika kosong

            if (error) throw error;
            
            if (!data) {
                throw new Error("Email atau Password salah!");
            }

            // Simpan sesi
            localStorage.setItem('user_data', JSON.stringify({
                id: data.id,
                username: data.username,
                email: data.email
            }));
            
            // Redirect ke menu
            window.location.href = 'menu.html';

        } catch (err) {
            errorMsg.textContent = err.message;
            errorMsg.style.display = 'block';
            btn.textContent = 'Main Sekarang';
            btn.disabled = false;
        }
    });
}