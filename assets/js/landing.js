

// Sound Effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function activateAudioContext() {
    // Memeriksa jika context dalam status 'suspended'
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('AudioContext aktif. Suara sekarang bisa diputar.');
        });
    }
    
    // Hapus listener ini setelah berhasil dijalankan agar hanya terjadi sekali
    document.removeEventListener('click', activateAudioContext);
    document.removeEventListener('keydown', activateAudioContext);
    document.removeEventListener('DOMContentLoaded', activateAudioContext);
}

// Tambahkan listener untuk mendeteksi KLIK atau KEYDOWN di mana saja pada dokumen
document.addEventListener('click', activateAudioContext);
document.addEventListener('keydown', activateAudioContext);
document.addEventListener('DOMContentLoaded', activateAudioContext);

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        playSound(500, 0.05);
    });
});




// // --- tes bouncing ball ---

// window.onload = function() {
//     const debug = document.getElementById('debug');
//     const arena = document.querySelector('.arena-container');
//     const ball = document.getElementById('bouncing-ball');

//     let W, H, radius, dx, dy, x, y;

//     /**
//      * Menginisialisasi dan Reinisialisasi semua dimensi, posisi dan kecepatan
//      * berjalan sekali, dan setiap kali window di resize
//      */
//     function setup() {
//         W = arena.clientWidth; // Lebar Arena
//         H = arena.clientHeight; // Tinggi Arena

//         // Tentukan ukuran bola secara dinamis
//         // radius = W > 400 ? 15 : 10;
//         radius = 20;
//         const ballSize = radius * 2;

//         // Masukkan ballsize ke css ball
//         ball.style.width = `${ballSize}px`;
//         ball.style.height = `${ballSize}px`;

//         // Set Posisi bola di awal pas di tengah arena
//         x = W / 2;
//         y = H / 2;

        
//         // Velocity (speed & direction)
        
//         dx = Math.random() * 10;
//         dy = Math.random() * 10; 

//         setBallPosition();
//     }

//     /**
//      * Masukkan koordinat x,y yang sudah di kalkulasi ke posisi bola
//      */
//     function setBallPosition() {
//         // CSS 'transform: translate(-50%, -50%)' yang akan memusatkan elemen ke tengah.
//         ball.style.left = `${x}px`;
//         ball.style.top = `${y}px`;
//     }

//     /**
//      * The main animation loop.
//      */
//     function update() {
//         // memanggil fungsi update() sebelum browser menggambar frame berikutnya. lebih resource efficient daripada setInterval
//         requestAnimationFrame(update);
//         debug.textContent = `x: ${x} | y: ${y} | dx: ${dx} | dy: ${dy}`

//         // 1. Deteksi Collision (X-axis)
//         if (x + dx > W - radius) {
//             // Hit right edge: reverse direction and correct position
//             // Jika Collide di kanan
//             dx = -Math.abs(dx);
//             x = W - radius; 
//         } else if (x + dx < radius) {
//             // Hit left edge: reverse direction and correct position
//             // Jika Collide di kiri
//             dx = Math.abs(dx);
//             x = radius; 
//         }

//         // 2. Deteksi Collision (Y-axis)
//         if (y + dy > H - radius) {
//             // Hit bottom edge: reverse direction and correct position
//             // Jika Collide di bawah
//             dy = -Math.abs(dy);
//             y = H - radius;
//         } else if (y + dy < radius) {
//             // Hit top edge: reverse direction and correct position
//             // Jika Collide di atas
//             dy = Math.abs(dy);
//             y = radius;
//         }

//         // 3. Update posisi bola
//         x += dx;
//         y += dy;

//         // 4. apply posisi baru ke layar
//         setBallPosition();
//     }

//     // Mulai program
//     setup();
//     update();

//     // Setup ulang tiap kali window ter resize
//     window.addEventListener('resize', setup);
// };


// ======================Punya abi, dipta
// <body>
//     <!-- Canvas tempat bola akan bergerak -->
//     <canvas id="kanvas" width="400" height="300"></canvas>

//     <script>
//         // Mengambil elemen canvas dari HTML
//         const canvas = document.getElementById("kanvas");
//         // Mengambil context 2D agar bisa menggambar di canvas
//         const ctx = canvas.getContext("2d");

//         // Menentukan posisi awal bola
//         let x = 200;  // posisi horizontal
//         let y = 150;  // posisi vertikal
//         // Menentukan arah dan kecepatan bola
//         let dx = 2;   // kecepatan dan arah gerak sumbu X
//         let dy = 2;   // kecepatan dan arah gerak sumbu Y
//         const radius = 10; // jari-jari bola

//         /**
//          * Function: gambar()
//          * Fungsi ini dijalankan berulang-ulang untuk:
//          * 1. Menghapus gambar sebelumnya
//          * 2. Menggambar bola di posisi terbaru
//          * 3. Mengecek pantulan di tepi kotak
//          * 4. Memperbarui posisi bola
//          */
//         function gambar() {
//             // Menghapus gambar sebelumnya agar tidak menumpuk
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//             //ctx seperti pena digital yang digunakan untuk menggambar garis, lingkaran, warna, dan bentuk lainnya di canvas.
//             //clearRect = hapus bagian tertentu dari gambar di canvas.
//             //Angka-angka empat parameter (nilai) yang menjelaskan area mana yang mau dihapus dari pojok kiri atas (0,0) sampai ke ujung kanan bawah (seluas kanvas)

//             // Menggambar bola
//             ctx.beginPath();               // mulai menggambar bentuk baru
//             ctx.arc(x, y, radius, 0, Math.PI * 2);  // gambar lingkaran
//             ctx.fillStyle = "blue";        // warna bola
//             ctx.fill();                    // isi warna bola, Kalau tanpa ini, lingkarannya hanya berupa garis tepi (kosong di dalam).
//             ctx.closePath();               // akhiri gambar

//             // Mengecek apakah bola menyentuh dinding kanan/kiri
//             if (x + dx > canvas.width - radius || x + dx < radius) {
//                 dx = -dx; // balik arah horizontal / pantulkan ke arah sebaliknya
//             }

//             // Mengecek apakah bola menyentuh dinding atas/bawah
//             if (y + dy > canvas.height - radius || y + dy < radius) {
//                 dy = -dy; // balik arah vertikal / pantulkan ke arah sebaliknya
//             }

//             // Mengubah posisi bola sesuai arah gerak
//             x += dx;
//             y += dy;
//         }

//         /**
//          * Function: setInterval(gambar, 10)
//          * Fungsi ini menjalankan function gambar() setiap 10 milidetik.
//          * Artinya, animasi diperbarui terus-menerus sehingga bola terlihat bergerak.
//          */
//         setInterval(gambar, 10);
//     </script>
// </body>
// </html>