/**
 * ==========================================
 * FOOTER.JS — ASSINATURA COM HOLOFOTE
 * ==========================================
 * O nome gigante do rodapé sobe de dentro da página ao
 * chegar no fim do scroll, e um holofote segue o cursor
 * acendendo o preenchimento em gradiente por baixo do contorno.
 * ==========================================
 */

import { env } from '../core/env.js';
import { gsap } from '../core/gsap.js';

export function initFooterSignature() {
  const giant = document.querySelector('.footer-giant');
  if (!giant) return;

  if (!env.prefersReducedMotion) {
    // Sobe e "assenta" conforme o fim da página chega.
    gsap.fromTo(
      giant.querySelectorAll('span'),
      { yPercent: 60, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: giant, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
      },
    );
  }

  if (env.isTouch) return;

  // Posição e raio interpolados: o holofote desliza e "abre" ao entrar.
  const spot = { x: 50, y: 50, r: 0 };
  const apply = () => {
    giant.style.setProperty('--spot-x', `${spot.x}%`);
    giant.style.setProperty('--spot-y', `${spot.y}%`);
    giant.style.setProperty('--spot-r', `${spot.r}px`);
  };
  const ease = { duration: 0.5, ease: 'power3.out', onUpdate: apply, overwrite: 'auto' };

  giant.addEventListener('pointermove', (event) => {
    const rect = giant.getBoundingClientRect();
    gsap.to(spot, {
      ...ease,
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      r: 260,
    });
  });

  giant.addEventListener('pointerleave', () => gsap.to(spot, { ...ease, r: 0 }));
}
