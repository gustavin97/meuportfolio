/**
 * ==========================================
 * HUD.JS — PAINEL DE CAPÍTULOS
 * ==========================================
 * Um painel discreto na lateral esquerda, como o contador
 * de um filme: número do capítulo, nome da seção e um
 * trilho com o progresso da página inteira.
 *
 * Ao trocar de seção, o número rola e o nome é embaralhado
 * até assentar — o mesmo vocabulário dos títulos.
 *
 * Puramente decorativo (aria-hidden): a navegação real
 * continua no header. Só aparece em telas largas, onde
 * existe margem livre para ele.
 * ==========================================
 */

import { env } from '../core/env.js';
import { gsap, ScrollTrigger } from '../core/gsap.js';
import { navigation } from '../data/site.js';

const SCRAMBLE_CHARS = '01<>/{}#$%&';
const pad = (value) => String(value).padStart(2, '0');

function buildHud() {
  const hud = document.createElement('aside');
  hud.className = 'chapter-hud';
  hud.setAttribute('aria-hidden', 'true');
  hud.innerHTML = `
    <div class="chapter-hud-count">
      <span class="chapter-hud-window"><span class="chapter-hud-index">01</span></span>
      <span class="chapter-hud-total">/ ${pad(navigation.length)}</span>
    </div>
    <div class="chapter-hud-track">
      <span class="chapter-hud-fill"></span>
      ${navigation.map(() => '<span class="chapter-hud-tick"></span>').join('')}
    </div>
    <p class="chapter-hud-label">${navigation[0].label}</p>
  `;
  document.body.appendChild(hud);
  return hud;
}

export function initChapterHud() {
  const sections = navigation
    .map((item, index) => ({ ...item, index, element: document.getElementById(item.id) }))
    .filter((item) => item.element);
  if (!sections.length) return;

  const hud = buildHud();
  const indexEl = hud.querySelector('.chapter-hud-index');
  const labelEl = hud.querySelector('.chapter-hud-label');
  const fill = hud.querySelector('.chapter-hud-fill');
  const ticks = hud.querySelectorAll('.chapter-hud-tick');

  // Marcas no trilho na posição real de cada seção na página.
  const placeTicks = () => {
    const max = ScrollTrigger.maxScroll(window) || 1;
    sections.forEach((section, i) => {
      // Medido pelo retângulo, não offsetTop: o pin dos projetos insere um wrapper.
      const top = section.element.getBoundingClientRect().top + window.scrollY;
      const start = Math.min(Math.max(top / max, 0), 1);
      ticks[i]?.style.setProperty('--at', `${start * 100}%`);
    });
  };
  ScrollTrigger.addEventListener('refresh', placeTicks);
  placeTicks();

  let current = 0;
  const show = (next) => {
    if (next === current) return;
    const direction = next > current ? 1 : -1;
    current = next;
    ticks.forEach((tick, i) => tick.classList.toggle('is-passed', i <= next));

    if (env.prefersReducedMotion) {
      indexEl.textContent = pad(next + 1);
      labelEl.textContent = navigation[next].label;
      return;
    }

    // O número sai por um lado e o novo entra pelo outro, como um odômetro.
    gsap
      .timeline({ overwrite: true })
      .to(indexEl, { yPercent: -110 * direction, duration: 0.25, ease: 'power2.in' })
      .add(() => {
        indexEl.textContent = pad(next + 1);
      })
      .fromTo(
        indexEl,
        { yPercent: 110 * direction },
        { yPercent: 0, duration: 0.45, ease: 'guz' },
      );

    gsap.to(labelEl, {
      duration: 0.7,
      ease: 'none',
      overwrite: true,
      scrambleText: { text: navigation[next].label, chars: SCRAMBLE_CHARS, speed: 0.6 },
    });
  };

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section.element,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => self.isActive && show(section.index),
    });
  });
  ticks[0]?.classList.add('is-passed');

  // Progresso da página inteira no trilho.
  gsap.fromTo(
    fill,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: env.prefersReducedMotion ? true : 0.4 },
    },
  );

  if (!env.prefersReducedMotion) {
    gsap.fromTo(
      hud,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 1, delay: 0.6, ease: 'guz' },
    );
  }
}
