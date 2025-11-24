const grid = document.getElementById("grid");
const stepsText = document.getElementById("steps");
const popup = document.getElementById("win-popup");
const finalSteps = document.getElementById("final-steps");
const restartBtn = document.getElementById("restart-btn"); 


let imageNames = ["image1.png", "image2.png", "image3.png", "image4.png", "image5.png", "image6.png"];

// Buat array pasangan (12 elemen)
let images = [...imageNames, ...imageNames];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let steps = 0;

function shuffle(array) {
  // Algoritma Fisher-Yates (lebih baik) atau cara singkat (seperti di bawah)
  return array.sort(() => Math.random() - 0.5);
}

function createBoard() {
  grid.innerHTML = "";
  const shuffled = shuffle([...images]);

  shuffled.forEach(imageName => {
    const card = document.createElement("div");
    card.classList.add("card");

    // --- GANTI EMOJI DENGAN TAG <img> ---
    card.innerHTML = `
      <div class="front"></div>
      <div class="back">
        <img src="images/${imageName}" alt="Kartu Memori" class="card-image">
      </div>
    `;

    card.addEventListener("click", () => flipCard(card));

    grid.appendChild(card);
  });
}

function flipCard(card) {
  // Gunakan 'matched' dan 'flipped' dari kelas CSS Anda
  if (lockBoard || card === firstCard || card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  steps++;
  stepsText.textContent = steps;

  checkMatch();
}

function checkMatch() {
  lockBoard = true;

  // --- CARA MENDAPATKAN NILAI KARTU BARU (mengambil path gambar dari src) ---
  const img1Src = firstCard.querySelector(".back img").getAttribute("src");
  const img2Src = secondCard.querySelector(".back img").getAttribute("src");

  // Membandingkan path gambar
  if (img1Src === img2Src) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    resetTurn();
    checkWin();
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

function checkWin() {
  const matched = document.querySelectorAll(".matched");
  // Periksa panjang array 'images' (yang berisi 8 elemen)
  if (matched.length === images.length) {
    finalSteps.textContent = steps;
    popup.classList.remove("hidden");
  }
}

// Fungsi restartGame sudah didefinisikan secara global
function restartGame() {
  popup.classList.add("hidden");
  steps = 0;
  stepsText.textContent = 0;
  firstCard = null;
  secondCard = null;

  createBoard();
}

// Tambahkan event listener untuk tombol restart
document.getElementById("restart-btn").addEventListener("click", restartGame);

// Panggil createBoard untuk pertama kali
createBoard();