// oyun kolu kanalı: yılan. ok tuşları / WASD, dokunmatikte kaydırma
const N = 24;
const CELL = 26;
const KEYS = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};

export function mount(host) {
  host.innerHTML = `
    <div class="game">
      <canvas width="${N * CELL}" height="${N * CELL}"></canvas>
      <aside>
        <div class="kicker">Oyun kolundan</div>
        <h1>Yılan</h1>
        <div class="score">Skor <b data-score>0</b></div>
        <div class="score">Rekor <b data-best>0</b></div>
        <p class="help">Ok tuşları / WASD ile yönlendir.<br />Boşluk: yeniden başla.</p>
        <div class="game-msg" data-msg>Başlamak için bir yön tuşuna bas</div>
      </aside>
    </div>`;
  const canvas = host.querySelector('canvas');
  const g = canvas.getContext('2d');
  const scoreEl = host.querySelector('[data-score]');
  const bestEl = host.querySelector('[data-best]');
  const msg = host.querySelector('[data-msg]');
  let best = 0;
  try {
    best = Number(localStorage.getItem('benginsroom.snake')) || 0;
  } catch {}
  bestEl.textContent = best;

  let snake, dir, nextDir, food, running, dead;
  const reset = () => {
    snake = [[12, 12], [11, 12], [10, 12]];
    dir = [1, 0];
    nextDir = dir;
    running = false;
    dead = false;
    placeFood();
    scoreEl.textContent = 0;
    draw();
  };
  const placeFood = () => {
    do food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
    while (snake.some(([x, y]) => x === food[0] && y === food[1]));
  };
  const steer = (d) => {
    if (dead) return;
    if (d[0] === -dir[0] && d[1] === -dir[1]) return;
    nextDir = d;
    if (!running) {
      running = true;
      msg.textContent = '';
    }
  };

  const step = () => {
    if (!running) return;
    dir = nextDir;
    const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
    if (head[0] < 0 || head[1] < 0 || head[0] >= N || head[1] >= N || snake.some(([x, y]) => x === head[0] && y === head[1])) {
      running = false;
      dead = true;
      msg.textContent = 'Oyun bitti — Boşluk ile tekrar';
      return;
    }
    snake.unshift(head);
    if (head[0] === food[0] && head[1] === food[1]) {
      const score = snake.length - 3;
      scoreEl.textContent = score;
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        try {
          localStorage.setItem('benginsroom.snake', best);
        } catch {}
      }
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  };

  const draw = () => {
    g.fillStyle = '#071209';
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = 'rgba(124,255,138,0.05)';
    for (let i = 0; i <= N; i++) {
      g.beginPath();
      g.moveTo(i * CELL, 0);
      g.lineTo(i * CELL, N * CELL);
      g.moveTo(0, i * CELL);
      g.lineTo(N * CELL, i * CELL);
      g.stroke();
    }
    g.fillStyle = '#ff6b6b';
    g.fillRect(food[0] * CELL + 5, food[1] * CELL + 5, CELL - 10, CELL - 10);
    snake.forEach(([x, y], i) => {
      g.fillStyle = i === 0 ? '#c8ffcf' : '#7CFF8A';
      g.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
    });
  };

  const onKey = (e) => {
    if (KEYS[e.code]) {
      e.preventDefault();
      steer(KEYS[e.code]);
    } else if (e.code === 'Space') {
      e.preventDefault();
      reset();
      msg.textContent = 'Başlamak için bir yön tuşuna bas';
    }
  };
  let touch = null;
  const onTouchStart = (e) => (touch = [e.touches[0].clientX, e.touches[0].clientY]);
  const onTouchEnd = (e) => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch[0];
    const dy = e.changedTouches[0].clientY - touch[1];
    touch = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) {
      if (dead) reset();
      return;
    }
    steer(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
  };

  window.addEventListener('keydown', onKey);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);
  reset();
  const id = setInterval(step, 110);

  return () => {
    clearInterval(id);
    window.removeEventListener('keydown', onKey);
  };
}
