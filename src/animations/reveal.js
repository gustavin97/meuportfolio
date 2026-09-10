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
 *   data-counter="100" data-counter-suffix="%"
 *   data-scramble
 *
 * Usa o SplitText do GSAP (liberado na 3.15) em vez do
 * split-type: ele já devolve o texto original ao leitor de
 * tela, refaz a divisão sozinho em resize e suporta máscara
 * por linha, que é o que dá o reveal "por baixo da régua".
 *
 * Com prefers-reduced-motion tudo aparece instantaneamente
 * e nenhum ScrollTrigger é criado.
 * ==========================================
 */

import { env } from '../core/env.js';
import { gsap, DURATION, SplitText } from '../core/gsap.js';

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

/* ==================== REVEAL GENÉRICO ==================== */

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
      duration: DURATION.base,
      delay,
      ease: 'guz',
      scrollTrigger: { trigger: element, start: 'top 88%', once: true },
    });
  });
}

/* ==================== TEXTO FATIADO ==================== */

export function initSplitText(scope = document) {
  const targets = scope.querySelectorAll('[data-split]:not([data-split-ready])');

  targets.forEach((element) => {
    element.setAttribute('data-split-ready', '');

    if (env.prefersReducedMotion) {
      gsap.set(element, { opacity: 1 });
      return;
    }

    const granularity = element.dataset.split || 'chars';
    gsap.set(element, { opacity: 1 });

    // autoSplit + onSplit: o SplitText refaz a divisão quando a fonte
    // carrega ou a largura muda, e devolve a animação para reaplicar.
    SplitText.create(element, {
      type: granularity === 'lines' ? 'lines' : `words, ${granularity}`,
      // A máscara recorta na altura da linha: o texto sobe "de dentro" dela.
      mask: granularity === 'lines' ? 'lines' : undefined,
      autoSplit: true,
      onSplit(self) {
        const pieces = self[granularity] ?? self.words;
        if (!pieces?.length) return undefined;

        return gsap.fromTo(
          pieces,
          { opacity: 0, yPercent: 110, rotateX: -55 },
          {
            opacity: 1,
            yPercent: 0,
            rotateX: 0,
            duration: 0.85,
            ease: 'power4.out',
            stagger: granularity === 'chars' ? 0.022 : 0.06,
            scrollTrigger: { trigger: element, start: 'top 85%', once: true },
          },
        );
      },
    });
  });
}

/* ==================== EMBARALHAMENTO ==================== */

/**
 * Texto que se resolve a partir de caracteres aleatórios.
 * Usado no cargo do hero — combina com o tema e chama atenção
 * para a linha que diz o que a pessoa faz.
 */
export function initScramble(scope = document) {
  scope.querySelectorAll('[data-scramble]:not([data-scramble-ready])').forEach((element) => {
    element.setAttribute('data-scramble-ready', '');
    const text = element.textContent.trim();

    if (env.prefersReducedMotion) return;

    gsap.to(element, {
      duration: 1.6,
      scrambleText: {
        text,
        chars: '01<>/{}[]#$%&',
        speed: 0.4,
        revealDelay: 0.35,
      },
      ease: 'none',
      scrollTrigger: { trigger: element, start: 'top 90%', once: true },
    });
  });
}

/* ==================== CONTADORES ==================== */

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

    // Anima um proxy e formata a cada frame: interpolar o texto
    // direto produziria decimais quebrados no meio da contagem.
    const proxy = { value: 0 };
    element.textContent = `0${suffix}`;

    gsap.to(proxy, {
      value: target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = `${Math.round(proxy.value)}${suffix}`;
      },
      scrollTrigger: { trigger: element, start: 'top 90%', once: true },
    });
  });
}

/* ==================== TRAÇO DOS TÍTULOS ==================== */

/**
 * Risco que se desenha sob cada título de seção.
 * DrawSVG anima o stroke-dashoffset de verdade — em CSS seria
 * um scaleX, que estica as pontas em vez de desenhar.
 */
export function initTitleUnderlines(scope = document) {
  scope.querySelectorAll('.section-title:not([data-underline-ready])').forEach((title) => {
    title.setAttribute('data-underline-ready', '');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'title-underline');
    svg.setAttribute('viewBox', '0 0 300 12');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    // Traço levemente irregular: uma reta perfeita parece borda, não risco.
    svg.innerHTML =
      '<path d="M2 8 C 60 2, 120 11, 180 5 S 260 3, 298 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>';

    title.insertAdjacentElement('afterend', svg);

    if (env.prefersReducedMotion) return;

    gsap.fromTo(
      svg.querySelector('path'),
      { drawSVG: '0%' },
      {
        drawSVG: '100%',
        duration: DURATION.slow,
        ease: 'guz',
        scrollTrigger: { trigger: title, start: 'top 85%', once: true },
      },
    );
  });
}

/** Roda todos os sistemas de uma vez. */
export function initAllReveals(scope = document) {
  initSplitText(scope);
  initReveals(scope);
  initScramble(scope);
  initCounters(scope);
  initTitleUnderlines(scope);
}
