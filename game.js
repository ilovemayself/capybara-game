const capybara = document.getElementById('capybara');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const restartButton = document.getElementById('restart-btn');

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

themeMusic.volume = 0.5;

function startMusic() {
  themeMusic.play().catch(err => console.error('Audio playback blocked:', err));
}

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

capybara.style.top = '200px';
capybara.style.left = '200px';

// Управление на клавиатуре с плавной анимацией
document.addEventListener('keydown', (e) => {
  startMusic();
  const rect = capybara.getBoundingClientRect();
  const step = 30;
  let newTop = parseFloat(capybara.style.top || rect.top);
  let newLeft = parseFloat(capybara.style.left || rect.left);

  if (e.key === 'ArrowUp' && rect.top > 0) {
    newTop -= step;
  } else if (e.key === 'ArrowDown' && rect.bottom < window.innerHeight) {
    newTop += step;
  } else if (e.key === 'ArrowLeft' && rect.left > 0) {
    newLeft -= step;
  } else if (e.key === 'ArrowRight' && rect.right < window.innerWidth) {
    newLeft += step;
  }

  capybara.style.top = `${Math.max(0, Math.min(newTop, window.innerHeight - rect.height))}px`;
  capybara.style.left = `${Math.max(0, Math.min(newLeft, window.innerWidth - rect.width))}px`;

  checkCollision();
});


// Запрос разрешений на использование датчиков движения на мобильных устройствах
function requestMotionPermission() {
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    document.addEventListener('click', async () => {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleMotion);
        }
      } catch (e) {
        console.error('Permission request failed:', e);
      }
    });
  } else {
    window.addEventListener('deviceorientation', handleMotion);
  }
}

function handleMotion(event) {
  const capybaraRect = capybara.getBoundingClientRect();
  const speed = 4;

  let xMovement = event.gamma;
  let yMovement = event.beta;

  if (xMovement > 15) capybara.style.left = `${Math.min(window.innerWidth - capybaraRect.width, capybaraRect.left + speed)}px`;
  if (xMovement < -15) capybara.style.left = `${Math.max(0, capybaraRect.left - speed)}px`;
  if (yMovement > 15) capybara.style.top = `${Math.min(window.innerHeight - capybaraRect.height, capybaraRect.top + speed)}px`;
  if (yMovement < -15) capybara.style.top = `${Math.max(0, capybaraRect.top - speed)}px`;

  checkCollision();
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


let appleCollected = false; // Флаг для отслеживания сбора яблока

// Функция для загрузки изображения и получения его естественного размера
function getImageSize(imageSrc) {
  const img = new Image();
  img.src = imageSrc;

  return new Promise((resolve) => {
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
  });
}

// Пример использования для капибары и яблок
async function setImageSizes() {
  const capybaraSize = await getImageSize('images/capybara.png');
  const appleSize = await getImageSize('images/apple.png');
  const goldenAppleSize = await getImageSize('images/golden-apple.png');
  const bombSize = await getImageSize('images/bomb.png');

  // Ограничим максимальные размеры
  const maxCapybaraSize = 130; // максимальная ширина и высота капибары
  const scaleCapybara = Math.min(maxCapybaraSize / capybaraSize.width, maxCapybaraSize / capybaraSize.height);
  
  const maxItemSize = 50; // максимальный размер для яблок и бомб
  const scaleItem = Math.min(maxItemSize / appleSize.width, maxItemSize / appleSize.height);
  
  // Устанавливаем размеры для капибары
  capybara.style.width = `${capybaraSize.width * scaleCapybara}px`;
  capybara.style.height = `${capybaraSize.height * scaleCapybara}px`;

  // Устанавливаем размеры для яблок и золотых яблок
  if (currentApple) {
    if (currentApple.id === 'item') {
      currentApple.style.width = `${appleSize.width * scaleItem}px`;
      currentApple.style.height = `${appleSize.height * scaleItem}px`;
    } else if (currentApple.id === 'golden-item') {
      currentApple.style.width = `${goldenAppleSize.width * scaleItem}px`;
      currentApple.style.height = `${goldenAppleSize.height * scaleItem}px`;
    }
  }

  // Устанавливаем размер бомб
  bombs.forEach((bomb) => {
    bomb.style.width = `${bombSize.width * scaleItem}px`;
    bomb.style.height = `${bombSize.height * scaleItem}px`;
  });
}

// Вызовите эту функцию при загрузке страницы или при инициализации игры
setImageSizes();

// Модифицированная функция для проверки столкновений
function checkCollision() {
  const capybaraRect = capybara.getBoundingClientRect();

  if (currentApple && !appleCollected) {
    const appleRect = currentApple.getBoundingClientRect();
    const collisionThreshold = 8; // Порог для столкновения

    if (
      capybaraRect.left + collisionThreshold < appleRect.right &&
      capybaraRect.right - collisionThreshold > appleRect.left &&
      capybaraRect.top + collisionThreshold < appleRect.bottom &&
      capybaraRect.bottom - collisionThreshold > appleRect.top
    ) {
      appleCollected = true; 
      score += currentApple.id === 'golden-item' ? 5 : 1;
      scoreDisplay.textContent = `Score: ${score}`;

      // Вспышка яблока перед удалением
      currentApple.classList.add('item-flash');
      (currentApple.id === 'golden-item' ? goldenSound : catchSound).play();

      setTimeout(() => {
        currentApple.remove();
        currentApple = null;
        createApple();
        appleCollected = false;
      }, 300);
    }
  }

  bombs.forEach((bomb) => {
    const bombRect = bomb.getBoundingClientRect();
    const collisionThreshold = 30; // Порог для столкновения

    if (
      capybaraRect.left + collisionThreshold < bombRect.right &&
      capybaraRect.right - collisionThreshold > bombRect.left &&
      capybaraRect.top + collisionThreshold < bombRect.bottom &&
      capybaraRect.bottom - collisionThreshold > bombRect.top
    ) {
      // Здесь мы добавляем эффект "потрясения" капибары
      capybara.classList.add('shake');

      // Немедленно заканчиваем игру
      endGame();
    }
  });
}





// Завершение игры
function endGame() {
  themeMusic.pause();
  gameOverSound.play();

  restartButton.textContent = `Game Over! Score: ${score}`;
  restartButton.hidden = false;
  restartButton.classList.add('show');
  restartButton.onclick = () => location.reload();
}

// Инициализация
scoreDisplay.textContent = `Score: ${score}`;
timerDisplay.textContent = `Time: ${time}s`;

createApple();
bombCreationTimer = setInterval(createBomb, bombInterval);

// Запрос на разрешение при старте игры
requestMotionPermission();
