// Элементы
const capybara = document.getElementById('capybara');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');

// Звуки
const catchSound = document.getElementById('catch-sound');
const goldenSound = document.getElementById('golden-sound');
const gameOverSound = document.getElementById('game-over-sound');
const themeMusic = document.getElementById('theme-music');

let score = 0;
let time = 60;
let currentApple = null;
let bombs = [];
let bombInterval = 10000;
let bombCreationTimer;

// Включение музыки
function startMusic() {
  themeMusic.volume = 0.5;
  themeMusic.play().catch(err => console.error('Audio playback blocked:', err));
}

// Таймер
const timer = setInterval(() => {
  if (time > 0) {
    time--;
    timerDisplay.textContent = `Time: ${time}s`;
  } else {
    clearInterval(timer);
    clearInterval(bombCreationTimer);
    endGame();
  }
}, 1000);

// Начальная позиция капибары
capybara.style.top = '200px';
capybara.style.left = '200px';

// Проверка, мобильное ли устройство
const isMobile = window.innerWidth <= 768;

// Управление для мобильных устройств через наклон
let tiltX = 0;
let tiltY = 0;

if (isMobile) {
  window.addEventListener('deviceorientation', (event) => {
    tiltX = event.beta; // наклон по оси X (вверх-вниз)
    tiltY = event.gamma; // наклон по оси Y (влево-вправо)

    const rect = capybara.getBoundingClientRect();
    const step = 5;

    // Управление по оси X
    if (tiltY > 5 && rect.right < window.innerWidth) {
      capybara.style.left = `${rect.left + step}px`;
    } else if (tiltY < -5 && rect.left > 0) {
      capybara.style.left = `${rect.left - step}px`;
    }

    // Управление по оси Y
    if (tiltX > 5 && rect.bottom < window.innerHeight) {
      capybara.style.top = `${rect.top + step}px`;
    } else if (tiltX < -5 && rect.top > 0) {
      capybara.style.top = `${rect.top - step}px`;
    }

    checkCollision();
  });
} else {
  // Управление на компьютере через клавиши
  document.addEventListener('keydown', (e) => {
    startMusic(); // Включаем музыку
    const rect = capybara.getBoundingClientRect();
    const step = 15;

    if (e.key === 'ArrowUp' && rect.top > 0) {
      capybara.style.top = `${rect.top - step}px`;
    } else if (e.key === 'ArrowDown' && rect.bottom < window.innerHeight) {
      capybara.style.top = `${rect.top + step}px`;
    } else if (e.key === 'ArrowLeft' && rect.left > 0) {
      capybara.style.left = `${rect.left - step}px`;
    } else if (e.key === 'ArrowRight' && rect.right < window.innerWidth) {
      capybara.style.left = `${rect.left + step}px`;
    }

    checkCollision();
  });
}

// Создание яблока
function createApple() {
  if (currentApple) return;

  const apple = document.createElement('div');
  const x = Math.random() * (window.innerWidth - 50);
  const y = Math.random() * (window.innerHeight - 50);

  const isGolden = Math.random() < 0.3;

  apple.id = isGolden ? 'golden-item' : 'item';
  apple.style.left = `${x}px`;
  apple.style.top = `${y}px`;
  document.body.appendChild(apple);
  currentApple = apple;
}

// Создание бомбы
function createBomb() {
  const bomb = document.createElement('div');
  let x, y;

  do {
    x = Math.random() * (window.innerWidth - 50);
    y = Math.random() * (window.innerHeight - 50);
  } while (
    currentApple &&
    Math.abs(x - parseFloat(currentApple.style.left)) < 50 &&
    Math.abs(y - parseFloat(currentApple.style.top)) < 50
  );

  bomb.id = 'bomb';
  bomb.style.left = `${x}px`;
  bomb.style.top = `${y}px`;
  document.body.appendChild(bomb);
  bombs.push(bomb);
}

// Проверка столкновений
function checkCollision() {
  const capybaraRect = capybara.getBoundingClientRect();

  if (currentApple) {
    const appleRect = currentApple.getBoundingClientRect();
    if (
      capybaraRect.left < appleRect.right &&
      capybaraRect.right > appleRect.left &&
      capybaraRect.top < appleRect.bottom &&
      capybaraRect.bottom > appleRect.top
    ) {
      score += currentApple.id === 'golden-item' ? 5 : 1;
      scoreDisplay.textContent = `Score: ${score}`;
      (currentApple.id === 'golden-item' ? goldenSound : catchSound).play();
      currentApple.remove();
      currentApple = null;
      createApple();
    }
  }

  bombs.forEach((bomb) => {
    const bombRect = bomb.getBoundingClientRect();
    if (
      capybaraRect.left < bombRect.right &&
      capybaraRect.right > bombRect.left &&
      capybaraRect.top < bombRect.bottom &&
      capybaraRect.bottom > bombRect.top
    ) {
      endGame();
    }
  });
}

// Увеличение количества бомб
function increaseBombCount() {
  createBomb();
}

// Конец игры
function endGame() {
  themeMusic.pause();
  gameOverSound.play();
  alert(`Game Over! Your score: ${score}`);
  window.location.reload();
}

// Начало игры
scoreDisplay.textContent = `Score: ${score}`;
timerDisplay.textContent = `Time: ${time}s`;
createApple();
bombCreationTimer = setInterval(increaseBombCount, bombInterval);
