/**
 * ==========================================
 * MEDIA.JS — REVELAÇÃO E PARALLAX DAS IMAGENS
 * ==========================================
 * Agora que as imagens existem, elas ganham tratamento próprio:
 *
 *  1. Wipe de entrada: a moldura abre com clip-path enquanto a
 *     imagem faz contra-escala (1.3 → 1). As duas coisas juntas
 *     é o que dá a sensação de a foto "chegar", em vez de só
 *     aparecer. Uma sozinha parece inacabada.
 *
 *  2. Parallax interno: a imagem é maior que a moldura e desliza
 *     dentro dela conforme o scroll. Sem a folga em CSS
 *     (.media--parallax) apareceria borda vazia.
 *
 * Os dois efeitos animam propriedades diferentes (clip-path/scale
 * vs. yPercent) justamente para não brigarem pelo mesmo valor.
 * ==========================================
 */

import { env } from '../core/env.js';
import { gsap, ScrollTrigger, DURATION } from '../core/gsap.js';

/** Wipe de entrada de todas as molduras ainda não tratadas. */
export function initMediaReveals(scope = document) {
  const frames = scope.querySelectorAll('.media:not([data-media-ready])');

  frames.forEach((frame) => {
    frame.setAttribute('data-media-ready', '');
    const image = frame.querySelector('.media-img');

    if (env.prefersReducedMotion) {
      gsap.set(frame, { clipPath: 'inset(0%)' });
      if (image) gsap.set(image, { scale: 1 });
      return;
    }

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: frame, start: 'top 88%', once: true },
    });

    // A moldura abre de baixo para cima.
    timeline.fromTo(
      frame,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: DURATION.reveal, ease: 'guz' },
    );

    // A imagem recua da escala ampliada ao mesmo tempo, um pouco mais devagar.
    if (image) {
      timeline.fromTo(
        image,
        { scale: 1.3 },
        { scale: 1, duration: DURATION.reveal + 0.3, ease: 'guz' },
        0,
      );
    }
  });
}

/**
 * Parallax da imagem dentro da moldura.
 * Só em .media--parallax, que tem a folga vertical necessária.
 */
export function initMediaParallax(scope = document) {
  if (env.prefersReducedMotion || env.tier === 'low') return;

  scope.querySelectorAll('.media--parallax:not([data-parallax-ready])').forEach((frame) => {
    frame.setAttribute('data-parallax-ready', '');
    const image = frame.querySelector('.media-img');
    if (!image) return;

    gsap.fromTo(
      image,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: frame,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });
}

/**
 * Fundos de seção: imagem grande, muito escurecida, deslizando
 * mais devagar que o conteúdo. É o que dá profundidade sem
 * competir com o texto por atenção.
 */
export function initSectionBackgrounds(scope = document) {
  scope.querySelectorAll('[data-bg]:not([data-bg-ready])').forEach((section) => {
    section.setAttribute('data-bg-ready', '');

    const layer = section.querySelector('.section-bg');
    if (!layer) return;

    if (env.prefersReducedMotion) {
      gsap.set(layer, { opacity: 1 });
      return;
    }

    // Desliza devagar: a diferença de velocidade é o efeito.
    gsap.fromTo(
      layer,
      { yPercent: -12 },
      {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );

    // Aparece e some nas bordas da seção, para não haver corte seco.
    //
    // UMA timeline, não dois tweens: dois scrubs separados sobre a mesma
    // propriedade escrevem opacity no mesmo frame e o resultado passa a
    // depender da ordem de criação. Com keyframes num único scrub, existe
    // um só dono do valor.
    gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
      .fromTo(layer, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'none' })
      .to(layer, { opacity: 1, duration: 0.5, ease: 'none' })
      .to(layer, { opacity: 0, duration: 0.25, ease: 'none' });
  });
}

/**
 * Inclinação por velocidade de scroll.
 * O ScrollTrigger já mede a velocidade; aqui ela vira um leve
 * skew nos cards, que some quando o scroll para. Dá peso ao
 * movimento — a página parece ter inércia.
 */
export function initScrollSkew() {
  if (env.prefersReducedMotion || env.tier !== 'high') return;

  const targets = gsap.utils.toArray('[data-skew]');
  if (!targets.length) return;

  const setSkew = gsap.quickSetter(targets, 'skewY', 'deg');
  const clamp = gsap.utils.clamp(-2.5, 2.5);

  ScrollTrigger.create({
    onUpdate: (self) => {
      // velocity vem em px/s; o divisor calibra a intensidade.
      const skew = clamp(self.getVelocity() / -420);
      setSkew(skew);
    },
  });

  // Volta suavemente ao zero quando o scroll para.
  ScrollTrigger.addEventListener('scrollEnd', () => {
    gsap.to(targets, { skewY: 0, duration: 0.6, ease: 'guz', overwrite: 'auto' });
  });
}

/** Ativa todo o tratamento de mídia. */
export function initMedia(scope = document) {
  initMediaReveals(scope);
  initMediaParallax(scope);
  initSectionBackgrounds(scope);
  initScrollSkew();
}
