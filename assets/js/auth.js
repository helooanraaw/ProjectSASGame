// REGISTER LOGIC
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;
        const errorMsg = document.getElementById('regError');

        // Validasi Password
        if (password !== confirm) {
            errorMsg.textContent = "Password tidak sama!";
            errorMsg.style.display = 'block';
            return;
        }

        // Cek apakah username/email sudah ada
        const { data: existingUser } = await _supabase
            .from('users')
            .select('*')
            .or(`email.eq.${email},username.eq.${username}`);

        if (existingUser && existingUser.length > 0) {
            errorMsg.textContent = "Username atau Email sudah terdaftar!";
            errorMsg.style.display = 'block';
            return;
        }

        // Insert ke Database
        const { error } = await _supabase
            .from('users')
            .insert([{ username, email, password }]);

        if (error) {
            errorMsg.textContent = "Gagal mendaftar: " + error.message;
            errorMsg.style.display = 'block';
        } else {
            alert("Pendaftaran berhasil! Silakan login.");
            window.location.href = 'login.html';
        }
    });
}

// LOGIN LOGIC
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorMsg = document.getElementById('loginError');
        const btn = document.querySelector('.auth-btn');

        btn.textContent = 'Memuat...';
        btn.disabled = true;

        // Query manual ke tabel users (sesuai request SQL kamu)
        const { data, error } = await _supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();

        if (error || !data) {
            errorMsg.textContent = "Email atau Password salah!";
            errorMsg.style.display = 'block';
            btn.textContent = 'Main Sekarang';
            btn.disabled = false;
        } else {
            // Simpan sesi di LocalStorage
            localStorage.setItem('user_data', JSON.stringify({
                id: data.id,
                username: data.username,
                email: data.email
            }));
            
            window.location.href = 'menu.html';
        }
    });
}