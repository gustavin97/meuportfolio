/**
 * ==========================================
 * LIGHTBOX.JS — ESTUDO DE CASO COM FLIP
 * ==========================================
 * Clicar num projeto abre o estudo de caso completo.
 * A imagem não é duplicada: o próprio elemento é movido
 * para dentro do overlay e o Flip anima a diferença entre
 * onde ele estava e onde foi parar.
 *
 * É por isso que a transição parece contínua — não há
 * crossfade entre duas cópias, é o mesmo nó do DOM viajando.
 *
 * Acessibilidade: o overlay é um diálogo modal, prende o foco,
 * fecha no Escape e devolve o foco ao card de origem.
 * ==========================================
 */

import { projects } from '../data/site.js';
import { env } from '../core/env.js';
import { gsap, Flip, DURATION } from '../core/gsap.js';
import { startScroll, stopScroll } from '../core/scroll.js';
import { html, raw } from '../utils/dom.js';

const FOCUSABLE = 'a[href], button:not([disabled])';

class ProjectLightbox {
  constructor() {
    this.overlay = this.#buildOverlay();
    document.body.appendChild(this.overlay);

    this.isOpen = false;
    this.movedMedia = null; // elemento .project-media em trânsito
    this.originParent = null; // para onde ele volta
    this.originCard = null; // card que devolve o foco

    this.#bindGlobalEvents();
  }

  #buildOverlay() {
    const element = document.createElement('div');
    element.className = 'lightbox';
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-modal', 'true');
    element.setAttribute('aria-labelledby', 'lightbox-title');
    element.hidden = true;
    element.innerHTML = `
      <div class="lightbox-backdrop" data-lightbox-close></div>
      <div class="lightbox-panel">
        <button class="lightbox-close" aria-label="Fechar estudo de caso" data-lightbox-close>
          <span aria-hidden="true">&times;</span>
        </button>
        <div class="lightbox-media"></div>
        <div class="lightbox-body"></div>
      </div>
    `;
    return element;
  }

  #bindGlobalEvents() {
    this.overlay.addEventListener('click', (event) => {
      if (event.target.closest('[data-lightbox-close]')) this.close();
    });

    document.addEventListener('keydown', (event) => {
      if (!this.isOpen) return;

      if (event.key === 'Escape') {
        this.close();
        return;
      }

      // Prende o foco dentro do overlay enquanto ele está aberto.
      if (event.key === 'Tab') {
        const items = [...this.overlay.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent);
        if (!items.length) return;

        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /** Conteúdo textual do estudo de caso. */
  #renderBody(project) {
    const links = [];
    if (project.liveUrl) {
      links.push(
        html`<a class="btn btn-primary" href="${project.liveUrl}" target="_blank" rel="noopener noreferrer"
          ><span>Ver ao vivo</span></a
        >`,
      );
    }
    if (project.repoUrl) {
      links.push(
        html`<a class="btn btn-ghost" href="${project.repoUrl}" target="_blank" rel="noopener noreferrer"
          ><span>Ver código</span></a
        >`,
      );
    }

    return html`
      <span class="lightbox-category">${project.category}</span>
      <h3 class="lightbox-title" id="lightbox-title">${project.name}</h3>

      <div class="lightbox-case">
        <div class="lightbox-case-block">
          <h4>O problema</h4>
          <p>${project.problem}</p>
        </div>
        <div class="lightbox-case-block">
          <h4>O resultado</h4>
          <p>${project.result}</p>
        </div>
      </div>

      <dl class="lightbox-metrics">
        ${raw(
          (project.metrics ?? [])
            .map(
              (metric) => html`
                <div class="lightbox-metric">
                  <dt>${metric.value}</dt>
                  <dd>${metric.label}</dd>
                </div>
              `,
            )
            .join(''),
        )}
      </dl>

      <ul class="lightbox-tags">
        ${raw(project.tags.map((tag) => html`<li class="project-tag">${tag}</li>`).join(''))}
      </ul>

      ${links.length ? raw(html`<div class="lightbox-links">${raw(links.join(''))}</div>`) : ''}
    `;
  }

  open(card) {
    if (this.isOpen) return;

    const project = projects.find((p) => p.id === card.dataset.projectId);
    const media = card.querySelector('.project-media');
    if (!project || !media) return;

    this.isOpen = true;
    this.originCard = card;
    this.originParent = media.parentElement;

    this.overlay.querySelector('.lightbox-body').innerHTML = this.#renderBody(project);

    // Estado ANTES de mover: é a referência que o Flip usa.
    const state = Flip.getState(media);

    this.overlay.hidden = false;
    this.overlay.querySelector('.lightbox-media').appendChild(media);
    document.body.classList.add('is-lightbox-open');
    stopScroll();

    const backdrop = this.overlay.querySelector('.lightbox-backdrop');
    const panel = this.overlay.querySelector('.lightbox-panel');

    if (env.prefersReducedMotion) {
      gsap.set([backdrop, panel], { opacity: 1 });
      this.overlay.querySelector('.lightbox-close').focus();
      return;
    }

    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: DURATION.fast });

    Flip.from(state, {
      duration: DURATION.base,
      ease: 'guzInOut',
      // absolute evita que o resto do layout salte enquanto o elemento viaja.
      absolute: true,
      scale: true,
      onComplete: () => this.overlay.querySelector('.lightbox-close').focus(),
    });

    // O texto entra depois que a imagem chega.
    gsap.fromTo(
      this.overlay.querySelectorAll('.lightbox-body > *'),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: DURATION.base, ease: 'guz', stagger: 0.06, delay: 0.25 },
    );
  }

  close() {
    if (!this.isOpen || !this.originParent) return;
    this.isOpen = false;

    const media = this.overlay.querySelector('.project-media');
    const backdrop = this.overlay.querySelector('.lightbox-backdrop');

    const finish = () => {
      this.overlay.hidden = true;
      document.body.classList.remove('is-lightbox-open');
      startScroll();
      this.originCard?.querySelector('.project-open')?.focus();
      this.originParent = null;
      this.originCard = null;
    };

    if (!media) {
      finish();
      return;
    }

    // Mesmo truque na volta: mede, devolve ao lugar, anima a diferença.
    const state = Flip.getState(media);
    this.originParent.insertBefore(media, this.originParent.firstChild);

    if (env.prefersReducedMotion) {
      finish();
      return;
    }

    gsap.to(backdrop, { opacity: 0, duration: DURATION.fast, delay: 0.2 });
    gsap.to(this.overlay.querySelectorAll('.lightbox-body > *'), {
      opacity: 0,
      y: 16,
      duration: 0.3,
      ease: 'guzInOut',
    });

    Flip.from(state, {
      duration: DURATION.base,
      ease: 'guzInOut',
      absolute: true,
      scale: true,
      onComplete: finish,
    });
  }
}

let instance = null;

export function initProjectLightbox(scope = document) {
  if (!instance) instance = new ProjectLightbox();

  scope.querySelectorAll('.project-open:not([data-lightbox-ready])').forEach((button) => {
    button.setAttribute('data-lightbox-ready', '');
    button.addEventListener('click', () => {
      const card = button.closest('.project-card');
      if (card) instance.open(card);
    });
  });

  return instance;
}
