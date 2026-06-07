/**
 * ==========================================
 * PROJETOS.JS
 * ==========================================
 * Seção "Projetos".
 * Gerencia carrossel de projetos e interações.
 * Integra com componente carousel.js.
 * 
 * Funções:
 * - initializeProjectsSection(): Inicializa seção
 * - setupProjectCardAnimations(): Configura animações
 * - setupProjectLinks(): Configura links de projetos
 * 
 * ==========================================
 */

/**
 * Inicializa a seção de Projetos
 */
function initializeProjectsSection() {
  console.log('Projects section initialized');
  
  // Configura animações dos cards
  setupProjectCardAnimations();
  
  // Configura links de projetos
  setupProjectLinks();
  
  // Gerencia carrossel (já inicializado no carousel.js)
  // Aqui apenas adiciona lógica específica da seção
}

/**
 * Configura animações de entrada dos cards de projeto
 */
function setupProjectCardAnimations() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach((card, index) => {
    // Adiciona animação de entrada com delay
    card.style.animation = 'slideInUp 0.6s ease-out forwards';
    card.style.animationDelay = `${0.1 + (index % 3) * 0.1}s`;
  });
}

/**
 * Configura interações dos links de projetos
 */
function setupProjectLinks() {
  const projectLinks = document.querySelectorAll('.project-link');
  
  projectLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateX(4px)';
      link.style.color = 'var(--color-neon-blue)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = 'translateX(0)';
      link.style.color = 'var(--color-neon-green)';
    });
  });
}

/**
 * Configura tags de projeto
 * Prepara para filtro futuro
 */
function setupProjectTags() {
  const tags = document.querySelectorAll('.project-tag');
  
  tags.forEach(tag => {
    tag.style.cursor = 'pointer';
    
    tag.addEventListener('click', () => {
      const tagName = tag.textContent.trim();
      console.log('Filtrar por tag:', tagName);
      
      // TODO: Implementar filtro por tag
      // - Animar transição
      // - Mostrar/esconder cards
      // - Atualizar carrossel
    });
    
    tag.addEventListener('mouseenter', () => {
      tag.style.background = 'var(--color-neon-green)';
      tag.style.color = 'var(--color-black)';
    });
    
    tag.addEventListener('mouseleave', () => {
      tag.style.background = 'var(--color-green-transparent)';
      tag.style.color = 'var(--color-neon-green)';
    });
  });
}

/**
 * Lazy load para imagens de projetos
 */
function setupProjectImageLazyLoad() {
  const images = document.querySelectorAll('.project-image img');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.loading = 'lazy';
          }
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    images.forEach(img => observer.observe(img));
  }
}

/**
 * Gerencia estado do carrossel
 * Atualiza informações como índice atual
 */
function setupCarouselStateManagement() {
  const carousel = document.querySelector('.projects-carousel');
  
  if (!carousel) return;
  
  let currentIndex = 0;
  const cards = carousel.querySelectorAll('.project-card');
  
  carousel.addEventListener('scroll', () => {
    const scrollLeft = carousel.scrollLeft;
    const cardWidth = cards[0]?.offsetWidth || 300;
    const gap = 32; // var(--space-8) em pixels
    
    const newIndex = Math.round(scrollLeft / (cardWidth + gap));
    
    if (newIndex !== currentIndex) {
      currentIndex = newIndex;
      console.log(`Carrossel no índice: ${currentIndex + 1} de ${cards.length}`);
    }
  });
}

/**
 * Adiciona mais projetos dinamicamente (futuro)
 */
function setupLoadMoreProjects() {
  console.log('Load more projects feature prepared for future');
  
  // TODO: Implementar carregamento de mais projetos
  // - Botão "Carregar mais"
  // - Fetch de dados de API
  // - Adicionar cards ao carrossel
  // - Animar novos cards
}

/**
 * Share de projeto (futuro)
 */
function setupProjectSharing() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    // Prepara para compartilhamento
    card.dataset.shareUrl = window.location.href;
    card.dataset.shareTitle = card.querySelector('.project-name')?.textContent || 'Projeto';
  });
}

// Inicializa quando DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeProjectsSection();
    setupProjectTags();
    setupProjectImageLazyLoad();
    setupCarouselStateManagement();
  });
} else {
  initializeProjectsSection();
  setupProjectTags();
  setupProjectImageLazyLoad();
  setupCarouselStateManagement();
}
