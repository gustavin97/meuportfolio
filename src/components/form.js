/**
 * ==========================================
 * FORM.JS — FORMULÁRIO DE CONTATO
 * ==========================================
 * Validação acessível (aria-invalid + mensagem ligada por
 * aria-describedby) e envio real para o endpoint definido
 * em VITE_CONTACT_ENDPOINT (.env).
 *
 * Sem endpoint configurado, o botão cai para um mailto:
 * — melhor um caminho que funciona do que um sucesso falso.
 * ==========================================
 */

import { profile } from '../data/site.js';
import { gsap } from '../core/scroll.js';
import { env } from '../core/env.js';

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || '';

const rules = {
  name: {
    validate: (v) => v.trim().length >= 3 && v.trim().length <= 100,
    message: 'Informe seu nome (3 a 100 caracteres).',
  },
  email: {
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    message: 'Informe um e-mail válido.',
  },
  message: {
    validate: (v) => v.trim().length >= 10 && v.trim().length <= 1000,
    message: 'A mensagem precisa ter entre 10 e 1000 caracteres.',
  },
};

function setFieldState(field, isValid, message) {
  const group = field.closest('.form-group');
  if (!group) return;

  group.classList.toggle('is-invalid', !isValid);
  group.classList.toggle('is-valid', isValid);
  field.setAttribute('aria-invalid', String(!isValid));

  const error = group.querySelector('.form-error');
  if (error) error.textContent = isValid ? '' : message;
}

function validateField(field) {
  const rule = rules[field.name];
  if (!rule) return true;

  const isValid = rule.validate(field.value);
  setFieldState(field, isValid, rule.message);
  return isValid;
}

/** Mensagem de status abaixo do formulário, anunciada por leitores de tela. */
function setStatus(form, type, text) {
  const status = form.querySelector('.form-status');
  if (!status) return;

  status.className = `form-status is-${type}`;
  status.textContent = text;

  if (!env.prefersReducedMotion) {
    gsap.fromTo(status, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  }
}

/** Abre o cliente de e-mail com a mensagem já preenchida. */
function fallbackToMailto(data) {
  const subject = encodeURIComponent(`Contato pelo site — ${data.name}`);
  const body = encodeURIComponent(`${data.message}\n\n—\n${data.name}\n${data.email}`);
  window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
}

async function submitForm(form, data) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Endpoint respondeu ${response.status}`);
  }
  return response;
}

export function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const fields = [...form.querySelectorAll('input, textarea')].filter((f) => rules[f.name]);
  const button = form.querySelector('button[type="submit"]');

  // Valida ao sair do campo; depois disso, valida a cada tecla.
  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.form-group')?.classList.contains('is-invalid')) validateField(field);
    });
  });

  // Contador de caracteres da mensagem.
  const message = form.querySelector('[name="message"]');
  const counter = form.querySelector('.form-counter');
  if (message && counter) {
    const max = message.maxLength > 0 ? message.maxLength : 1000;
    const update = () => {
      counter.textContent = `${message.value.length}/${max}`;
    };
    message.addEventListener('input', update);
    update();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const results = fields.map((field) => validateField(field));
    if (results.includes(false)) {
      const firstInvalid = fields.find((field) => field.getAttribute('aria-invalid') === 'true');
      firstInvalid?.focus();
      setStatus(form, 'error', 'Revise os campos destacados antes de enviar.');
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    // Honeypot: bots preenchem campos escondidos; humanos não.
    if (data._gotcha) return;
    delete data._gotcha;

    if (!ENDPOINT) {
      setStatus(form, 'info', 'Abrindo seu cliente de e-mail...');
      fallbackToMailto(data);
      return;
    }

    form.classList.add('is-submitting');
    button.disabled = true;
    setStatus(form, 'info', 'Enviando sua mensagem...');

    try {
      await submitForm(form, data);
      form.reset();
      fields.forEach((field) => field.closest('.form-group')?.classList.remove('is-valid', 'is-invalid'));
      counter?.dispatchEvent(new Event('input'));
      setStatus(form, 'success', 'Mensagem enviada. Retorno em até 24h úteis.');
    } catch (error) {
      console.error('[form] falha no envio:', error);
      setStatus(
        form,
        'error',
        `Não consegui enviar agora. Fale direto em ${profile.email} ou tente novamente.`,
      );
    } finally {
      form.classList.remove('is-submitting');
      button.disabled = false;
    }
  });
}
