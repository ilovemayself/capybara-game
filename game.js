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
let capybaraSpeed = 2; // Скорость движения для наклонов телефона
let gameTimer, bombTimer, currentApple = null;
let capybaraX = window.innerWidth / 2;
let capybaraY = window.innerHeight / 2;

// Установка начальной позиции капибары
capybara.style.left = `${capybaraX}px`;
capybara.style.top = `${capybaraY}px`;

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

// Управление капибарой с помощью клавиш
window.addEventListener('keydown', (e) => {
  const step = 15;

  if (e.key === 'ArrowUp') capybaraY = Math.max(0, capybaraY - step);
  if (e.key === 'ArrowDown') capybaraY = Math.min(window.innerHeight - 60, capybaraY + step);
  if (e.key === 'ArrowLeft') capybaraX = Math.max(0, capybaraX - step);
  if (e.key === 'ArrowRight') capybaraX = Math.min(window.innerWidth - 60, capybaraX + step);

  capybara.style.left = `${capybaraX}px`;
  capybara.style.top = `${capybaraY}px`;

  checkCollision();
});

// Управление капибарой с помощью наклонов телефона
window.addEventListener('deviceorientation', (e) => {
  const x = e.gamma; // Наклон влево/вправо
  const y = e.beta; // Наклон вперёд/назад

  if (x !== null && y !== null) {
    capybaraX += x * capybaraSpeed;
    capybaraY += y * capybaraSpeed;

    capybaraX = Math.max(0, Math.min(window.innerWidth - 60, capybaraX));
    capybaraY = Math.max(0, Math.min(window.innerHeight - 60, capybaraY));

    capybara.style.left = `${capybaraX}px`;
    capybara.style.top = `${capybaraY}px`;

    checkCollision();
  }
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
