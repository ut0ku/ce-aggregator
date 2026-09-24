const WAVE_DURATION = 2400;
const WAVE_STEPS = 180;
const SQRT_HALF = Math.SQRT1_2;

function beachProgress(t) {
  const x = Math.min(1, Math.max(0, t));
  const wash = 1 - Math.pow(1 - x, 1.55);
  const surge = Math.sin(x * Math.PI) * Math.sin(x * Math.PI * 1.8) * 0.05;
  return Math.min(1, Math.max(0, wash + surge));
}

function lobe(nx, freq, phase, sharpness, amp) {
  const wave = Math.sin(nx * Math.PI * freq + phase);
  if (wave <= 0) return 0;
  return Math.pow(wave, sharpness) * amp;
}

function edgeJag(nx, time) {
  return (
    Math.sin(nx * 37.4 + time * 5.2) * 5.5 +
    Math.sin(nx * 61.8 + time * 7.4) * 3.2 +
    Math.sin(nx * 97.1 + time * 11.1) * 1.8 +
    Math.sin(nx * 149.6 + time * 14.8) * 1.1
  );
}

function frontOffset(nx, time, amplitude) {
  const tongues =
    lobe(nx, 3.15, time * 0.72 + 0.2, 2.6, amplitude) +
    lobe(nx, 4.55, time * 0.98 + 1.7, 3.4, amplitude * 0.82) +
    lobe(nx, 6.05, time * 1.18 + 0.4, 4.2, amplitude * 0.58) +
    lobe(nx, 7.7, time * 1.42 + 2.3, 5.1, amplitude * 0.36) +
    lobe(nx, 2.25, time * 0.48 + 2.9, 2.1, amplitude * 0.7);

  const dips = -lobe(nx, 5.35, time * 0.82 + 3.4, 2.8, amplitude * 0.38);
  const roll = Math.sin(nx * Math.PI * 1.05 + time * 0.38) * amplitude * 0.22;

  return roll + tongues + dips + edgeJag(nx, time);
}

function buildWavePolygon(width, height, travel, time, amplitude, inbound) {
  const originX = inbound ? width : 0;
  const originY = inbound ? 0 : height;
  const dirX = inbound ? -SQRT_HALF : SQRT_HALF;
  const dirY = inbound ? SQRT_HALF : -SQRT_HALF;
  const perpX = -dirY;
  const perpY = dirX;
  const span = Math.hypot(width, height) + amplitude + 220;
  const far = (width + height) * 2;
  const points = [];

  for (let i = 0; i <= WAVE_STEPS; i += 1) {
    const nx = i / WAVE_STEPS;
    const along = -span + nx * span * 2;
    const offset = frontOffset(nx, time, amplitude);
    const x = originX + dirX * (travel + offset) + perpX * along;
    const y = originY + dirY * (travel + offset) + perpY * along;
    points.push(`${x.toFixed(2)}px ${y.toFixed(2)}px`);
  }

  const firstOffset = frontOffset(0, time, amplitude);
  const lastOffset = frontOffset(1, time, amplitude);
  const firstX = originX + dirX * (travel + firstOffset) + perpX * -span;
  const firstY = originY + dirY * (travel + firstOffset) + perpY * -span;
  const lastX = originX + dirX * (travel + lastOffset) + perpX * span;
  const lastY = originY + dirY * (travel + lastOffset) + perpY * span;

  points.push(`${(lastX + dirX * far).toFixed(2)}px ${(lastY + dirY * far).toFixed(2)}px`);
  points.push(`${(firstX + dirX * far).toFixed(2)}px ${(firstY + dirY * far).toFixed(2)}px`);

  return `polygon(${points.join(',')})`;
}

function viewportSize() {
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };
}

export function captureThemeSnapshot() {
  const root = document.getElementById('root');
  if (!root) return null;

  const { width, height } = viewportSize();
  const snapshot = document.createElement('div');
  snapshot.className = 'theme-wave-snapshot';
  snapshot.setAttribute('aria-hidden', 'true');
  snapshot.style.top = '0';
  snapshot.style.left = '0';
  snapshot.style.width = `${width}px`;
  snapshot.style.height = `${height}px`;
  snapshot.style.right = 'auto';
  snapshot.style.bottom = 'auto';

  const clone = root.cloneNode(true);
  clone.removeAttribute('id');
  clone.style.position = 'absolute';
  clone.style.top = `${-window.scrollY}px`;
  clone.style.left = `${-window.scrollX}px`;
  clone.style.width = `${width}px`;
  clone.style.height = 'auto';
  clone.style.margin = '0';
  clone.style.overflow = 'visible';

  snapshot.appendChild(clone);
  document.body.appendChild(snapshot);

  snapshot.style.clipPath = `polygon(0 0, ${width}px 0, ${width}px ${height}px, 0 ${height}px)`;
  snapshot.style.webkitClipPath = snapshot.style.clipPath;

  return snapshot;
}

export function lockPageScroll() {
  const x = window.scrollX;
  const y = window.scrollY;
  const prevent = (event) => event.preventDefault();
  const keepPosition = () => window.scrollTo(x, y);

  window.addEventListener('wheel', prevent, { passive: false });
  window.addEventListener('touchmove', prevent, { passive: false });
  window.addEventListener('scroll', keepPosition, { passive: true });

  return () => {
    window.removeEventListener('wheel', prevent);
    window.removeEventListener('touchmove', prevent);
    window.removeEventListener('scroll', keepPosition);
  };
}

export function applyPageBackground(dark) {
  const color = dark ? '#171717' : '#f7f0e3';
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
}

export function runThemeWave(snapshot, onComplete, direction = 'to-dark') {
  if (!snapshot) {
    onComplete();
    return () => {};
  }

  const inbound = direction === 'to-dark';
  const start = performance.now();
  const width = snapshot.clientWidth || viewportSize().width;
  const height = snapshot.clientHeight || viewportSize().height;
  const amplitude = Math.max(78, Math.min(168, Math.min(width, height) * 0.2));
  const cover = (width + height) * SQRT_HALF + amplitude * 2 + 180;
  const startTravel = -amplitude - 56;
  let frameId = 0;
  let finished = false;
  let timeoutId = 0;

  const finish = () => {
    if (finished) return;
    finished = true;
    window.cancelAnimationFrame(frameId);
    window.clearTimeout(timeoutId);
    onComplete();
  };

  timeoutId = window.setTimeout(finish, WAVE_DURATION + 160);

  const tick = (now) => {
    const t = (now - start) / WAVE_DURATION;
    const progress = beachProgress(t);
    const travel = startTravel + progress * (cover - startTravel);
    const time = (now - start) / 1000;
    const polygon = buildWavePolygon(width, height, travel, time, amplitude, inbound);

    snapshot.style.clipPath = polygon;
    snapshot.style.webkitClipPath = polygon;

    if (t >= 1) {
      finish();
      return;
    }

    frameId = window.requestAnimationFrame(tick);
  };

  frameId = window.requestAnimationFrame(tick);
  return finish;
}
