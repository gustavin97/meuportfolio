/**
 * ==========================================
 * INTERACTIONS.JS — MICROINTERAÇÕES
 * ==========================================
 * Cursor customizado, botões magnéticos e cards com
 * inclinação 3D. Todos desativados em touch e em
 * prefers-reduced-motion.
 * ==========================================
 */

import { env } from '../core/env.js';
import { gsap } from '../core/gsap.js';

/**
 * quickTo só aceita propriedade simples; `scale` é atalho para
 * scaleX + scaleY e gera o aviso "scale not eligible for reset".
 * Este helper anima os dois eixos juntos.
 */
function quickScale(target, options) {
  const scaleX = gsap.quickTo(target, 'scaleX', options);
  const scaleY = gsap.quickTo(target, 'scaleY', options);
  return (value) => {
    scaleX(value);
    scaleY(value);
  };
}

/** Botões que "puxam" o cursor dentro de um raio. */
export function initMagneticButtons(scope = document) {
  if (env.isTouch || env.prefersReducedMotion) return;

  scope.querySelectorAll('[data-magnetic]').forEach((element) => {
    const strength = parseFloat(element.dataset.magnetic) || 0.35;
    const moveX = gsap.quickTo(element, 'x', { duration: 0.4, ease: 'power3.out' });
    const moveY = gsap.quickTo(element, 'y', { duration: 0.4, ease: 'power3.out' });

    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      moveX((event.clientX - (rect.left + rect.width / 2)) * strength);
      moveY((event.clientY - (rect.top + rect.height / 2)) * strength);
    });

    element.addEventListener('pointerleave', () => {
      moveX(0);
      moveY(0);
    });
  });
}

/** Inclinação 3D dos cards conforme a posição do cursor. */
export function initTiltCards(scope = document) {
  if (env.isTouch || env.prefersReducedMotion || env.tier === 'low') return;

  scope.querySelectorAll('[data-tilt]').forEach((card) => {
    const max = parseFloat(card.dataset.tilt) || 8;

    const rotateX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const rotateY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });

    card.addEventListener('pointerenter', () => {
      gsap.to(card, { transformPerspective: 900, scale: 1.02, duration: 0.4, ease: 'power3.out' });
    });

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      // Y do mouse inclina no eixo X e vice-versa — é o que parece natural.
      rotateX(-py * max * 2);
      rotateY(px * max * 2);

      // Reflexo que segue o cursor.
      card.style.setProperty('--glare-x', `${(px + 0.5) * 100}%`);
      card.style.setProperty('--glare-y', `${(py + 0.5) * 100}%`);
    });

    card.addEventListener('pointerleave', () => {
      rotateX(0);
      rotateY(0);
      gsap.to(card, { scale: 1, duration: 0.5, ease: 'power3.out' });
    });
  });
}

export function initInteractions(scope = document) {
  initMagneticButtons(scope);
  initTiltCards(scope);
  initMediaHover(scope);
  if (scope === document) initMagneticTitle();
}

/**
 * Zoom da imagem no hover do card.
 *
 * Precisa ser GSAP e não CSS: o `transform` do .media-img é escrito
 * inline pelo wipe de entrada (scale) e pelo parallax (yPercent), e
 * estilo inline vence regra CSS — um `:hover { transform: scale() }`
 * simplesmente não teria efeito. Aqui as três animações compõem,
 * porque o GSAP soma as propriedades no mesmo transform.
 */
export function initMediaHover(scope = document) {
  if (env.isTouch || env.prefersReducedMotion) return;

  const cards = scope.querySelectorAll(
    '.project-card, .formation-card, .gallery-item, .platform-card',
  );

  cards.forEach((card) => {
    const image = card.querySelector('.media-img');
    if (!image) return;

    const zoom = quickScale(image, {
      duration: 0.6,
      ease: 'guz',
      // O reveal também anima scale; overwrite evita os dois brigando
      // se o mouse entrar no card durante a animação de entrada.
      overwrite: 'auto',
    });

    card.addEventListener('pointerenter', () => zoom(1.06));
    card.addEventListener('pointerleave', () => zoom(1));
  });
}

/**
 * Letras do nome no hero reagem ao cursor: as próximas sobem,
 * giram em direção a ele e acendem. Cada letra calcula a própria
 * distância, então o efeito "anda" pela palavra junto com o mouse.
 *
 * Anima y, rotationY, scale e um --glow — propriedades que a
 * entrada do SplitText (yPercent, rotateX, opacity) não usa,
 * para as duas não brigarem. As letras são buscadas a cada
 * movimento porque o autoSplit recria os spans no resize.
 */
export function initMagneticTitle() {
  if (env.isTouch || env.prefersReducedMotion) return;

  const title = document.querySelector('.hero-title-primary');
  const hero = document.querySelector('#hero');
  if (!title || !hero) return;

  const movers = new WeakMap();
  const getMover = (char) => {
    if (!movers.has(char)) {
      const options = { duration: 0.5, ease: 'power3.out' };
      movers.set(char, {
        y: gsap.quickTo(char, 'y', options),
        rotationY: gsap.quickTo(char, 'rotationY', options),
        scale: quickScale(char, options),
        glow: gsap.quickTo(char, '--glow', options),
      });
    }
    return movers.get(char);
  };

  const RADIUS = 260;

  hero.addEventListener('pointermove', (event) => {
    title.querySelectorAll('.char').forEach((char) => {
      const rect = char.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      // Queda suave: 1 em cima da letra, 0 na borda do raio.
      const force = Math.max(0, 1 - Math.hypot(dx, dy) / RADIUS) ** 2;
      const mover = getMover(char);
      mover.y(-force * 18);
      mover.rotationY(gsap.utils.clamp(-35, 35, (dx / RADIUS) * 35 * force));
      mover.scale(1 + force * 0.08);
      mover.glow(force);
    });
  });

  hero.addEventListener('pointerleave', () => {
    title.querySelectorAll('.char').forEach((char) => {
      const mover = getMover(char);
      mover.y(0);
      mover.rotationY(0);
      mover.scale(1);
      mover.glow(0);
    });
  });
}
