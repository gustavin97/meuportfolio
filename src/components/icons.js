/**
 * ==========================================
 * ICONS.JS — INJEÇÃO DE ÍCONES
 * ==========================================
 * Lucide é importado por nome, não inteiro: só os ícones
 * realmente usados entram no bundle (o pacote completo tem
 * mais de 1500 e pesaria centenas de KB).
 *
 * Ícones de marca (GitHub, LinkedIn, Instagram) não existem
 * mais no Lucide v1, então ficam como SVG inline aqui.
 *
 * Uso no HTML: <span data-lucide="nome-do-icone"></span>
 * ==========================================
 */

import {
  ArrowUpRight,
  Atom,
  Box,
  Brain,
  Braces,
  Cloud,
  Code,
  Code2,
  Container,
  Database,
  FileCode,
  FileType2,
  Gem,
  GitBranch,
  Hexagon,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Palette,
  PenTool,
  SearchCode,
  Send,
  Sparkles,
  Terminal,
  Wind,
  Workflow,
  createIcons,
} from 'lucide';

/** Mapa no formato que o createIcons espera (PascalCase). */
const iconSet = {
  ArrowUpRight,
  Atom,
  Box,
  Brain,
  Braces,
  Cloud,
  Code,
  Code2,
  Container,
  Database,
  FileCode,
  FileType2,
  Gem,
  GitBranch,
  Hexagon,
  Image: ImageIcon,
  Loader2,
  MessageSquare,
  Palette,
  PenTool,
  SearchCode,
  Send,
  Sparkles,
  Terminal,
  Wind,
  Workflow,
};

/** SVGs de marca — 24x24, herdam a cor via currentColor. */
const brandIcons = {
  github:
    '<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.016 12.016 0 0024 12c0-6.63-5.37-12-12-12z"/>',
  linkedin:
    '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.725-2.004 1.424-.103.25-.129.599-.129.949v5.432h-3.554s.05-8.736 0-9.646h3.554v1.364c.42-.648 1.36-1.573 3.322-1.573 2.429 0 4.25 1.574 4.25 4.963v5.892zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.7 0-.943.77-1.701 1.97-1.701 1.197 0 1.914.758 1.938 1.701 0 .942-.74 1.7-1.993 1.7zm1.581 11.597H3.714V9.606h3.204v10.846zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>',
  instagram:
    '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 100-8 4 4 0 000 8zm4.965-10.322a1.44 1.44 0 110-2.881 1.44 1.44 0 010 2.881z"/>',
};

function renderBrandIcons(scope) {
  Object.entries(brandIcons).forEach(([name, path]) => {
    scope.querySelectorAll(`[data-lucide="${name}"]`).forEach((element) => {
      element.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${path}</svg>`;
      // Evita que o createIcons tente resolver o mesmo elemento depois.
      element.removeAttribute('data-lucide');
    });
  });
}

/**
 * Substitui todos os [data-lucide] do escopo por SVG.
 * Chame depois de injetar HTML novo.
 */
export function initIcons(scope = document) {
  renderBrandIcons(scope);

  createIcons({
    icons: iconSet,
    attrs: {
      width: 22,
      height: 22,
      'stroke-width': 1.75,
      'aria-hidden': 'true',
    },
  });
}
