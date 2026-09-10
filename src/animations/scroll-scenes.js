/**
 * ==========================================
 * SCROLL-SCENES.JS — CENAS GUIADAS POR SCROLL
 * ==========================================
 * Animações que dependem da posição da página:
 * parallax, linha do tempo progressiva, galeria de
 * projetos horizontal (pinned) e vínculo do scroll
 * com a cena 3D do hero.
 * ==========================================
 */

import { env } from '../core/env.js';
import { gsap, ScrollTrigger } from '../core/gsap.js';

/**
 * Liga o progresso do scroll do hero à cena WebGL e
 * dissolve o conteúdo do hero conforme a página desce.
 */
export function heroScrollScene(heroScene) {
  const hero = document.querySelector('#hero');
  if (!hero || env.prefersReducedMotion) return;

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => heroScene?.setScrollProgress(self.progress),
  });

  gsap.to('.hero-content', {
    yPercent: -18,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom 30%',
      scrub: true,
    },
  });

  gsap.to('.scroll-indicator', {
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: '15% top', scrub: true },
  });
}

/** Desenha a linha vertical da jornada conforme o usuário desce. */
export function timelineScene() {
  const timeline = document.querySelector('.timeline');
  const progress = document.querySelector('.timeline-progress');
  if (!timeline || env.prefersReducedMotion) return;

  if (progress) {
    gsap.fromTo(
      progress,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        transformOrigin: 'top center',
        scrollTrigger: {
          trigger: timeline,
          start: 'top 70%',
          end: 'bottom 70%',
          scrub: 0.6,
        },
      },
    );
  }

  gsap.utils.toArray('.timeline-item').forEach((item, index) => {
    gsap.fromTo(
      item,
      { opacity: 0, x: index % 2 === 0 ? -60 : 60 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 85%', once: true },
      },
    );
  });
}

// O parallax das fotos do Sobre virou responsabilidade de
// animations/media.js, que move a imagem DENTRO da moldura.

/**
 * Projetos em rolagem horizontal com a seção fixada.
 * Só em telas largas: em mobile o carrossel vira swipe nativo,
 * que é o gesto esperado e não sequestra o scroll vertical.
 */
export function projectsHorizontalScene() {
  const section = document.querySelector('#projects');
  const track = document.querySelector('.projects-track');
  if (!section || !track) return;

  const isEligible = window.innerWidth >= 1024 && !env.prefersReducedMotion;
  if (!isEligible) {
    track.classList.add('is-native-scroll');
    return;
  }

  const getDistance = () => track.scrollWidth - window.innerWidth + 96;

  gsap.to(track, {
    x: () => -getDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      // A distância do pin acompanha a largura real do trilho.
      end: () => `+=${getDistance()}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // Barra de progresso do carrossel.
  const bar = document.querySelector('.projects-progress-bar');
  if (bar) {
    gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        transformOrigin: 'left center',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          scrub: true,
        },
      },
    );
  }
}

/** Cards de tecnologia entrando em cascata por categoria. */
export function techGridScene() {
  if (env.prefersReducedMotion) return;

  gsap.utils.toArray('.tech-category').forEach((category) => {
    gsap.fromTo(
      category.querySelectorAll('.tech-item'),
      { opacity: 0, y: 28, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.6)',
        stagger: { amount: 0.5, from: 'start' },
        scrollTrigger: { trigger: category, start: 'top 82%', once: true },
      },
    );
  });
}

/** Ativa todas as cenas de scroll. */
export function initScrollScenes(heroScene) {
  heroScrollScene(heroScene);
  timelineScene();
  projectsHorizontalScene();
  techGridScene();

  // As fontes web mudam a altura do texto e invalidam as medidas.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
