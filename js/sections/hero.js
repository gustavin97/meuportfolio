/**
 * ==========================================
 * HERO.JS
 * ==========================================
 * Seção Hero.
 * Gerencia animações iniciais e scroll indicator.
 * Preparado para Three.js e objeto 3D no futuro.
 * 
 * Funções:
 * - initializeHeroSection(): Inicializa seção
 * - setupScrollIndicator(): Configura indicador de scroll
 * - handleHeroAnimation(): Gerencia animações
 * 
 * ==========================================
 */

/**
 * Inicializa a seção Hero
 */
function initializeHeroSection() {
  console.log('Hero section initialized');
  
  // Anima elementos ao carregar
  animateHeroElements();
  
  // Configura scroll indicator
  setupScrollIndicator();
  
  // Prepara container para 3D (futuro)
  prepare3DContainer();
}

/**
 * Anima elementos da seção hero ao carregar
 */
function animateHeroElements() {
  const heroContent = document.querySelector('.hero-content');
  
  if (!heroContent) return;
  
  // Elementos com animação de entrada
  const elements = heroContent.querySelectorAll('h1, .hero-subtitle, .hero-description, .hero-buttons');
  
  elements.forEach((el, index) => {
    el.style.animation = 'slideInLeft 0.8s ease-out forwards';
    el.style.animationDelay = `${index * 0.1}s`;
  });
}

/**
 * Configura indicador de scroll
 * Anima seta ao fundo da seção hero
 */
function setupScrollIndicator() {
  const indicator = document.querySelector('.scroll-indicator');
  
  if (!indicator) return;
  
  indicator.addEventListener('click', () => {
    // Scroll para próxima seção
    const nextSection = document.querySelector('#about');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
  
  // Oculta indicador ao fazer scroll
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    if (scrollY > 100) {
      indicator.style.opacity = '0';
      indicator.style.pointerEvents = 'none';
    } else {
      indicator.style.opacity = '1';
      indicator.style.pointerEvents = 'auto';
    }
  });
}

/**
 * Prepara container para Three.js
 * Será expandido com integração 3D no futuro
 */
function prepare3DContainer() {
  const container3D = document.querySelector('.hero-3d-container');
  
  if (!container3D) return;
  
  console.log('3D container prepared for future Three.js integration');
  
  // Placeholder para inicialização do Three.js
  // await init3DModel();
}

/**
 * Inicializa Three.js (futuro)
 * Esta função será expandida quando Three.js for implementado
 */
async function init3DModel() {
  console.log('Three.js initialization (placeholder for future)');
  // TODO: Implementar Three.js
  // - Importar Three.js
  // - Criar scene, camera, renderer
  // - Carregar modelo 3D
  // - Adicionar lights
  // - Adicionar animações
}

/**
 * Anima botões do hero ao hover
 */
function animateHeroButtons() {
  const buttons = document.querySelectorAll('.hero-buttons button');
  
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-4px)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
    });
  });
}

// Inicializa quando DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeHeroSection();
    animateHeroButtons();
  });
} else {
  initializeHeroSection();
  animateHeroButtons();
}
