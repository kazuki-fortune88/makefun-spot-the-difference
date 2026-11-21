// Game state, input and rendering for Harbor Lights.
//
// One canvas holds the whole game: a header (title, level, Found counter,
// timer bar, score, hints), two scene panels side by side, and a footer
// with the level's subtitle. Overlays cover the title screen, the level
// complete screen, the win screen and the time-up screen. Found
// differences are circled on both panels with a green ring and a check;
// a wrong click leaves a brief red X; a hint rings one unfound
// difference in gold for two seconds.
//
// Clicks are tested against the level's differences in panel-relative
// coordinates, so the same code serves both panels: a difference found
// on either side counts once.

import { LEVELS, PANEL_H, PANEL_W } from './levels.js';
import { drawScene } from './scenes.js';
import { Sounds } from './audio.js';

export const CANVAS_W = 1280;
export const CANVAS_H = 760;
export const PANEL_LEFT_X = 40;
export const PANEL_RIGHT_X = 680;
export const PANEL_Y = 118;

const FIND_POINTS = 100;
const WRONG_PENALTY = 20;
const HINT_COST = 30;
const HINTS_PER_LEVEL = 3;
const TIME_BONUS_PER_SECOND = 5;

const COLORS = {
  page: '#23202e',
  panelFrame: '#f3ede0',
  ink: '#f3ede0',
  muted: '#b9b3c4',
  accent: '#ffd94d',
  good: '#7ddb6a',
  bad: '#e86a6a',
  hint: '#ffd94d',
  bar: '#3a3348',
};

export class SpotGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.levelIndex = 0;
    this.state = 'title'; // title | playing | levelDone | gameWon | timeUp
    this.found = new Set();
    this.score = 0;
    this.timeLeft = LEVELS[0].timeLimit;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.hintMark = null; // { u, v, until }
    this.wrongMark = null; // { x, y, until }
    this.lastTickSecond = -1;
    this.levelBonus = 0;
    this.frozen = false; // screenshot modes freeze the timer
    this.lastTime = 0;
    this.shakeUntil = 0;

    canvas.addEventListener('pointerdown', (event) => this.onPointerDown(event));
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  get foundCount() {
    return this.found.size;
  }

  get totalDifferences() {
    return this.level.differences.length;
  }

  startGame() {
    this.levelIndex = 0;
    this.score = 0;
    this.beginLevel();
    this.state = 'playing';
  }

  beginLevel() {
    this.found = new Set();
    this.timeLeft = this.level.timeLimit;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.hintMark = null;
    this.wrongMark = null;
    this.levelBonus = 0;
    this.lastTickSecond = -1;
  }

  nextLevel() {
    this.levelIndex += 1;
    this.beginLevel();
    this.state = 'playing';
  }

  restartLevel() {
    this.score = Math.max(0, this.score - this.levelBonus);
    this.beginLevel();
    this.state = 'playing';
  }

  useHint() {
    if (this.state !== 'playing' || this.hintsLeft <= 0) return false;
    const remaining = this.level.differences.filter((d) => !this.found.has(d.id));
    if (remaining.length === 0) return false;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - HINT_COST);
    this.hintMark = { u: pick.u, v: pick.v, until: performance.now() + 2000 };
    Sounds.hint();
    return true;
  }

  panelAt(canvasX, canvasY) {
    if (canvasY < PANEL_Y || canvasY > PANEL_Y + PANEL_H) return null;
    if (canvasX >= PANEL_LEFT_X && canvasX <= PANEL_LEFT_X + PANEL_W) {
      return { originX: PANEL_LEFT_X, u: (canvasX - PANEL_LEFT_X) / PANEL_W, v: (canvasY - PANEL_Y) / PANEL_H };
    }
    if (canvasX >= PANEL_RIGHT_X && canvasX <= PANEL_RIGHT_X + PANEL_W) {
      return { originX: PANEL_RIGHT_X, u: (canvasX - PANEL_RIGHT_X) / PANEL_W, v: (canvasY - PANEL_Y) / PANEL_H };
    }
    return null;
  }

  onPointerDown(event) {
    Sounds.unlock();
    const rect = this.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((event.clientY - rect.top) / rect.height) * CANVAS_H;

    if (this.state === 'title') {
      this.startGame();
      return;
    }
    if (this.state === 'levelDone') {
      this.nextLevel();
      return;
    }
    if (this.state === 'gameWon' || this.state === 'timeUp') {
      this.startGame();
      return;
    }
    if (this.state !== 'playing') return;

    const hit = this.panelAt(x, y);
    if (!hit) return;
    const found = this.level.differences.find(
      (d) => !this.found.has(d.id) && Math.hypot(d.u - hit.u, d.v - hit.v) <= d.r,
    );
    if (found) {
      this.found.add(found.id);
      this.score += FIND_POINTS;
      Sounds.found();
      if (this.found.size === this.totalDifferences) this.completeLevel();
    } else {
      this.score = Math.max(0, this.score - WRONG_PENALTY);
      this.wrongMark = { x, y, until: performance.now() + 700 };
      this.shakeUntil = performance.now() + 180;
      Sounds.wrong();
    }
  }

  onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (key === 'h') this.useHint();
    else if (key === 'r') this.restartLevel();
    else if (key === 'enter' || key === ' ') {
      if (this.state === 'title') this.startGame();
      else if (this.state === 'levelDone') this.nextLevel();
      else if (this.state === 'gameWon' || this.state === 'timeUp') this.startGame();
    }
  }

  completeLevel() {
    this.levelBonus = Math.round(this.timeLeft) * TIME_BONUS_PER_SECOND;
    this.score += this.levelBonus;
    if (this.levelIndex === LEVELS.length - 1) {
      this.state = 'gameWon';
      Sounds.win();
    } else {
      this.state = 'levelDone';
      Sounds.win();
    }
  }

  update(now) {
    const delta = this.lastTime ? (now - this.lastTime) / 1000 : 0;
    this.lastTime = now;
    if (this.state !== 'playing' || this.frozen) return;
    this.timeLeft -= delta;
    const whole = Math.ceil(this.timeLeft);
    if (whole <= 10 && whole !== this.lastTickSecond && whole > 0) {
      this.lastTickSecond = whole;
      Sounds.tick();
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.state = 'timeUp';
      Sounds.lose();
    }
  }

  // -- drawing ------------------------------------------------------------

  formatTime(seconds) {
    const total = Math.max(0, Math.ceil(seconds));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }

  draw(now) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = COLORS.page;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.save();
    if (now < this.shakeUntil) ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
    this.drawHeader();
    this.drawPanels(now);
    this.drawFooter();
    ctx.restore();
    if (this.state === 'title') this.drawTitleOverlay();
    else if (this.state === 'levelDone') this.drawLevelDoneOverlay();
    else if (this.state === 'gameWon') this.drawGameWonOverlay();
    else if (this.state === 'timeUp') this.drawTimeUpOverlay();
  }

  drawHeader() {
    const ctx = this.ctx;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.ink;
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillText('🔍 Harbor Lights', 40, 38);
    ctx.font = '16px Georgia, serif';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(`Level ${this.levelIndex + 1} of ${LEVELS.length} — ${this.level.name}`, 40, 72);

    ctx.textAlign = 'right';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillStyle = COLORS.accent;
    ctx.fillText(`Found ${this.foundCount} / ${this.totalDifferences}`, 1240, 34);
    ctx.font = '20px Georgia, serif';
    ctx.fillStyle = this.timeLeft <= 30 ? COLORS.bad : COLORS.ink;
    ctx.fillText(`⏱ ${this.formatTime(this.timeLeft)}`, 1240, 66);
    ctx.fillStyle = COLORS.ink;
    ctx.fillText(`Score ${this.score}`, 1010, 66);
    ctx.fillStyle = COLORS.muted;
    ctx.font = '16px Georgia, serif';
    ctx.fillText(`Hints ${this.hintsLeft}  (H)`, 1010, 34);

    // Timer bar under the header.
    const frac = Math.max(0, this.timeLeft / this.level.timeLimit);
    ctx.fillStyle = COLORS.bar;
    ctx.fillRect(40, 96, 1200, 8);
    ctx.fillStyle = frac <= 0.2 ? COLORS.bad : COLORS.accent;
    ctx.fillRect(40, 96, 1200 * frac, 8);
  }

  drawPanels(now) {
    const ctx = this.ctx;
    const allDiffs = new Set(this.level.differences.map((d) => d.id));
    drawScene(ctx, this.level.scene, PANEL_LEFT_X, PANEL_Y, new Set());
    drawScene(ctx, this.level.scene, PANEL_RIGHT_X, PANEL_Y, allDiffs);
    for (const [x, label] of [
      [PANEL_LEFT_X, 'LEFT — the original'],
      [PANEL_RIGHT_X, 'RIGHT — spot what changed'],
    ]) {
      ctx.strokeStyle = COLORS.panelFrame;
      ctx.lineWidth = 4;
      ctx.strokeRect(x - 2, PANEL_Y - 2, PANEL_W + 4, PANEL_H + 4);
      ctx.fillStyle = 'rgba(35,32,46,0.85)';
      ctx.fillRect(x, PANEL_Y - 2, 250, 26);
      ctx.fillStyle = COLORS.ink;
      ctx.font = 'bold 14px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + 10, PANEL_Y + 11);
    }
    this.drawMarkers(now);
  }

  drawMarkers(now) {
    const ctx = this.ctx;
    for (const diff of this.level.differences) {
      if (!this.found.has(diff.id)) continue;
      for (const originX of [PANEL_LEFT_X, PANEL_RIGHT_X]) {
        const cx = originX + diff.u * PANEL_W;
        const cy = PANEL_Y + diff.v * PANEL_H;
        const r = Math.max(18, diff.r * PANEL_W * 0.9);
        ctx.strokeStyle = COLORS.good;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = COLORS.good;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.45, cy);
        ctx.lineTo(cx - r * 0.1, cy + r * 0.4);
        ctx.lineTo(cx + r * 0.5, cy - r * 0.4);
        ctx.stroke();
      }
    }
    if (this.hintMark && now < this.hintMark.until) {
      const pulse = 1 + 0.12 * Math.sin(now / 120);
      for (const originX of [PANEL_LEFT_X, PANEL_RIGHT_X]) {
        const cx = originX + this.hintMark.u * PANEL_W;
        const cy = PANEL_Y + this.hintMark.v * PANEL_H;
        ctx.strokeStyle = COLORS.hint;
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, 30 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    if (this.wrongMark && now < this.wrongMark.until) {
      const { x, y } = this.wrongMark;
      ctx.strokeStyle = COLORS.bad;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x - 12, y - 12);
      ctx.lineTo(x + 12, y + 12);
      ctx.moveTo(x + 12, y - 12);
      ctx.lineTo(x - 12, y + 12);
      ctx.stroke();
    }
  }

  drawFooter() {
    const ctx = this.ctx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.muted;
    ctx.font = '17px Georgia, serif';
    ctx.fillText(this.level.subtitle, CANVAS_W / 2, 612);
    ctx.font = '15px Georgia, serif';
    ctx.fillText(
      'Click a difference on either picture to circle it  •  H = hint (−30)  •  R = restart level  •  Wrong clicks −20',
      CANVAS_W / 2,
      644,
    );
    ctx.fillStyle = '#6f6a7d';
    ctx.font = '13px Georgia, serif';
    ctx.fillText('Harbor Lights — an original spot-the-difference game. Three scenes, seven differences each.', CANVAS_W / 2, 700);
  }

  overlayBox(title, lines, accent) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(20,17,28,0.78)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#2e2a3d';
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    const boxW = 640;
    const boxH = 300;
    const boxX = (CANVAS_W - boxW) / 2;
    const boxY = (CANVAS_H - boxH) / 2;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 18);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = accent;
    ctx.font = 'bold 38px Georgia, serif';
    ctx.fillText(title, CANVAS_W / 2, boxY + 62);
    ctx.fillStyle = COLORS.ink;
    ctx.font = '20px Georgia, serif';
    lines.forEach((line, i) => ctx.fillText(line, CANVAS_W / 2, boxY + 128 + i * 34));
  }

  drawTitleOverlay() {
    this.overlayBox('🔍 Harbor Lights', [
      'Spot the difference — three cozy scenes,',
      'seven hidden changes in each one.',
      '',
      'Click anywhere (or press Enter) to begin.',
    ], COLORS.accent);
  }

  drawLevelDoneOverlay() {
    this.overlayBox('Level complete!', [
      `You found all ${this.totalDifferences} differences in ${this.level.name}.`,
      `Time bonus +${this.levelBonus}  •  Score ${this.score}`,
      '',
      'Click anywhere (or press Enter) for the next scene.',
    ], COLORS.good);
  }

  drawGameWonOverlay() {
    this.overlayBox('🏆 You found them all!', [
      'Every difference in all three scenes — sharp eyes!',
      `Final score ${this.score}`,
      '',
      'Click anywhere (or press Enter) to play again.',
    ], COLORS.accent);
  }

  drawTimeUpOverlay() {
    this.overlayBox("Time's up!", [
      `You found ${this.foundCount} of ${this.totalDifferences} in ${this.level.name}.`,
      'The other differences are still hiding…',
      '',
      'Click anywhere (or press R) to try the level again.',
    ], COLORS.bad);
  }

  loop(now) {
    this.update(now);
    this.draw(now);
    requestAnimationFrame((t) => this.loop(t));
  }

  start() {
    requestAnimationFrame((t) => this.loop(t));
  }
}
