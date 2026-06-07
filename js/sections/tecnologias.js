/**
 * ==========================================
 * TECNOLOGIAS.JS
 * ==========================================
 * Seção "Tecnologias".
 * Gerencia animações dos cards de tecnologia.
 * Preparado para efectos hover avançados com GSAP.
 * 
 * Funções:
 * - initializeTechnologiesSection(): Inicializa seção
 * - setupTechCardAnimations(): Configura animações dos cards
 * - setupTechHoverEffects(): Configura efeitos hover
 * 
 * ==========================================
 */

/**
 * Inicializa a seção de Tecnologias
 */
function initializeTechnologiesSection() {
  console.log('Technologies section initialized');
  
  // Configura animações dos cards
  setupTechCardAnimations();
  
  // Configura hover effects
  setupTechHoverEffects();
  
  // Categoriza tecnologias (futuro: filtro)
  setupTechCategoryFilter();
}

/**
 * Configura animações de entrada dos cards de tecnologia
 */
function setupTechCardAnimations() {
  const techItems = document.querySelectorAll('.tech-item');
  
  techItems.forEach((item, index) => {
    // Adiciona animação de entrada com delay
    item.style.animation = 'scaleIn 0.6s ease-out forwards';
    item.style.animationDelay = `${(index % 8) * 0.05}s`;
  });
}

/**
 * Configura efeitos hover nos cards de tecnologia
 * Preparado para GSAP no futuro
 */
function setupTechHoverEffects() {
  const techItems = document.querySelectorAll('.tech-item');
  
  techItems.forEach(item => {
    const icon = item.querySelector('.tech-icon');
    
    item.addEventListener('mouseenter', () => {
      // Efeito de escala
      item.style.transform = 'translateY(-8px) scale(1.05)';
      
      // Anima ícone
      if (icon) {
        icon.style.transform = 'rotate(5deg) scale(1.1)';
        icon.style.filter = 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))';
      }
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateY(0) scale(1)';
      
      if (icon) {
        icon.style.transform = 'rotate(0) scale(1)';
        icon.style.filter = 'drop-shadow(0 0 0px transparent)';
      }
    });
  });
}

/**
 * Prepara filtro de categorias (futuro)
 * Será implementado quando feature de filtro for adicionada
 */
function setupTechCategoryFilter() {
  console.log('Tech category filter prepared for future implementation');
  
  // Será expandido para:
  // - Criar botões de filtro
  // - Filtrar cards por categoria
  // - Animar transições
}

/**
 * Conta e exibe número de tecnologias
 */
function displayTechStats() {
  const categories = ['category-tecnologias', 'category-ias', 'category-ferramentas'];
  
  categories.forEach(category => {
    const items = document.querySelectorAll(`.tech-category.${category} .tech-item`);
    console.log(`${category}: ${items.length} itens`);
  });
}

/**
 * Glow animation para ícones (preparado para GSAP)
 */
function setupGlowAnimation() {
  const icons = document.querySelectorAll('.tech-icon');
  
  icons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      icon.classList.add('glow-active');
    });
    
    icon.addEventListener('mouseleave', () => {
      icon.classList.remove('glow-active');
    });
  });
}

// Inicializa quando DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeTechnologiesSection();
    displayTechStats();
    setupGlowAnimation();
  });
} else {
  initializeTechnologiesSection();
  displayTechStats();
  setupGlowAnimation();
}
