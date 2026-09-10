/**
 * ==========================================
 * PRELOADER.JS — ABERTURA DA EXPERIÊNCIA
 * ==========================================
 * Segura a página enquanto fontes e primeiras imagens
 * carregam, e entrega a cena 3D já compilada — sem o
 * "flash" de canvas preto que denuncia WebGL improvisado.
 *
 * Com movimento reduzido, some imediatamente.
 * ==========================================
 */

import { env } from '../core/env.js';
import { gsap } from '../core/gsap.js';
import { startScroll, stopScroll } from '../core/scroll.js';

/** Espera fontes e a janela `load`, com teto de tempo para não travar em rede ruim. */
function waitForAssets(timeout = 4000) {
  const ready = Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
  ]);

  return Promise.race([ready, new Promise((resolve) => setTimeout(resolve, timeout))]);
}

/**
 * Executa a abertura e resolve quando o hero está pronto para animar.
 * @param {{ onProgress?: (p:number)=>void }} options
 */
export async function runPreloader({ onProgress } = {}) {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;

  const counter = preloader.querySelector('.preloader-counter');
  const bar = preloader.querySelector('.preloader-bar');

  if (env.prefersReducedMotion) {
    preloader.remove();
    document.body.classList.add('is-loaded');
    return;
  }

  stopScroll();

  // A barra sobe até 90% por conta própria; os últimos 10% são o carregamento real.
  const progress = { value: 0 };
  const fakeProgress = gsap.to(progress, {
    value: 90,
    duration: 2.2,
    ease: 'power1.out',
    onUpdate: () => {
      const rounded = Math.round(progress.value);
      if (counter) counter.textContent = String(rounded).padStart(3, '0');
      if (bar) gsap.set(bar, { scaleX: rounded / 100 });
      onProgress?.(rounded / 100);
    },
  });

  await waitForAssets();
  fakeProgress.kill();

  await gsap.to(progress, {
    value: 100,
    duration: 0.5,
    ease: 'power2.out',
    onUpdate: () => {
      const rounded = Math.round(progress.value);
      if (counter) counter.textContent = String(rounded).padStart(3, '0');
      if (bar) gsap.set(bar, { scaleX: rounded / 100 });
      onProgress?.(rounded / 100);
    },
  });

  await gsap
    .timeline()
    .to('.preloader-content', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' })
    .to(preloader, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 0.9,
      ease: 'power4.inOut',
    })
    .add(() => {
      preloader.remove();
      document.body.classList.add('is-loaded');
      startScroll();
    });
}

/** Entrada do hero, encadeada logo após o preloader. */
export function playHeroIntro(heroScene) {
  if (env.prefersReducedMotion) {
    heroScene?.setOpacity(1);
    return;
  }

  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (heroScene) {
    // Anima o uniform de opacidade da cena via proxy.
    const proxy = { value: 0 };
    timeline.to(
      proxy,
      {
        value: 1,
        duration: 1.6,
        onUpdate: () => heroScene.setOpacity(proxy.value),
      },
      0,
    );
  }

  timeline.fromTo(
    '.site-header',
    { opacity: 0, y: -24 },
    { opacity: 1, y: 0, duration: 0.8 },
    0.2,
  );

  timeline.fromTo(
    '.scroll-indicator',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8 },
    0.9,
  );
}
