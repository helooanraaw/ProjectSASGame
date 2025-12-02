// Masukkan URL dan Key dari Supabase kamu di sini
//Semua request (login, signup, fetch data, dll) akan dikirim ke URL ini.
const SUPABASE_URL = 'https://xubyecwuwpoyggzlwgov.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1YnllY3d1d3BveWdnemx3Z292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Njc3NDUsImV4cCI6MjA4MDE0Mzc0NX0.QYxUScDKazwF_UE7zrlyvF5c6pCBJ-AjATfyLlkyLwI';

// Inisialisasi Client Supabase
// Kita menggunakan library global yang di-load via CDN di HTML
//export =  object Supabase supaya bisa dipakai di semua file JS.
// _supabase adalah “koneksi ke database”.
export const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


//Local Storage adalah fitur pada peramban web (browser) yang memungkinkan 
// aplikasi web Anda menyimpan data dalam jumlah kecil secara permanen di 
// sisi klien (komputer atau perangkat pengguna).

//Data yang disimpan dalam local storage berbentuk string, maka dari itu saat diambil
//harus menggunakan JSON.parse agar terubak menjadi objek javascript yang bisa
//digunakan 
// - Oriont note

// Fungsi Utility untuk cek login
export function checkSession() {
    const user = localStorage.getItem('user_data');
    if (!user) {
        // Jika user_data kosong berarti belum login.
        // Maka harus dipaksa kembali ke halaman login. sehingga tidak langsung ke hal game
        window.location.href = 'login.html'; 
    }
    // Mengembalikan data pengguna yang tersimpan
    return JSON.parse(user); 
}