/**
 * ==========================================
 * REVEAL.JS — SISTEMA DE ENTRADA DE ELEMENTOS
 * ==========================================
 * Um único vocabulário de animação para a página inteira,
 * dirigido por atributos no HTML:
 *
 *   data-reveal="fade|up|left|right|scale"
 *   data-reveal-delay="0.15"
 *   data-split="chars|words|lines"
 *
 * Com prefers-reduced-motion tudo aparece instantaneamente
 * e nenhum ScrollTrigger é criado.
 * ==========================================
 */

import SplitType from 'split-type';

import { env } from '../core/env.js';
import { gsap, ScrollTrigger } from '../core/scroll.js';

const FROM_VARS = {
  fade: { opacity: 0 },
  up: { opacity: 0, y: 48 },
  down: { opacity: 0, y: -48 },
  left: { opacity: 0, x: -56 },
  right: { opacity: 0, x: 56 },
  scale: { opacity: 0, scale: 0.9 },
};

/** Estado final comum: cancela qualquer transform residual. */
const TO_VARS = { opacity: 1, x: 0, y: 0, scale: 1 };

/**
 * Ativa todos os elementos com [data-reveal] dentro de um escopo.
 * Pode ser chamado novamente após injetar HTML novo.
 */
export function initReveals(scope = document) {
  const elements = scope.querySelectorAll('[data-reveal]:not([data-reveal-ready])');

  elements.forEach((element) => {
    element.setAttribute('data-reveal-ready', '');

    if (env.prefersReducedMotion) {
      gsap.set(element, TO_VARS);
      return;
    }

    const type = element.dataset.reveal || 'up';
    const delay = parseFloat(element.dataset.revealDelay || '0');
    const from = FROM_VARS[type] ?? FROM_VARS.up;

    gsap.fromTo(element, from, {
      ...TO_VARS,
      duration: 0.9,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 88%',
        once: true,
      },
    });
  });
}

/**
 * Divide títulos em caracteres/palavras e revela em cascata.
 * SplitType reescreve o DOM, então o texto original é preservado
 * em data-original para leitores de tela via aria-label.
 */
export function initSplitText(scope = document) {
  const targets = scope.querySelectorAll('[data-split]:not([data-split-ready])');

  targets.forEach((element) => {
    element.setAttribute('data-split-ready', '');

    if (env.prefersReducedMotion) {
      gsap.set(element, { opacity: 1 });
      return;
    }

    const granularity = element.dataset.split || 'chars';
    // Mantém o texto acessível: o DOM fatiado vira ruído para leitores de tela.
    element.setAttribute('aria-label', element.textContent.trim());

    const split = new SplitType(element, {
      types: granularity === 'lines' ? 'lines' : `words, ${granularity}`,
      tagName: 'span',
    });

    const pieces = split[granularity] ?? split.words;
    if (!pieces?.length) return;

    pieces.forEach((piece) => piece.setAttribute('aria-hidden', 'true'));
    gsap.set(element, { opacity: 1 });

    gsap.fromTo(
      pieces,
      { opacity: 0, yPercent: 110, rotateX: -55 },
      {
        opacity: 1,
        yPercent: 0,
        rotateX: 0,
        duration: 0.85,
        ease: 'power4.out',
        stagger: granularity === 'chars' ? 0.022 : 0.06,
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          once: true,
        },
      },
    );

    // Re-divide em resize para as linhas não quebrarem erradas.
    if (granularity === 'lines') {
      ScrollTrigger.addEventListener('refreshInit', () => split.split());
    }
  });
}

/**
 * Contadores numéricos das métricas.
 * Anima um objeto proxy e formata a cada frame — evita
 * interpolar texto diretamente, que produz decimais feios.
 */
export function initCounters(scope = document) {
  const counters = scope.querySelectorAll('[data-counter]:not([data-counter-ready])');

  counters.forEach((element) => {
    element.setAttribute('data-counter-ready', '');

    const target = parseFloat(element.dataset.counter);
    const suffix = element.dataset.counterSuffix || '';

    if (Number.isNaN(target)) return;

    if (env.prefersReducedMotion) {
      element.textContent = `${target}${suffix}`;
      return;
    }

    const proxy = { value: 0 };
    element.textContent = `0${suffix}`;

    gsap.to(proxy, {
      value: target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = `${Math.round(proxy.value)}${suffix}`;
      },
      scrollTrigger: {
        trigger: element,
        start: 'top 90%',
        once: true,
      },
    });
  });
}

/** Roda os três sistemas de uma vez. */
export function initAllReveals(scope = document) {
  initSplitText(scope);
  initReveals(scope);
  initCounters(scope);
}
