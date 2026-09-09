/**
 * ==========================================
 * DOM.JS — HELPERS DE RENDERIZAÇÃO
 * ==========================================
 */

/** Escapa texto para interpolação segura em HTML. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Template tag que escapa tudo por padrão.
 * Arrays são unidos sem separador — permite `${itens.map(...)}`.
 * Para inserir HTML já confiável, use `raw(...)`.
 */
export function html(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    if (i >= values.length) return acc + str;
    const value = values[i];

    if (value == null || value === false) return acc + str;
    if (value?.__raw) return acc + str + value.value;
    if (Array.isArray(value)) {
      return acc + str + value.map((v) => (v?.__raw ? v.value : escapeHtml(v))).join('');
    }
    return acc + str + escapeHtml(value);
  }, '');
}

/** Marca uma string como HTML confiável (já escapado ou gerado por nós). */
export const raw = (value) => ({ __raw: true, value });

export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/** Injeta markup em um container e devolve o container. */
export function mount(selector, markup) {
  const target = typeof selector === 'string' ? qs(selector) : selector;
  if (!target) return null;
  target.innerHTML = markup;
  return target;
}

/**
 * Bloco de mídia com fallback embutido.
 * Enquanto o arquivo em `src` não existir, o rótulo textual
 * aparece sobre um gradiente — o layout nunca quebra.
 */
export function media({ src, alt, fallback, className = '', ratio = '4/3' }) {
  return html`
    <div class="media ${raw(className)}" style="--media-ratio: ${raw(ratio)}">
      <span class="media-fallback" aria-hidden="true">${fallback ?? alt ?? ''}</span>
      ${src
        ? raw(
            html`<img
              class="media-img"
              src="${src}"
              alt="${alt ?? ''}"
              loading="lazy"
              decoding="async"
            />`,
          )
        : ''}
    </div>
  `;
}

/**
 * Esconde imagens que não carregaram, revelando o fallback.
 * Precisa rodar depois do mount, pois `error` não borbulha
 * — daí a captura na fase de captura.
 */
export function initMediaFallbacks(scope = document) {
  scope.addEventListener(
    'error',
    (event) => {
      const img = event.target;
      if (img.tagName === 'IMG' && img.classList.contains('media-img')) {
        img.closest('.media')?.classList.add('is-missing');
        img.remove();
      }
    },
    true,
  );
}
