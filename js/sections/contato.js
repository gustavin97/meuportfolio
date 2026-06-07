/**
 * ==========================================
 * CONTATO.JS
 * ==========================================
 * Seção "Contato".
 * Integra com componente form.js.
 * Gerencia formulário e informações de contato.
 * 
 * Funções:
 * - initializeContactSection(): Inicializa seção
 * - setupContactLinks(): Configura links de contato
 * - setupFormAnimations(): Configura animações do formulário
 * 
 * ==========================================
 */

/**
 * Inicializa a seção de Contato
 */
function initializeContactSection() {
  console.log('Contact section initialized');
  
  // Configura animações do formulário
  setupFormAnimations();
  
  // Configura links de contato (WhatsApp, Email)
  setupContactLinks();
  
  // Integra com componente form.js (já inicializado)
}

/**
 * Configura animações do formulário
 */
function setupFormAnimations() {
  const form = document.querySelector('.contact-form');
  const contactInfo = document.querySelector('.contact-info');
  
  if (form) {
    form.style.animation = 'slideInUp 0.8s ease-out';
    form.style.animationDelay = '0.2s';
    form.style.animationFillMode = 'both';
  }
  
  if (contactInfo) {
    contactInfo.style.animation = 'slideInUp 0.8s ease-out';
    contactInfo.style.animationDelay = '0.4s';
    contactInfo.style.animationFillMode = 'both';
  }
  
  // Anima campos do formulário
  animateFormFields();
}

/**
 * Anima campos do formulário com delay
 */
function animateFormFields() {
  const formGroups = document.querySelectorAll('.form-group');
  
  formGroups.forEach((group, index) => {
    group.style.animation = 'slideInUp 0.6s ease-out forwards';
    group.style.animationDelay = `${0.3 + index * 0.1}s`;
  });
}

/**
 * Configura links de contato
 * WhatsApp, Email, etc
 */
function setupContactLinks() {
  const contactItems = document.querySelectorAll('.contact-info-item a');
  
  contactItems.forEach(link => {
    const href = link.getAttribute('href');
    
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateX(4px)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = 'translateX(0)';
    });
    
    // WhatsApp link
    if (href.includes('wa.me') || href.includes('whatsapp')) {
      setupWhatsAppLink(link);
    }
    
    // Email link
    if (href.startsWith('mailto:')) {
      setupEmailLink(link);
    }
  });
}

/**
 * Configura link do WhatsApp
 * 
 * @param {HTMLElement} link - Elemento link
 */
function setupWhatsAppLink(link) {
  link.addEventListener('click', (e) => {
    console.log('WhatsApp clicado');
    // Link abrirá WhatsApp diretamente
  });
}

/**
 * Configura link de email
 * 
 * @param {HTMLElement} link - Elemento link
 */
function setupEmailLink(link) {
  link.addEventListener('click', (e) => {
    console.log('Email clicado');
    // Link abrirá cliente de email padrão
  });
}

/**
 * Configura botão de submit do formulário
 * Animações ao enviar
 */
function setupFormSubmitButton() {
  const submitBtn = document.querySelector('.form-submit button');
  
  if (!submitBtn) return;
  
  submitBtn.addEventListener('mouseenter', () => {
    submitBtn.style.transform = 'translateY(-4px)';
  });
  
  submitBtn.addEventListener('mouseleave', () => {
    submitBtn.style.transform = 'translateY(0)';
  });
}

/**
 * Contador de caracteres para textarea
 * Mostra quantos caracteres foram digitados
 */
function setupCharacterCounter() {
  const messageField = document.querySelector('textarea[name="message"]');
  
  if (!messageField) return;
  
  const maxLength = messageField.maxLength || 1000;
  
  // Cria elemento contador
  const counter = document.createElement('small');
  counter.className = 'character-counter';
  counter.style.display = 'block';
  counter.style.marginTop = 'var(--space-2)';
  counter.style.color = 'var(--color-gray)';
  counter.style.fontSize = 'var(--font-size-xs)';
  
  messageField.parentElement.appendChild(counter);
  
  // Atualiza contador ao digitar
  messageField.addEventListener('input', () => {
    const remaining = maxLength - messageField.value.length;
    counter.textContent = `${messageField.value.length}/${maxLength} caracteres`;
    
    // Muda cor se próximo do limite
    if (remaining < 100) {
      counter.style.color = 'var(--color-neon-green)';
    } else {
      counter.style.color = 'var(--color-gray)';
    }
  });
  
  // Atualiza ao carregar
  counter.textContent = `0/${maxLength} caracteres`;
}

/**
 * Mostra horário de resposta esperado
 */
function setupResponseTime() {
  const responseTime = document.querySelector('.response-time');
  
  if (responseTime) {
    // Calcula tempo baseado em horário de negócio
    const hour = new Date().getHours();
    const isBusinessHours = hour >= 9 && hour < 18;
    
    if (isBusinessHours) {
      responseTime.textContent = 'Resposta esperada em até 24 horas';
      responseTime.style.color = 'var(--color-neon-green)';
    } else {
      responseTime.textContent = 'Fora do horário comercial';
      responseTime.style.color = 'var(--color-neon-blue)';
    }
  }
}

/**
 * Analytics - rastreia submissões (futuro)
 */
function trackFormInteraction(action) {
  console.log('Form interaction tracked:', action);
  
  // TODO: Integrar com Google Analytics ou similar
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', 'form_interaction', {
  //     'action': action
  //   });
  // }
}

// Inicializa quando DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeContactSection();
    setupFormSubmitButton();
    setupCharacterCounter();
    setupResponseTime();
  });
} else {
  initializeContactSection();
  setupFormSubmitButton();
  setupCharacterCounter();
  setupResponseTime();
}
