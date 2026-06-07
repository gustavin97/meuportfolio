/**
 * ==========================================
 * SOBRE.JS
 * ==========================================
 * Seção "Sobre o Dev Guz".
 * Gerencia galeria de imagens e animações da seção.
 * 
 * Funções:
 * - initializeAboutSection(): Inicializa seção
 * - setupGalleryInteraction(): Configura interação da galeria
 * - setupGalleryLightbox(): Prepara lightbox para futuro
 * 
 * ==========================================
 */

/**
 * Inicializa a seção About
 */
function initializeAboutSection() {
  console.log('About section initialized');
  
  // Configura interações da galeria
  setupGalleryInteraction();
  
  // Anima elementos ao scroll (preparado para GSAP)
  setupAboutAnimations();
}

/**
 * Configura interações da galeria
 * Hover effects e animações
 */
function setupGalleryInteraction() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach((item, index) => {
    // Adiciona delay de animação
    item.style.animation = 'slideInUp 0.6s ease-out forwards';
    item.style.animationDelay = `${0.1 + index * 0.1}s`;
    
    // Hover effect
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateY(-8px)';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateY(0)';
    });
    
    // Prepara para lightbox (futuro)
    item.addEventListener('click', () => {
      openGalleryLightbox(item);
    });
  });
}

/**
 * Abre lightbox de galeria (preparado para futuro)
 * 
 * @param {HTMLElement} item - Elemento da galeria
 */
function openGalleryLightbox(item) {
  console.log('Lightbox click - preparado para implementação futura');
  
  // Será implementado com biblioteca de lightbox
  // Exemplo: GLightbox, PhotoSwipe, Fancybox
  
  const img = item.querySelector('img');
  if (img) {
    console.log('Imagem clicada:', img.src);
    // TODO: Abrir lightbox
  }
}

/**
 * Configura animações da seção about
 * Preparado para GSAP ScrollTrigger
 */
function setupAboutAnimations() {
  const aboutContent = document.querySelector('.about-content');
  const aboutGallery = document.querySelector('.about-gallery');
  
  if (aboutContent) {
    aboutContent.style.animation = 'slideInLeft 0.8s ease-out forwards';
  }
  
  if (aboutGallery) {
    aboutGallery.style.animation = 'slideInRight 0.8s ease-out forwards';
  }
  
  // Anima highlight cards
  setupHighlightCards();
}

/**
 * Anima highlight cards
 */
function setupHighlightCards() {
  const cards = document.querySelectorAll('.highlight-card');
  
  cards.forEach((card, index) => {
    card.style.animation = 'scaleIn 0.6s ease-out forwards';
    card.style.animationDelay = `${0.2 + index * 0.1}s`;
    
    // Hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.05)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
    });
  });
}

/**
 * Lazy load para imagens da galeria
 * Carrega imagens quando estiverem visíveis
 */
function setupGalleryLazyLoad() {
  const images = document.querySelectorAll('.gallery-item img');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => observer.observe(img));
  }
}

// Inicializa quando DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeAboutSection();
    setupGalleryLazyLoad();
  });
} else {
  initializeAboutSection();
  setupGalleryLazyLoad();
}
