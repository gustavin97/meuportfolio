/**
 * ==========================================
 * HEADER.JS
 * ==========================================
 * Componente responsável pela navegação do header.
 * Gerencia estilo do header ao fazer scroll.
 * Prepara efeitos visuales como glassmorphism.
 * 
 * Funções:
 * - initializeHeader(): Inicializa componente
 * - updateHeaderOnScroll(): Atualiza estilo durante scroll
 * - updateActiveNavLink(): Atualiza link ativo da navegação
 * 
 * ==========================================
 */

/**
 * Inicializa o componente header
 */
function initializeHeader() {
  console.log('Header initialized');
  
  // Configura comportamento inicial
  updateHeaderOnScroll(0);
  
  // Adiciona listeners para mudanças de scroll
  window.addEventListener('scroll', throttleUpdateHeader);
}

/**
 * Throttle para updateHeaderOnScroll
 */
let lastScrollPosition = 0;
const throttleUpdateHeader = throttle(() => {
  updateHeaderOnScroll(window.scrollY);
}, 50);

/**
 * Atualiza o estilo do header baseado na posição do scroll
 * Aplica classe 'scrolled' quando usuário faz scroll
 * Preparado para blur effect e glassmorphism
 * 
 * @param {number} scrollPosition - Posição atual do scroll em pixels
 */
function updateHeaderOnScroll(scrollPosition) {
  const header = document.querySelector('header');
  
  if (!header) return;
  
  // Threshold para ativar efeito (50px)
  const scrollThreshold = 50;
  
  if (scrollPosition > scrollThreshold) {
    // Ativa blur effect
    header.classList.add('scrolled');
    
    // Prepara para blur effect futuro
    // header.style.backdropFilter = 'blur(10px)';
  } else {
    // Remove blur effect
    header.classList.remove('scrolled');
    
    // header.style.backdropFilter = 'blur(0px)';
  }
  
  // Atualiza link ativo da navegação
  updateActiveNavLink(scrollPosition);
  
  lastScrollPosition = scrollPosition;
}

/**
 * Atualiza qual link de navegação está ativo
 * Baseado na seção visível na tela
 * 
 * @param {number} scrollPosition - Posição atual do scroll
 */
function updateActiveNavLink(scrollPosition) {
  const navLinks = document.querySelectorAll('nav a');
  
  if (navLinks.length === 0) return;
  
  // IDs das seções
  const sections = ['hero', 'about', 'timeline', 'formations', 'technologies', 'platforms', 'projects', 'contact'];
  
  // Encontra seção atual visível
  let currentSection = sections[0];
  
  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    
    if (section) {
      const { top } = section.getBoundingClientRect();
      
      // Se seção está próxima ao topo da viewport (200px de margem)
      if (top <= 200) {
        currentSection = sectionId;
      }
    }
  });
  
  // Remove classe ativa de todos os links
  navLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  // Adiciona classe ativa no link correspondente
  const activeLink = document.querySelector(`nav a[href="#${currentSection}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

/**
 * Aplica efeito de logo hover
 * Expande/contrai logo ao hover
 */
function setupLogoInteraction() {
  const logo = document.querySelector('.header-logo');
  
  if (!logo) return;
  
  logo.addEventListener('click', () => {
    // Scroll para top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  logo.addEventListener('mouseenter', () => {
    logo.style.transform = 'scale(1.05)';
  });
  
  logo.addEventListener('mouseleave', () => {
    logo.style.transform = 'scale(1)';
  });
}

// Inicializa logo interaction quando header for criado
setupLogoInteraction();
