/**
 * ==========================================
 * SCROLL-SCENES.JS — CENAS GUIADAS POR SCROLL
 * ==========================================
 * Animações que dependem da posição da página:
 * parallax, linha do tempo progressiva, galeria de
 * projetos horizontal (pinned), faixa cinética guiada
 * pela velocidade e vínculo do scroll com o mundo 3D
 * (esfera do hero e formas de cada seção).
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

/**
 * Liga cada seção a uma forma do mundo 3D.
 *
 * Cada capítulo tem uma janela de transição (topo da seção entre 75% e
 * 25% da tela). O alvo da cena é a SOMA dos progressos dessas janelas:
 * como elas não se sobrepõem, a soma é "capítulos já passados + fração
 * do atual" — um valor contínuo, certo em qualquer direção e mesmo num
 * salto pelo menu, sem depender da ordem em que os triggers disparam.
 *
 * Precisa ser criada DEPOIS do pin dos projetos, para as posições já
 * contarem com o espaço que o pin acrescenta.
 */
export function worldMorphScene(heroScene) {
  if (!heroScene || env.prefersReducedMotion) return;

  // O índice 0 é o hero: a cena começa nele, não há janela de entrada.
  const windows = heroScene.chapters
    .slice(1)
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .map((section) =>
      ScrollTrigger.create({ trigger: section, start: 'top 75%', end: 'top 25%' }),
    );

  // Progresso calculado da posição, não lido de trigger.progress: rolando
  // para cima o ScrollTrigger atualiza os triggers em ordem inversa, e a
  // soma pegaria valores do frame anterior. start/end já vêm medidos.
  const clamp = gsap.utils.clamp(0, 1);
  const sync = (self) => {
    const scroll = self.scroll();
    const target = windows.reduce(
      (sum, { start, end }) => sum + clamp((scroll - start) / (end - start)),
      0,
    );
    heroScene.setMorphTarget(target);
  };

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      sync(self);
      // A velocidade acelera cometas e gira os cristais.
      heroScene.setScrollVelocity(self.getVelocity());
    },
    onRefresh: sync,
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

/**
 * Faixa cinética: os dois trilhos andam sozinhos, devagar, e o scroll
 * acelera — rolar para cima inverte o sentido. A velocidade também
 * inclina as letras, como se a faixa tivesse peso.
 *
 * Só ocupa o ticker enquanto a faixa está na tela.
 */
export function velocityMarqueeScene() {
  const marquee = document.querySelector('.kinetic-marquee');
  if (!marquee || env.prefersReducedMotion) return;

  const tracks = gsap.utils.toArray('.marquee-track', marquee);
  const rows = tracks.map((track) => ({
    direction: Number(track.parentElement.dataset.direction) || 1,
    setX: gsap.quickSetter(track, 'xPercent'),
    x: 0,
  }));
  const setSkew = gsap.quickSetter(tracks, 'skewX', 'deg');

  // O trilho tem o conteúdo duas vezes: -50% é o mesmo quadro que 0%.
  const wrap = gsap.utils.wrap(-50, 0);
  const BASE_SPEED = 1.6; // % do trilho por segundo, parado

  let scrollDirection = 1;
  let boost = 0; // velocidade extra vinda do scroll; decai sozinha

  const tick = (time, deltaMs) => {
    const delta = Math.min(deltaMs / 1000, 0.05);
    boost *= Math.exp(-2.5 * delta);

    const speed = (BASE_SPEED + boost) * scrollDirection;
    rows.forEach((row) => {
      row.x = wrap(row.x - speed * row.direction * delta);
      row.setX(row.x);
    });
    setSkew(Math.min(boost * 0.9, 12) * -scrollDirection);
  };

  ScrollTrigger.create({
    trigger: marquee,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      scrollDirection = self.direction;
      // velocity vem em px/s; o divisor calibra quanto o scroll empurra.
      boost = Math.max(boost, Math.abs(self.getVelocity()) / 180);
    },
    onToggle: (self) => (self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
  });
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
  velocityMarqueeScene();
  worldMorphScene(heroScene);

  // As fontes web mudam a altura do texto e invalidam as medidas.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
