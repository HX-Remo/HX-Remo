const canvas = document.querySelector('#playground');
const ctx = canvas.getContext('2d');
const hint = document.querySelector('#hint');
const orbCount = document.querySelector('#orbCount');
const energyLevel = document.querySelector('#energyLevel');
const burstButton = document.querySelector('#burstButton');
const calmButton = document.querySelector('#calmButton');
const clearButton = document.querySelector('#clearButton');

const colors = ['#7cf7d4', '#ff8edb', '#ffd166', '#8ec5ff', '#c4a7ff'];
const orbs = [];
let width = 0;
let height = 0;
let lastTime = performance.now();
let pointerIsDown = false;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function addOrb(x, y, force = 1) {
  if (orbs.length >= 70) {
    orbs.shift();
  }

  const speed = randomBetween(130, 360) * force;
  const angle = randomBetween(0, Math.PI * 2);
  orbs.push({
    x,
    y,
    radius: randomBetween(13, 30),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    color: colors[Math.floor(Math.random() * colors.length)],
    wobble: randomBetween(0, Math.PI * 2),
  });

  hint.classList.add('is-hidden');
  updateStats();
}

function addBurst() {
  const centerX = width / 2;
  const centerY = height / 2;
  for (let index = 0; index < 16; index += 1) {
    addOrb(centerX + randomBetween(-40, 40), centerY + randomBetween(-40, 40), 1.4);
  }
}

function calmOrbs() {
  for (const orb of orbs) {
    orb.vx *= 0.35;
    orb.vy *= 0.35;
  }
  updateStats();
}

function clearOrbs() {
  orbs.length = 0;
  hint.classList.remove('is-hidden');
  updateStats();
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function handlePointer(event) {
  const point = canvasPoint(event);
  addOrb(point.x, point.y, pointerIsDown ? 0.8 : 1);
}

function updateStats() {
  const totalSpeed = orbs.reduce((sum, orb) => sum + Math.hypot(orb.vx, orb.vy), 0);
  const energy = Math.min(100, Math.round(totalSpeed / 180));
  orbCount.textContent = String(orbs.length);
  energyLevel.textContent = String(energy);
}

function drawOrb(orb) {
  const glow = ctx.createRadialGradient(orb.x, orb.y, 1, orb.x, orb.y, orb.radius * 2.4);
  glow.addColorStop(0, orb.color);
  glow.addColorStop(0.5, `${orb.color}88`);
  glow.addColorStop(1, `${orb.color}00`);

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.radius * 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = orb.color;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
  ctx.beginPath();
  ctx.arc(orb.x - orb.radius * 0.28, orb.y - orb.radius * 0.35, orb.radius * 0.24, 0, Math.PI * 2);
  ctx.fill();
}

function tick(now) {
  const delta = Math.min((now - lastTime) / 1000, 0.032);
  lastTime = now;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.fillRect(0, 0, width, height);

  for (const orb of orbs) {
    orb.wobble += delta * 3;
    orb.vy += 240 * delta;
    orb.x += (orb.vx + Math.cos(orb.wobble) * 18) * delta;
    orb.y += (orb.vy + Math.sin(orb.wobble) * 18) * delta;

    if (orb.x < orb.radius || orb.x > width - orb.radius) {
      orb.x = Math.max(orb.radius, Math.min(width - orb.radius, orb.x));
      orb.vx *= -0.86;
    }

    if (orb.y < orb.radius || orb.y > height - orb.radius) {
      orb.y = Math.max(orb.radius, Math.min(height - orb.radius, orb.y));
      orb.vy *= -0.84;
      orb.vx *= 0.985;
    }

    orb.vx *= 0.998;
    orb.vy *= 0.998;
    drawOrb(orb);
  }

  updateStats();
  requestAnimationFrame(tick);
}

canvas.addEventListener('pointerdown', (event) => {
  pointerIsDown = true;
  canvas.setPointerCapture(event.pointerId);
  handlePointer(event);
});

canvas.addEventListener('pointermove', (event) => {
  if (pointerIsDown) {
    handlePointer(event);
  }
});

canvas.addEventListener('pointerup', () => {
  pointerIsDown = false;
});

canvas.addEventListener('pointercancel', () => {
  pointerIsDown = false;
});

burstButton.addEventListener('click', addBurst);
calmButton.addEventListener('click', calmOrbs);
clearButton.addEventListener('click', clearOrbs);
window.addEventListener('resize', resizeCanvas);

resizeCanvas();
addBurst();
requestAnimationFrame(tick);
