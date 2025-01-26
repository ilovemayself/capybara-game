// Элементы
const capybara = document.getElementById('capybara');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const gameOverScreen = document.getElementById('game-over-screen');
const restartButton = document.getElementById('restart-button');
const finalScore = document.getElementById('final-score');

// Звуки
const catchSound = document.getElementById('catch-sound');
const gameOverSound = document.getElementById('game-over-sound');
const themeMusic = document.getElementById('theme-music');

let score = 0;
let time = 60;
let bombInterval = 10000; // Интервал появления бомб
let gameTimer, bombTimer, currentApple = null;

// Таймер игры
function startTimer() {
  gameTimer = setInterval(() => {
    if (time > 0) {
      time--;
      timerDisplay.textContent = `Time: ${time}s`;
    } else {
      endGame();
    }
  }, 1000);
}

// Создание яблока
function createApple() {
  if (currentApple) currentApple.remove();
  currentApple = document.createElement('div');
  currentApple.id = 'item';
  currentApple.style.top = `${Math.random() * (window.innerHeight - 50)}px`;
  currentApple.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
  document.body.appendChild(currentApple);
}

// Создание бомбы
function createBomb() {
  const bomb = document.createElement('div');
  bomb.id = 'bomb';
  bomb.style.top = `${Math.random() * (window.innerHeight - 50)}px`;
  bomb.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
  document.body.appendChild(bomb);
}

// Проверка столкновений
function checkCollision() {
  const capyRect = capybara.getBoundingClientRect();

  if (currentApple) {
    const appleRect = currentApple.getBoundingClientRect();
    if (
      capyRect.left < appleRect.right &&
      capyRect.right > appleRect.left &&
      capyRect.top < appleRect.bottom &&
      capyRect.bottom > appleRect.top
    ) {
      score++;
      scoreDisplay.textContent = `Score: ${score}`;
      catchSound.play();
      createApple();
    }
  }

  document.querySelectorAll('#bomb').forEach((bomb) => {
    const bombRect = bomb.getBoundingClientRect();
    if (
      capyRect.left < bombRect.right &&
      capyRect.right > bombRect.left &&
      capyRect.top < bombRect.bottom &&
      capyRect.bottom > bombRect.top
    ) {
      endGame();
    }
  });
}

// Конец игры
function endGame() {
  clearInterval(gameTimer);
  clearInterval(bombTimer);
  themeMusic.pause();
  gameOverSound.play();
  finalScore.textContent = score;
  gameOverScreen.style.display = 'block';
}

// Управление капибарой на стрелках
let capybaraSpeed = 10;
window.addEventListener('keydown', (e) => {
  const capyStyle = getComputedStyle(capybara);
  const capyLeft = parseInt(capyStyle.left);
  const capyTop = parseInt(capyStyle.top);

  if (e.key === 'ArrowUp' && capyTop > 0) {
    capybara.style.top = `${capyTop - capybaraSpeed}px`;
  }
  if (e.key === 'ArrowDown' && capyTop < window.innerHeight - 60) {
    capybara.style.top = `${capyTop + capybaraSpeed}px`;
  }
  if (e.key === 'ArrowLeft' && capyLeft > 0) {
    capybara.style.left = `${capyLeft - capybaraSpeed}px`;
  }
  if (e.key === 'ArrowRight' && capyLeft < window.innerWidth - 60) {
    capybara.style.left = `${capyLeft + capybaraSpeed}px`;
  }

  checkCollision();
});

// Запуск игры
function startGame() {
  themeMusic.play();
  createApple();
  bombTimer = setInterval(createBomb, bombInterval);
  startTimer();
}

restartButton.addEventListener('click', () => location.reload());

startGame();
