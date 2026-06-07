/**
 * ==========================================
 * CAROUSEL.JS
 * ==========================================
 * Componente de carrossel horizontal.
 * Utilizado na seção de Projetos.
 * Gerencia scroll horizontal e botões de navegação.
 * Preparado para transições suaves com GSAP.
 * 
 * Funções:
 * - initializeCarousel(): Inicializa carrossel
 * - scrollCarousel(): Faz scroll horizontal
 * - setupCarouselControls(): Configura botões
 * 
 * ==========================================
 */

/**
 * Inicializa todos os carrosséis na página
 */
function initializeCarousel() {
  console.log('Carousel initialized');
  
  // Encontra todos os carrosséis
  const carousels = document.querySelectorAll('.projects-carousel');
  
  carousels.forEach((carousel, index) => {
    // Adiciona ID único se não tiver
    if (!carousel.id) {
      carousel.id = `carousel-${index}`;
    }
    
    // Configura controles
    setupCarouselControls(carousel);
    
    // Adiciona event listeners para drag (futuro)
    setupCarouselDrag(carousel);
  });
}

/**
 * Configura botões de navegação do carrossel
 * 
 * @param {HTMLElement} carousel - Elemento carrossel
 */
function setupCarouselControls(carousel) {
  // Encontra wrapper do carrossel
  const wrapper = carousel.closest('.projects-wrapper');
  
  if (!wrapper) return;
  
  // Encontra ou cria controles
  let controls = wrapper.querySelector('.carousel-controls');
  
  if (!controls) {
    controls = document.createElement('div');
    controls.className = 'carousel-controls';
    controls.innerHTML = `
      <button class="carousel-btn carousel-prev" aria-label="Slide anterior">←</button>
      <button class="carousel-btn carousel-next" aria-label="Próximo slide">→</button>
    `;
    wrapper.appendChild(controls);
  }
  
  // Configura botões
  const prevBtn = controls.querySelector('.carousel-prev');
  const nextBtn = controls.querySelector('.carousel-next');
  
  prevBtn.addEventListener('click', () => scrollCarousel(carousel, 'prev'));
  nextBtn.addEventListener('click', () => scrollCarousel(carousel, 'next'));
  
  // Atualiza estado dos botões
  carousel.addEventListener('scroll', () => updateCarouselButtons(carousel, prevBtn, nextBtn));
  
  // Atualiza botões inicialmente
  updateCarouselButtons(carousel, prevBtn, nextBtn);
}

/**
 * Faz scroll do carrossel
 * 
 * @param {HTMLElement} carousel - Elemento carrossel
 * @param {string} direction - 'prev' ou 'next'
 */
function scrollCarousel(carousel, direction = 'next') {
  // Distância de scroll (tamanho do card + gap)
  const scrollDistance = carousel.offsetWidth * 0.8;
  
  const targetScroll = direction === 'next'
    ? carousel.scrollLeft + scrollDistance
    : carousel.scrollLeft - scrollDistance;
  
  // Scroll suave
  carousel.scrollTo({
    left: targetScroll,
    behavior: 'smooth'
  });
}

/**
 * Atualiza estado dos botões (habilitado/desabilitado)
 * 
 * @param {HTMLElement} carousel - Elemento carrossel
 * @param {HTMLElement} prevBtn - Botão anterior
 * @param {HTMLElement} nextBtn - Botão próximo
 */
function updateCarouselButtons(carousel, prevBtn, nextBtn) {
  const { scrollLeft, scrollWidth, offsetWidth } = carousel;
  
  // Botão anterior desabilitado se no início
  prevBtn.disabled = scrollLeft <= 0;
  
  // Botão próximo desabilitado se no fim
  nextBtn.disabled = scrollLeft + offsetWidth >= scrollWidth - 10; // 10px tolerance
}

/**
 * Configura drag para carrossel (preparado para futuro)
 * 
 * @param {HTMLElement} carousel - Elemento carrossel
 */
function setupCarouselDrag(carousel) {
  let isDown = false;
  let startX;
  let scrollLeft;
  
  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    carousel.style.cursor = 'grabbing';
  });
  
  carousel.addEventListener('mouseleave', () => {
    isDown = false;
    carousel.style.cursor = 'grab';
  });
  
  carousel.addEventListener('mouseup', () => {
    isDown = false;
    carousel.style.cursor = 'grab';
  });
  
  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    
    e.preventDefault();
    
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1; // Multiplicador de velocidade
    carousel.scrollLeft = scrollLeft - walk;
  });
  
  // Touch support
  carousel.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });
  
  carousel.addEventListener('touchend', () => {
    isDown = false;
  });
  
  carousel.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1;
    carousel.scrollLeft = scrollLeft - walk;
  });
}

/**
 * Keyboard navigation para carrossel
 */
function setupCarouselKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Encontra carrossel focado
      const focusedCarousel = document.querySelector('.projects-carousel:focus-within');
      
      if (focusedCarousel) {
        const direction = e.key === 'ArrowLeft' ? 'prev' : 'next';
        scrollCarousel(focusedCarousel, direction);
      }
    }
  });
}

// Inicializa quando DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeCarousel();
    setupCarouselKeyboard();
  });
} else {
  initializeCarousel();
  setupCarouselKeyboard();
}
