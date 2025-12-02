import { _supabase } from './config.js';

// =======================
// REGISTER LOGIC
// =======================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
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
            // 1. Cek duplikat Username (Hanya diperlukan karena Supabase Auth tidak menangani unique username)
            const { data: existing } = await _supabase
                .from('users')
                .select('id')
                .eq('username', username);

            if (existing && existing.length > 0) {
                throw new Error("Username sudah dipakai!");
            }

            // 2. Supabase Auth Sign Up
            const { data: signUpData, error: signUpError } = await _supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (signUpError) throw signUpError;
            
            // 3. Insert Username ke Tabel 'users' (Membuat Profil)
            if (signUpData.user) {
                const { error: userInsertError } = await _supabase
                    .from('users')
                    .insert([
                        // ID UUID diambil dari Supabase Auth
                        { id: signUpData.user.id, username: username } 
                    ]);
                
                if (userInsertError) throw userInsertError;
            }

            // Tangani Alur Konfirmasi Email
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


// =======================
// LOGIN LOGIC
// =======================
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
            // 1. Supabase Auth Sign In
            // Assign the entire returned object to 'authResult'
            const authResult = await _supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            // Access properties using dot notation (authResult.data and authResult.error)
            const authData = authResult.data;
            const authError = authResult.error;

            if (authError) {
                throw new Error(authError.message === 'Invalid login credentials' 
                                    ? "Email atau Password salah!" 
                                    : authError.message);
            }

            // 2. Ambil data username dari tabel 'users'
            const user_id = authData.user.id;
            // Ambil email dari authData.user untuk disimpan di LocalStorage
            const user_email = authData.user.email; 
            
            // Assign the entire returned object to 'userResult'
            const userResult = await _supabase
                .from('users')
                .select('id, username') // Hanya perlu ID dan Username dari tabel 'users'
                .eq('id', user_id)
                .maybeSingle();

            // Access properties using dot notation (userResult.data and userResult.error)
            const userData = userResult.data;
            const userError = userResult.error;

            if (userError) throw userError;
            if (!userData) throw new Error("Data pengguna tidak ditemukan di database!");

            // 3. Simpan sesi lengkap (termasuk email dari authData) ke localStorage
            localStorage.setItem('user_data', JSON.stringify({
                id: userData.id,
                username: userData.username,
                email: user_email 
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