/**
 * ==========================================
 * SMOKE-TEST.MJS
 * ==========================================
 * Roda o pipeline de renderização em um DOM falso (jsdom)
 * e confere que cada seção produziu a quantidade de elementos
 * esperada a partir de src/data/site.js.
 *
 * Pega a classe de erro mais comum neste projeto: mexer nos
 * dados ou no render e quebrar uma seção sem perceber, porque
 * a página só monta no browser.
 *
 * Não cobre WebGL nem animação — jsdom não tem canvas nem layout.
 *
 * Uso: npm test
 * ==========================================
 */

import fs from 'node:fs';
import { JSDOM } from 'jsdom';

import {
  formations,
  navigation,
  platforms,
  projects,
  socials,
  stats,
  techCategories,
  timeline,
  about,
} from '../src/data/site.js';

/* ==================== AMBIENTE ==================== */

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost/', pretendToBeVisual: true });

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Event = dom.window.Event;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
// O IntersectionObserver não existe no jsdom e não é o que estamos testando.
global.IntersectionObserver = class {
  observe() {}
  disconnect() {}
};

/* ==================== EXECUÇÃO ==================== */

const { renderAll } = await import('../src/sections/render.js');
const { initMediaFallbacks } = await import('../src/utils/dom.js');
const { initIcons } = await import('../src/components/icons.js');

renderAll();
initMediaFallbacks();
initIcons();

/* ==================== VERIFICAÇÕES ==================== */

const doc = dom.window.document;
const errors = [];

/** Conta elementos e compara com o total esperado vindo dos dados. */
function expect(label, selector, expected) {
  const found = doc.querySelectorAll(selector).length;
  const ok = found === expected;
  console.log(`${ok ? '  ok  ' : ' FALHA'} ${label.padEnd(26)} ${found}/${expected}`);
  if (!ok) errors.push(`${label}: esperado ${expected}, encontrado ${found}`);
}

const techCount = techCategories.reduce((sum, c) => sum + c.items.length, 0);
const metricCount = projects.reduce((sum, p) => sum + (p.metrics?.length ?? 0), 0);
const mediaCount =
  about.gallery.length + formations.length + platforms.length + projects.length;

console.log('\nRenderização das seções\n');

expect('links de navegação', '.nav-link', navigation.length);
expect('links menu mobile', '.mobile-nav-link', navigation.length);
expect('métricas do hero', '.hero-stat', stats.length);
expect('contadores animados', '[data-counter]', stats.length);
expect('fotos da galeria', '.gallery-item', about.gallery.length);
expect('itens da jornada', '.timeline-item', timeline.length);
expect('cards de formação', '.formation-card', formations.length);
expect('chips de tecnologia', '.tech-item', techCount);
expect('cards de plataforma', '.platform-card', platforms.length);
expect('cards de projeto', '.project-card', projects.length);
expect('métricas de projeto', '.project-metric', metricCount);
expect('blocos de mídia', '.media', mediaCount);
expect('fallbacks de mídia', '.media-fallback', mediaCount);
expect('links sociais', '.social-links a', socials.length);

console.log('\nÍcones e integridade\n');

// Todo [data-lucide] deve ter virado (ou contido) um SVG.
const unresolved = [...doc.querySelectorAll('[data-lucide]')].filter(
  (el) => el.tagName.toLowerCase() !== 'svg' && !el.querySelector('svg'),
);
console.log(`${unresolved.length === 0 ? '  ok  ' : ' FALHA'} ícones não resolvidos     ${unresolved.length}`);
if (unresolved.length) {
  errors.push(`ícones sem SVG: ${unresolved.map((e) => e.dataset.lucide).join(', ')}`);
}

// A caixa .tech-icon precisa sobreviver à substituição feita pelo Lucide.
const techIcon = doc.querySelector('.tech-icon');
const iconBoxOk = techIcon?.tagName.toLowerCase() === 'span' && !!techIcon.querySelector('svg');
console.log(`${iconBoxOk ? '  ok  ' : ' FALHA'} caixa do ícone preservada`);
if (!iconBoxOk) errors.push('.tech-icon deixou de ser o container do SVG');

// Escape do template: nada de objeto virando texto nem HTML escapado à toa.
if (doc.body.textContent.includes('[object Object]')) {
  errors.push('"[object Object]" apareceu no texto renderizado');
}
if (doc.body.innerHTML.includes('&lt;span')) {
  errors.push('HTML foi escapado por engano (falta raw())');
}

/* ==================== RESULTADO ==================== */

if (errors.length) {
  console.error(`\n${errors.length} falha(s):`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('\nSmoke test passou.\n');
