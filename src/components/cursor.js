/**
 * ==========================================
 * CURSOR.JS — CURSOR ANIMADO
 * ==========================================
 * Uma esfera com anéis coloridos girando 360° um sobre
 * o outro, deixando cauda de cometa ao mover. O clique
 * troca a paleta e dispara um estouro dos anéis.
 *
 * Tudo em um único <canvas> em tela cheia:
 *  - a cauda precisa de dezenas de segmentos com opacidade
 *    e espessura próprias, o que em DOM viraria dezenas de
 *    nós com filtro — inviável a 60fps;
 *  - o composite 'lighter' faz as cores somarem onde se
 *    cruzam, que é o que dá o aspecto de luz.
 *
 * Desativado em touch e em prefers-reduced-motion.
 * ==========================================
 */

import { env } from '../core/env.js';
import { gsap } from '../core/scroll.js';

const TAU = Math.PI * 2;

/** Paletas percorridas a cada clique. */
const PALETTES = [
  ['#00FF88', '#00BFFF', '#8A2BE2'], // marca
  ['#FF006E', '#FB5607', '#FFBE0B'], // fogo
  ['#3A86FF', '#8338EC', '#FF4D9D'], // neon
  ['#06FFA5', '#00E5FF', '#FFFFFF'], // gelo
];

/** Comprimento máximo da cauda, em pontos guardados. */
const TRAIL_LENGTH = 26;

/** Elementos que fazem o cursor crescer. */
const INTERACTIVE = 'a, button, input, textarea, select, [data-cursor="hover"]';

/* ==================== UTIL ==================== */

/** '#00FF88' → 'rgba(0, 255, 136, a)'. Evita recalcular hex no loop. */
function toRgba(hex, alpha) {
  const int = parseInt(hex.slice(1), 16);
  return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
}

export class AnimatedCursor {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'cursor-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Posição real do mouse vs. a que é desenhada (com atraso).
    this.target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.pos = { ...this.target };
    this.trail = Array.from({ length: TRAIL_LENGTH }, () => ({ ...this.pos }));

    this.paletteIndex = 0;
    this.palette = PALETTES[0];
    // Paleta anterior + progresso: o clique faz a cor transicionar, não pular.
    this.prevPalette = PALETTES[0];
    this.paletteMix = 1;

    this.radius = 7;
    this.radiusTarget = 7;
    this.orbitScale = 1;
    this.burst = 0;
    this.speed = 0;
    this.visible = 0;

    this.orbits = [
      { angle: 0, spin: 1.7, tilt: 0.0, tiltSpeed: 1.1, width: 1.6 },
      { angle: 0, spin: -2.3, tilt: TAU / 3, tiltSpeed: 1.5, width: 1.3 },
      { angle: 0, spin: 1.1, tilt: (TAU / 3) * 2, tiltSpeed: 0.8, width: 1.0 },
    ];

    this.resize();
    this._bindEvents();
    document.body.classList.add('has-custom-cursor');
  }

  /* ==================== EVENTOS ==================== */

  _bindEvents() {
    this._onMove = (event) => {
      this.target.x = event.clientX;
      this.target.y = event.clientY;
      if (!this.visible) gsap.to(this, { visible: 1, duration: 0.3 });
    };

    this._onDown = () => {
      this.cyclePalette();
      // Anéis colapsam e estouram para fora.
      gsap.fromTo(
        this,
        { burst: 1 },
        { burst: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' },
      );
      gsap.fromTo(this, { orbitScale: 0.55 }, { orbitScale: 1, duration: 0.7, ease: 'power3.out' });
    };

    this._onOver = (event) => {
      const isInteractive = !!event.target.closest?.(INTERACTIVE);
      this.radiusTarget = isInteractive ? 14 : 7;
    };

    this._onLeave = () => gsap.to(this, { visible: 0, duration: 0.25 });
    this._onEnter = () => gsap.to(this, { visible: 1, duration: 0.25 });
    this._onResize = () => this.resize();

    window.addEventListener('pointermove', this._onMove, { passive: true });
    window.addEventListener('pointerdown', this._onDown, { passive: true });
    window.addEventListener('pointerover', this._onOver, { passive: true });
    document.addEventListener('pointerleave', this._onLeave);
    document.addEventListener('pointerenter', this._onEnter);
    window.addEventListener('resize', this._onResize);
  }

  cyclePalette() {
    this.prevPalette = this.palette;
    this.paletteIndex = (this.paletteIndex + 1) % PALETTES.length;
    this.palette = PALETTES[this.paletteIndex];
    this.paletteMix = 0;
    gsap.to(this, { paletteMix: 1, duration: 0.6, ease: 'power2.out' });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    // Desenha em pixels CSS; o dpr some da matemática do loop.
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Cor do índice, interpolada entre a paleta antiga e a nova. */
  _color(index, alpha) {
    const next = this.palette[index % this.palette.length];
    if (this.paletteMix >= 1) return toRgba(next, alpha);

    const prev = this.prevPalette[index % this.prevPalette.length];
    const a = parseInt(prev.slice(1), 16);
    const b = parseInt(next.slice(1), 16);
    const t = this.paletteMix;
    const mix = (shift) => {
      const from = (a >> shift) & 255;
      const to = (b >> shift) & 255;
      return Math.round(from + (to - from) * t);
    };
    return `rgba(${mix(16)}, ${mix(8)}, ${mix(0)}, ${alpha})`;
  }

  /* ==================== DESENHO ==================== */

  /** Cauda: um traço por cor, deslocado, afinando até a ponta. */
  _drawTrail(ctx) {
    const points = this.trail;

    for (let c = 0; c < 3; c += 1) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      // Curva suave passando pelo ponto médio de cada par.
      for (let i = 1; i < points.length - 1; i += 1) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }

      // Cada cor tem espessura própria: as bordas ficam com franja colorida.
      ctx.lineWidth = (this.radius * 1.5 - c * 2.2) * this.speed;
      ctx.strokeStyle = this._color(c, 0.5 * this.speed);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  }

  /** Anéis: elipses que achatam conforme giram, simulando volta 360° em 3D. */
  _drawOrbits(ctx, elapsed) {
    const { x, y } = this.pos;
    const base = this.radius * (2.4 + this.burst * 2.2) * this.orbitScale;

    this.orbits.forEach((orbit, i) => {
      orbit.angle += orbit.spin * 0.016;
      const tilt = orbit.tilt + elapsed * orbit.tiltSpeed;

      // O raio menor oscilando entre 0 e o total é o que "vira" o anel.
      const rx = base;
      const ry = base * Math.abs(Math.cos(tilt));

      ctx.beginPath();
      ctx.ellipse(x, y, rx, Math.max(ry, 0.6), orbit.angle, 0, TAU);
      ctx.lineWidth = orbit.width;
      ctx.strokeStyle = this._color(i, 0.85);
      ctx.stroke();
    });
  }

  /** Núcleo: gradiente radial que some nas bordas. */
  _drawCore(ctx) {
    const { x, y } = this.pos;
    const r = this.radius * (1 + this.burst * 0.5);

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, this._color(0, 1));
    gradient.addColorStop(0.55, this._color(1, 0.7));
    gradient.addColorStop(1, this._color(2, 0));

    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  /* ==================== LOOP ==================== */

  update(delta, elapsed) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (this.visible <= 0.01) return;

    // Damping exponencial: independente do framerate.
    const damping = 1 - Math.exp(-14 * delta);
    const prevX = this.pos.x;
    const prevY = this.pos.y;
    this.pos.x += (this.target.x - this.pos.x) * damping;
    this.pos.y += (this.target.y - this.pos.y) * damping;

    // Velocidade normalizada governa o tamanho da cauda: parado, ela some.
    const distance = Math.hypot(this.pos.x - prevX, this.pos.y - prevY);
    const speedTarget = Math.min(distance / 14, 1);
    this.speed += (speedTarget - this.speed) * (1 - Math.exp(-8 * delta));

    this.radius += (this.radiusTarget - this.radius) * (1 - Math.exp(-10 * delta));

    // A cauda é a posição do quadro anterior propagando pela fila.
    this.trail.pop();
    this.trail.unshift({ x: this.pos.x, y: this.pos.y });

    ctx.save();
    ctx.globalAlpha = this.visible;
    // 'lighter' soma as cores onde os traços se cruzam.
    ctx.globalCompositeOperation = 'lighter';

    if (this.speed > 0.02) this._drawTrail(ctx);
    this._drawOrbits(ctx, elapsed);
    this._drawCore(ctx);

    ctx.restore();
  }

  dispose() {
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerdown', this._onDown);
    window.removeEventListener('pointerover', this._onOver);
    document.removeEventListener('pointerleave', this._onLeave);
    document.removeEventListener('pointerenter', this._onEnter);
    window.removeEventListener('resize', this._onResize);
    this.canvas.remove();
    document.body.classList.remove('has-custom-cursor');
  }
}

/**
 * Cria o cursor e o pendura no ticker central.
 * Devolve null quando não deve existir (touch ou movimento reduzido).
 */
export function initAnimatedCursor() {
  if (env.isTouch || env.prefersReducedMotion) return null;

  const cursor = new AnimatedCursor();

  let elapsed = 0;
  gsap.ticker.add((time, deltaMs) => {
    const delta = Math.min(deltaMs / 1000, 0.05);
    elapsed += delta;
    cursor.update(delta, elapsed);
  });

  return cursor;
}
