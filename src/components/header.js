/**
 * ==========================================
 * HEADER.JS — CABEÇALHO E NAVEGAÇÃO
 * ==========================================
 * Estado compacto ao rolar, auto-ocultar ao descer,
 * link ativo conforme a seção visível e menu mobile
 * com foco preso enquanto aberto.
 * ==========================================
 */

import { navigation } from '../data/site.js';
import { env } from '../core/env.js';
import { gsap, ScrollTrigger, scrollTo, startScroll, stopScroll } from '../core/scroll.js';

/** Compacta o header e o esconde quando o usuário desce. */
function initHeaderState(header) {
  ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    onUpdate: (self) => {
      header.classList.toggle('is-scrolled', self.scroll() > 80);
      // Só esconde longe do topo, senão pisca no início da página.
      const goingDown = self.direction === 1 && self.scroll() > 300;
      header.classList.toggle('is-hidden', goingDown);
    },
  });
}

/** Marca o link da seção atualmente em tela. */
function initActiveLink() {
  const links = new Map(
    [...document.querySelectorAll('[data-nav]')].map((link) => [link.dataset.nav, link]),
  );

  const setActive = (id) => {
    links.forEach((link, key) => link.classList.toggle('is-active', key === id));
  };

  navigation.forEach((item) => {
    const section = document.getElementById(item.id);
    if (!section) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onEnter: () => setActive(item.id),
      onEnterBack: () => setActive(item.id),
    });
  });
}

/** Menu mobile: abre, prende o foco e devolve ao fechar. */
function initMobileMenu(header) {
  const button = header.querySelector('.mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!button || !menu) return;

  let isOpen = false;

  const links = () => [...menu.querySelectorAll('a')];

  const open = () => {
    isOpen = true;
    document.body.classList.add('is-menu-open');
    menu.classList.add('is-open');
    button.classList.add('is-active');
    button.setAttribute('aria-expanded', 'true');
    menu.removeAttribute('inert');
    stopScroll();

    if (!env.prefersReducedMotion) {
      gsap.fromTo(
        links(),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out', delay: 0.15 },
      );
    }
    links()[0]?.focus();
  };

  const close = () => {
    isOpen = false;
    document.body.classList.remove('is-menu-open');
    menu.classList.remove('is-open');
    button.classList.remove('is-active');
    button.setAttribute('aria-expanded', 'false');
    // inert tira o menu fechado da ordem de tabulação e do leitor de tela.
    menu.setAttribute('inert', '');
    startScroll();
  };

  close();

  button.addEventListener('click', () => (isOpen ? close() : open()));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      close();
      button.focus();
    }
  });
}

/** Âncoras usam o scroll suave do Lenis e compensam a altura do header. */
function initAnchorLinks(header) {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    scrollTo(target, { offset: -header.offsetHeight + 8 });
    history.pushState(null, '', href);
  });
}

export function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  initHeaderState(header);
  initActiveLink();
  initMobileMenu(header);
  initAnchorLinks(header);
}
