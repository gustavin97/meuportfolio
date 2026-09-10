/**
 * ==========================================
 * SCROLL.JS — LENIS + GSAP SCROLLTRIGGER
 * ==========================================
 * Lenis controla o scroll; o ScrollTrigger precisa ser
 * informado a cada frame, senão as animações ficam
 * defasadas do scroll suavizado.
 *
 * Regra do projeto: existe UM requestAnimationFrame na página,
 * o do gsap.ticker. Lenis e Three.js são conduzidos por ele.
 * ==========================================
 */

import Lenis from 'lenis';

import { env } from './env.js';
// O registro dos plugins acontece em core/gsap.js.
import { gsap, ScrollTrigger } from './gsap.js';

let lenis = null;

export function initSmoothScroll() {
  // Com movimento reduzido, o scroll nativo é o comportamento correto.
  if (env.prefersReducedMotion) {
    ScrollTrigger.refresh();
    return null;
  }

  // O reset.css define scroll-behavior: smooth, que briga com o Lenis.
  document.documentElement.style.scrollBehavior = 'auto';

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
    // Em touch o scroll nativo é mais previsível e não sequestra gestos.
    smoothTouch: false,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    // Lenis espera milissegundos; o ticker do GSAP entrega segundos.
    lenis.raf(time * 1000);
  });

  // O GSAP já faz seu próprio smoothing de delta.
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.refresh();
  return lenis;
}

/** Rola até um elemento respeitando o modo de scroll ativo. */
export function scrollTo(target, options = {}) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  if (lenis) {
    lenis.scrollTo(element, { offset: options.offset ?? 0, duration: options.duration ?? 1.2 });
  } else {
    element.scrollIntoView({ behavior: env.prefersReducedMotion ? 'auto' : 'smooth' });
  }
}

export function stopScroll() {
  lenis?.stop();
  document.body.classList.add('is-scroll-locked');
}

export function startScroll() {
  lenis?.start();
  document.body.classList.remove('is-scroll-locked');
}

export { lenis, ScrollTrigger, gsap };
