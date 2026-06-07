/**
 * ==========================================
 * MAIN.JS
 * ==========================================
 * Arquivo principal do projeto.
 * Responsável por inicializar todos os componentes e seções.
 * Gerencia eventos globais, scroll, resize e interações gerais.
 * 
 * Funções:
 * - initializeApp(): Inicia a aplicação
 * - setupEventListeners(): Configura ouvintes de eventos globais
 * - handleScroll(): Gerencia eventos de scroll
 * - handleResize(): Gerencia eventos de redimensionamento
 * 
 * ==========================================
 */

// Estado global da aplicação
const appState = {
  scrollPosition: 0,
  isLoading: false,
  isMobileMenuOpen: false,
  theme: 'dark', // 'dark' ou 'light'
};

/**
 * Inicializa a aplicação
 * Chamado quando o DOM está pronto
 */
function initializeApp() {
  console.log('🚀 Iniciando aplicação DEV GUZ Portfolio...');

  // Importa e inicializa componentes
  setupEventListeners();
  initializeScrollAnimations();
  initializeHeader();
  initializeForm();

  console.log('✅ Aplicação inicializada com sucesso!');
}

/**
 * Configura todos os ouvintes de eventos globais
 */
function setupEventListeners() {
  // Scroll
  window.addEventListener('scroll', handleScroll);
  
  // Resize
  window.addEventListener('resize', debounce(handleResize, 250));
  
  // Load
  window.addEventListener('load', handleLoad);
  
  // Trata cliques em links de âncora
  setupAnchorLinks();
  
  // Trata mobile menu
  setupMobileMenu();
}

/**
 * Manipula evento de scroll
 * Atualiza estado e dispara eventos scroll-based
 */
function handleScroll() {
  appState.scrollPosition = window.scrollY;
  
  // Atualiza header ao fazer scroll
  updateHeaderOnScroll(appState.scrollPosition);
  
  // Trigger para scroll animations (preparado para GSAP)
  triggerScrollAnimations();
}

/**
 * Manipula evento de resize
 * Atualiza layout responsivo
 */
function handleResize() {
  console.log('Window resized:', window.innerWidth, 'x', window.innerHeight);
  // Pode ser expandido para ajustar layout responsivo
}

/**
 * Manipula evento de load
 * Executado quando página está totalmente carregada
 */
function handleLoad() {
  console.log('Página carregada completamente');
  // Anima elementos ao carregar
  animateElementsOnLoad();
}

/**
 * Configura links de âncora para navegação suave
 */
function setupAnchorLinks() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Pula scroll padrão do browser
      if (href !== '#') {
        e.preventDefault();
        
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          // Atualiza URL sem reload
          window.history.pushState(null, '', href);
        }
      }
    });
  });
}

/**
 * Configura mobile menu
 */
function setupMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      appState.isMobileMenuOpen = !appState.isMobileMenuOpen;
      mobileMenuBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
    
    // Fecha menu ao clicar em um link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        appState.isMobileMenuOpen = false;
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
      });
    });
  }
}

/**
 * Anima elementos ao carregar a página
 */
function animateElementsOnLoad() {
  const elementsToAnimate = document.querySelectorAll('.animate-fade-in, .animate-slide-in-up');
  
  elementsToAnimate.forEach((el, index) => {
    // Usa função nativa ou prepara para GSAP
    el.style.animationDelay = `${index * 0.1}s`;
  });
}

/**
 * Inicializa scroll animations (preparado para GSAP)
 * Por enquanto apenas carrega as classes
 */
function initializeScrollAnimations() {
  console.log('Scroll animations initialized (ready for GSAP)');
  // Será expandido com GSAP no futuro
}

/**
 * Dispara animações baseadas em scroll (preparado para GSAP)
 */
function triggerScrollAnimations() {
  // Será implementado com GSAP no futuro
  // Por enquanto, apenas placeholder
}

/**
 * Função utilitária: Debounce
 * Evita execução múltipla de função em curto período
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Função utilitária: Throttle
 * Limita execução de função
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Log de debug (pode ser desabilitado em produção)
 */
function debugLog(message, data = null) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data || '');
  }
}

/**
 * Inicializa quando DOM está pronto
 */
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Exporta funções para uso em outros módulos
 */
window.appState = appState;
window.debounce = debounce;
window.throttle = throttle;
