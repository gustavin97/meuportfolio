/**
 * ==========================================
 * MAIN.JS — PONTO DE ENTRADA
 * ==========================================
 * Ordem importa:
 *  1. CSS
 *  2. Render do conteúdo (o DOM precisa existir antes de medir)
 *  3. Scroll suave
 *  4. Animações e cena 3D
 *  5. Preloader libera a página
 * ==========================================
 */

/* ==== ESTILOS ==== */
import '../css/global/reset.css';
import '../css/global/variables.css';
import '../css/global/global.css';
import '../css/global/animations.css';
import '../css/layout/header.css';
import '../css/layout/footer.css';
import '../css/sections/hero.css';
import '../css/sections/sobre.css';
import '../css/sections/jornada.css';
import '../css/sections/formacoes.css';
import '../css/sections/tecnologias.css';
import '../css/sections/plataformas.css';
import '../css/sections/projetos.css';
import '../css/sections/contato.css';
import '../css/components/ui.css';
import '../css/components/lightbox.css';

/* ==== MÓDULOS ==== */
import { env, onMotionPreferenceChange, shouldRenderImmersive } from './core/env.js';
import { gsap, ScrollTrigger, initSmoothScroll } from './core/scroll.js';
import { renderAll } from './sections/render.js';
import { initIcons } from './components/icons.js';
import { initHeader } from './components/header.js';
import { initContactForm } from './components/form.js';
import { initAnimatedCursor } from './components/cursor.js';
import { initProjectLightbox } from './components/lightbox.js';
import { playHeroIntro, runPreloader } from './components/preloader.js';
import { initAllReveals } from './animations/reveal.js';
import { initScrollScenes } from './animations/scroll-scenes.js';
import { initInteractions } from './animations/interactions.js';
import { initMedia } from './animations/media.js';
import { initMediaFallbacks } from './utils/dom.js';

/** Cena 3D — só carregada se o dispositivo comportar. */
let heroScene = null;

/**
 * Import dinâmico: em dispositivo sem WebGL ou com movimento
 * reduzido, o chunk do Three.js (o mais pesado do bundle)
 * nunca chega a ser baixado.
 */
async function setupHeroScene() {
  const container = document.querySelector('.hero-3d-container');
  if (!container) return null;

  if (!shouldRenderImmersive()) {
    container.classList.add('is-static');
    return null;
  }

  try {
    const { HeroScene } = await import('./three/HeroScene.js');
    const scene = new HeroScene(container);

    let elapsed = 0;
    gsap.ticker.add((time, deltaMs) => {
      const delta = Math.min(deltaMs / 1000, 0.05); // trava picos após aba inativa
      elapsed += delta;
      scene.update(delta, elapsed);
    });

    return scene;
  } catch (error) {
    console.error('[3d] não foi possível iniciar a cena:', error);
    container.classList.add('is-static');
    return null;
  }
}

async function init() {
  // 1. Conteúdo no DOM antes de qualquer medição de layout.
  renderAll();
  initMediaFallbacks();
  initIcons();

  // 2. Scroll suave (registra o ScrollTrigger).
  initSmoothScroll();

  // 3. Componentes e animações.
  initHeader();
  initContactForm();
  initAnimatedCursor();
  initAllReveals();
  initInteractions();
  initMedia();
  initProjectLightbox();

  // 4. Cena 3D e as cenas de scroll que dependem dela.
  heroScene = await setupHeroScene();
  initScrollScenes(heroScene);

  // 5. Abertura.
  await runPreloader();
  playHeroIntro(heroScene);

  ScrollTrigger.refresh();
}

/**
 * Se o usuário ativar "reduzir movimento" com a página aberta,
 * derruba a cena 3D e recarrega em modo estático.
 */
onMotionPreferenceChange((isReduced) => {
  if (isReduced && heroScene) {
    heroScene.dispose();
    heroScene = null;
    document.querySelector('.hero-3d-container')?.classList.add('is-static');
  }
});

// O bundle é module (defer por padrão): o DOM já existe aqui,
// mas a checagem protege quem injetar o script de outro jeito.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

// Exposto só em desenvolvimento, para inspecionar no console.
if (import.meta.env.DEV) {
  window.__portfolio = { env, get heroScene() { return heroScene; }, ScrollTrigger };
}
