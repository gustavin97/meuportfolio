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
import { gsap } from '../core/scroll.js';

/**
 * Cursor de dois anéis: o ponto acompanha o mouse na hora,
 * o anel segue com atraso — a defasagem é o efeito.
 */
export function initCustomCursor() {
  if (env.isTouch || env.prefersReducedMotion) return;

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  document.body.classList.add('has-custom-cursor');

  const setDotX = gsap.quickSetter(dot, 'x', 'px');
  const setDotY = gsap.quickSetter(dot, 'y', 'px');
  const setRingX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
  const setRingY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });

  window.addEventListener(
    'pointermove',
    (event) => {
      setDotX(event.clientX);
      setDotY(event.clientY);
      setRingX(event.clientX);
      setRingY(event.clientY);
    },
    { passive: true },
  );

  // Cresce sobre qualquer elemento interativo.
  const interactive = 'a, button, [data-cursor="hover"], input, textarea';
  document.addEventListener('pointerover', (event) => {
    if (event.target.closest(interactive)) {
      gsap.to(ring, { scale: 2.2, opacity: 0.5, duration: 0.3, ease: 'power2.out' });
    }
  });
  document.addEventListener('pointerout', (event) => {
    if (event.target.closest(interactive)) {
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
    }
  });

  // Some ao sair da janela para não ficar um ponto preso na borda.
  document.addEventListener('pointerleave', () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 }));
  document.addEventListener('pointerenter', () => gsap.to([dot, ring], { opacity: 1, duration: 0.2 }));
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
  initCustomCursor();
  initMagneticButtons(scope);
  initTiltCards(scope);
}
