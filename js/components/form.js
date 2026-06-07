/**
 * ==========================================
 * FORM.JS
 * ==========================================
 * Componente de formulário de contato.
 * Gerencia validação, submissão e feedback.
 * Preparado para integração com backend e APIs.
 * 
 * Funções:
 * - initializeForm(): Inicializa formulário
 * - validateForm(): Valida campos
 * - submitForm(): Envia formulário
 * - handleFormError(): Trata erros
 * 
 * ==========================================
 */

/**
 * Configurações de validação
 */
const validationRules = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z\s áéíóúàâãõñ]+$/
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 1000
  }
};

/**
 * Inicializa o formulário de contato
 */
function initializeForm() {
  console.log('Form initialized');
  
  const form = document.querySelector('.contact-form');
  
  if (!form) return;
  
  // Adiciona listener de submit
  form.addEventListener('submit', handleFormSubmit);
  
  // Valida campos em tempo real
  setupRealTimeValidation(form);
  
  // Limpa mensagens de erro ao focar no campo
  setupFieldFocusHandlers(form);
}

/**
 * Manipula submissão do formulário
 * 
 * @param {Event} e - Evento de submit
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Valida formulário
  if (!validateForm(form)) {
    console.log('Formulário inválido');
    return;
  }
  
  // Desabilita botão e mostra loading
  submitBtn.disabled = true;
  submitBtn.classList.add('loading');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Enviando...';
  
  try {
    // Coleta dados do formulário
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    console.log('Dados do formulário:', data);
    
    // Simulação de envio (será integrado com backend)
    // await sendFormToBackend(data);
    
    // Simula delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sucesso
    showFormMessage('Mensagem enviada com sucesso! Obrigado pelo contato.', 'success');
    form.reset();
    
  } catch (error) {
    console.error('Erro ao enviar formulário:', error);
    showFormMessage('Erro ao enviar mensagem. Tente novamente.', 'error');
    
  } finally {
    // Reabilita botão
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    submitBtn.textContent = originalText;
  }
}

/**
 * Valida todos os campos do formulário
 * 
 * @param {HTMLElement} form - Elemento formulário
 * @returns {boolean} - True se válido, false caso contrário
 */
function validateForm(form) {
  let isValid = true;
  const formGroups = form.querySelectorAll('.form-group');
  
  formGroups.forEach(group => {
    const input = group.querySelector('input, textarea');
    
    if (input) {
      const fieldName = input.name;
      const fieldValue = input.value.trim();
      const rules = validationRules[fieldName];
      
      // Valida campo individual
      const fieldValid = validateField(fieldName, fieldValue, rules);
      
      if (!fieldValid) {
        isValid = false;
        group.classList.add('error');
      } else {
        group.classList.remove('error');
        group.classList.add('success');
      }
    }
  });
  
  return isValid;
}

/**
 * Valida um campo individual
 * 
 * @param {string} fieldName - Nome do campo
 * @param {string} value - Valor do campo
 * @param {Object} rules - Regras de validação
 * @returns {boolean} - True se válido
 */
function validateField(fieldName, value, rules) {
  if (!rules) return true;
  
  // Validação obrigatória
  if (rules.required && !value) {
    return false;
  }
  
  // Comprimento mínimo
  if (rules.minLength && value.length < rules.minLength) {
    return false;
  }
  
  // Comprimento máximo
  if (rules.maxLength && value.length > rules.maxLength) {
    return false;
  }
  
  // Padrão regex
  if (rules.pattern && !rules.pattern.test(value)) {
    return false;
  }
  
  return true;
}

/**
 * Configura validação em tempo real
 * Valida campos ao sair do foco
 * 
 * @param {HTMLElement} form - Elemento formulário
 */
function setupRealTimeValidation(form) {
  const inputs = form.querySelectorAll('input, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      const group = input.closest('.form-group');
      const fieldName = input.name;
      const value = input.value.trim();
      const rules = validationRules[fieldName];
      
      if (validateField(fieldName, value, rules)) {
        group.classList.remove('error');
        group.classList.add('success');
      } else {
        group.classList.add('error');
        group.classList.remove('success');
      }
    });
  });
}

/**
 * Configura handlers de foco nos campos
 * Remove mensagens de erro ao focar
 * 
 * @param {HTMLElement} form - Elemento formulário
 */
function setupFieldFocusHandlers(form) {
  const inputs = form.querySelectorAll('input, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      const group = input.closest('.form-group');
      group.classList.remove('error');
      group.classList.remove('success');
    });
  });
}

/**
 * Mostra mensagem de feedback do formulário
 * 
 * @param {string} message - Texto da mensagem
 * @param {string} type - 'success' ou 'error'
 */
function showFormMessage(message, type = 'success') {
  const form = document.querySelector('.contact-form');
  
  if (!form) return;
  
  // Remove mensagens anteriores
  const oldMessage = form.querySelector('.form-message');
  if (oldMessage) {
    oldMessage.remove();
  }
  
  // Cria elemento de mensagem
  const messageEl = document.createElement('div');
  messageEl.className = `form-message ${type}`;
  messageEl.textContent = message;
  messageEl.classList.add('show');
  
  // Insere no início do formulário
  form.insertBefore(messageEl, form.firstChild);
  
  // Remove mensagem após 5 segundos
  setTimeout(() => {
    messageEl.classList.remove('show');
    setTimeout(() => messageEl.remove(), 300);
  }, 5000);
}

/**
 * Simula envio para backend (será implementado)
 * Preparado para integração com API
 * 
 * @param {Object} data - Dados do formulário
 */
async function sendFormToBackend(data) {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Erro na resposta do servidor');
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// Inicializa quando DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeForm);
} else {
  initializeForm();
}
