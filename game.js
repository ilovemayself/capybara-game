const capybara = document.getElementById('capybara');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const restartButton = document.getElementById('restart-btn');

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

function enableMusicOnInteraction() {
  const startAudioHandler = () => {
    themeMusic.play().catch(err => console.error('Audio playback blocked:', err));
    document.removeEventListener('touchstart', startAudioHandler);
    document.removeEventListener('click', startAudioHandler);
  };

  document.addEventListener('touchstart', startAudioHandler);
  document.addEventListener('click', startAudioHandler);
}

function startMusic() {
  themeMusic.volume = 0.5;
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

document.addEventListener('keydown', (e) => {
  startMusic();
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

function initializeMobileControl() {
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    const permissionButton = document.createElement('button');
    permissionButton.textContent = 'Enable Motion Control';
    permissionButton.id = 'permission-btn';
    document.body.appendChild(permissionButton);

    permissionButton.addEventListener('click', async () => {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleMotion);
          permissionButton.remove();
        } else {
          alert('Motion control permission denied.');
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
  const speed = 2;

  let xMovement = event.gamma;
  let yMovement = event.beta;

  if (xMovement > 15) capybara.style.left = `${Math.min(window.innerWidth - capybaraRect.width, capybaraRect.left + speed)}px`;
  if (xMovement < -15) capybara.style.left = `${Math.max(0, capybaraRect.left - speed)}px`;
  if (yMovement > 15) capybara.style.top = `${Math.min(window.innerHeight - capybaraRect.height, capybaraRect.top + speed)}px`;
  if (yMovement < -15) capybara.style.top = `${Math.max(0, capybaraRect.top - speed)}px`;

  checkCollision();
}

function createApple() {
  if (currentApple) return;

  const apple = document.createElement('div');
  const x = Math.random() * (window.innerWidth - 50);
  const y = Math.random() * (window.innerHeight - 50);

  const isGolden = Math.random() < 0.2;

  apple.id = isGolden ? 'golden-item' : 'item';
  apple.style.left = `${x}px`;
  apple.style.top = `${y}px`;
  document.body.appendChild(apple);
  currentApple = apple;
}

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

function increaseBombCount() {
  createBomb();
}

function endGame() {
  themeMusic.pause();
  gameOverSound.play();

  restartButton.hidden = false;
  restartButton.textContent = `Game Over! Score: ${score} - Restart`;
  restartButton.onclick = () => location.reload();
}

enableMusicOnInteraction();
initializeMobileControl();
scoreDisplay.textContent = `Score: ${score}`;
timerDisplay.textContent = `Time: ${time}s`;
createApple();
bombCreationTimer = setInterval(increaseBombCount, bombInterval);
