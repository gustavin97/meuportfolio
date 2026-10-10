/**
 * ==========================================
 * EASTER-EGG.JS — SALTO PARA O HIPERESPAÇO
 * ==========================================
 * Digitar "guz" em qualquer lugar da página (fora de campos
 * de formulário) ou o código Konami dispara alguns segundos
 * de hiperespaço: a poeira corre para a câmera, a lente abre,
 * a tela pisca e um aviso aparece.
 *
 * Quem abre o console ganha a dica. Recompensa para curiosos.
 * ==========================================
 */

import { env } from '../core/env.js';
import { gsap } from '../core/gsap.js';
import { playCue } from './sound.js';

const SECRET = 'guz';
const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
];

function buildOverlay() {
  const flash = document.createElement('div');
  flash.className = 'warp-flash';
  flash.setAttribute('aria-hidden', 'true');

  const toast = document.createElement('p');
  toast.className = 'warp-toast';
  toast.setAttribute('role', 'status');

  document.body.append(flash, toast);
  return { flash, toast };
}

export function initEasterEgg() {
  let overlay = null;
  let typed = '';
  let konami = 0;
  let cooling = false;

  const trigger = () => {
    if (cooling) return;
    cooling = true;
    setTimeout(() => {
      cooling = false;
    }, 4500);

    overlay ??= buildOverlay();
    overlay.toast.textContent = 'Modo hiperespaço ativado. Segura firme!';

    window.dispatchEvent(new CustomEvent('portfolio:hyperspace'));
    playCue('launch');

    if (env.prefersReducedMotion) {
      gsap.fromTo(overlay.toast, { opacity: 0 }, { opacity: 1, duration: 0.3, yoyo: true, repeat: 1, repeatDelay: 2.5 });
      return;
    }

    gsap
      .timeline()
      .fromTo(overlay.flash, { opacity: 0 }, { opacity: 0.55, duration: 0.12, ease: 'power2.out' })
      .to(overlay.flash, { opacity: 0, duration: 0.9, ease: 'power2.out' })
      .fromTo(
        overlay.toast,
        { opacity: 0, y: 20, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'guz' },
        0.1,
      )
      .to(overlay.toast, { opacity: 0, y: -12, duration: 0.5, ease: 'power2.in' }, 3);
  };

  window.addEventListener('keydown', (event) => {
    // Não sequestra quem está digitando no formulário.
    if (event.target.closest?.('input, textarea, [contenteditable]')) return;

    konami = event.key === KONAMI[konami] ? konami + 1 : event.key === KONAMI[0] ? 1 : 0;
    if (konami === KONAMI.length) {
      konami = 0;
      trigger();
    }

    if (event.key.length === 1) {
      typed = (typed + event.key.toLowerCase()).slice(-SECRET.length);
      if (typed === SECRET) trigger();
    }
  });

  console.log(
    '%cDEV GUZ%c\nCurioso, hein? Digite "guz" na página (fora do formulário) e segure firme.',
    'font: 800 28px Poppins, sans-serif; color: #00FF88; text-shadow: 0 0 12px #00FF88;',
    'font: 14px Inter, sans-serif; color: #A0A0A0;',
  );
}
